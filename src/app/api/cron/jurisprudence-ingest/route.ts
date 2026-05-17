import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { jurisprudenceCases, jurisprudenceIngestLog } from "@/db/schema/jurisprudence-table";
import { sql } from "drizzle-orm";

const CRON_SECRET = process.env.CRON_SECRET;

interface EurLexResult {
  id: string;
  name: string;
  citation: string;
  year: number;
  summary: string;
  url: string;
  celex: string;
}

interface HudocResult {
  appno: string;
  docname: string;
  judgementdate: string;
  respondent: string;
  conclusion: string;
  importance: string;
  docurl: string;
}

async function fetchEurLexAICases(): Promise<EurLexResult[]> {
  const sparql = `
    PREFIX cdm: <http://publications.europa.eu/ontology/cdm#>
    PREFIX dc: <http://purl.org/dc/elements/1.1/>
    SELECT DISTINCT ?work ?title ?celex ?date WHERE {
      ?work cdm:work_has_resource-type <http://publications.europa.eu/resource/authority/resource-type/JUDG>;
            cdm:case-law_originates_in_court_or_tribunal <http://publications.europa.eu/resource/authority/corporate-body/CJEU>;
            cdm:work_date_document ?date;
            dc:title ?title;
            cdm:resource_legal_id_celex ?celex.
      FILTER(xsd:integer(SUBSTR(STR(?date), 1, 4)) >= 2010)
      FILTER(
        CONTAINS(LCASE(STR(?title)), "data") ||
        CONTAINS(LCASE(STR(?title)), "artificial") ||
        CONTAINS(LCASE(STR(?title)), "algorithmic") ||
        CONTAINS(LCASE(STR(?title)), "profiling") ||
        CONTAINS(LCASE(STR(?title)), "automated") ||
        CONTAINS(LCASE(STR(?title)), "biometric")
      )
    }
    ORDER BY DESC(?date)
    LIMIT 50
  `.trim();

  const endpoint = "https://publications.europa.eu/webapi/rdf/sparql";
  const res = await fetch(
    `${endpoint}?query=${encodeURIComponent(sparql)}&format=application%2Fsparql-results%2Bjson`,
    {
      headers: { Accept: "application/sparql-results+json" },
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  const bindings = data?.results?.bindings ?? [];

  return bindings.map((b: Record<string, { value: string }>) => ({
    id: `eurlex-${b.celex?.value ?? b.work?.value.split("/").pop()}`,
    name: b.title?.value ?? "Unknown",
    citation: b.celex?.value ?? "",
    year: parseInt(b.date?.value?.slice(0, 4) ?? "2000", 10),
    summary: `CJEU judgment — ${b.title?.value ?? ""}`,
    url: `https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:${b.celex?.value}`,
    celex: b.celex?.value ?? "",
  }));
}

async function fetchHudocAICases(): Promise<HudocResult[]> {
  const params = new URLSearchParams({
    query:
      "(doctype=GRANDCHAMBER OR doctype=CHAMBER) AND " +
      "(kpdate>=2015-01-01) AND " +
      "(article=8 OR article=6) AND " +
      "(kpthesaurus=surveillance OR kpthesaurus=data OR kpthesaurus=biometric)",
    select:
      "appno,docname,judgementdate,respondent,conclusion,importance,docurl",
    sort: "judgementdate Descending",
    start: "0",
    length: "50",
    rankingModelType: "EMPTY",
  });

  const res = await fetch(
    `https://hudoc.echr.coe.int/app/query/results?${params}`,
    {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(20_000),
    }
  );

  if (!res.ok) return [];

  const data = await res.json();
  return data?.results?.result ?? [];
}

function mapHudocImportance(imp: string): "binding" | "persuasive" | "illustrative" {
  if (imp === "1") return "binding";
  if (imp === "2") return "persuasive";
  return "illustrative";
}

function extractCountryFromRespondent(respondent: string): string | null {
  const map: Record<string, string> = {
    France: "FR", Germany: "DE", "United Kingdom": "GB", Netherlands: "NL",
    Belgium: "BE", Italy: "IT", Spain: "ES", Poland: "PL", Sweden: "SE",
    Denmark: "DK", Finland: "FI", Austria: "AT", Romania: "RO",
    Hungary: "HU", Portugal: "PT", Greece: "GR", "Czech Republic": "CZ",
    Slovakia: "SK", Bulgaria: "BG", Croatia: "HR", Ireland: "IE",
    Luxembourg: "LU", Malta: "MT", Cyprus: "CY", Slovenia: "SI",
    Estonia: "EE", Latvia: "LV", Lithuania: "LT", Norway: "NO",
    Switzerland: "CH", Iceland: "IS", Turkey: "TR", Russia: "RU",
    Ukraine: "UA",
  };
  for (const [name, code] of Object.entries(map)) {
    if (respondent?.includes(name)) return code;
  }
  return null;
}

export async function GET(request: NextRequest) {
  if (CRON_SECRET) {
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
  }

  const [log] = await db
    .insert(jurisprudenceIngestLog)
    .values({ source: "eurlex" })
    .returning();

  let inserted = 0;
  let updated = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  try {
    const [eurLexResults, hudocResults] = await Promise.allSettled([
      fetchEurLexAICases(),
      fetchHudocAICases(),
    ]);

    if (eurLexResults.status === "fulfilled") {
      for (const c of eurLexResults.value) {
        try {
          await db
            .insert(jurisprudenceCases)
            .values({
              id: c.id,
              court: "CJEU",
              name: c.name,
              citation: c.citation,
              year: c.year,
              country: null,
              summary: c.summary,
              holding: "Pending manual review.",
              relevance: "binding",
              rightsCategories: ["data_protection"],
              aiActArticles: [],
              sectors: [],
              keywords: [],
              url: c.url,
              ingestSource: "eurlex",
              externalId: c.celex,
              isActive: false,
            })
            .onConflictDoUpdate({
              target: [jurisprudenceCases.externalId, jurisprudenceCases.ingestSource],
              set: {
                name: sql`excluded.name`,
                url: sql`excluded.url`,
                updatedAt: sql`NOW()`,
              },
            });
          inserted++;
        } catch (err) {
          errors++;
          errorDetails.push(`eurlex:${c.id}: ${String(err)}`);
        }
      }
    }

    if (hudocResults.status === "fulfilled") {
      for (const h of hudocResults.value) {
        const appno = Array.isArray(h.appno) ? h.appno[0] : h.appno;
        const id = `hudoc-${appno?.replace(/[^a-z0-9]/gi, "-").toLowerCase()}`;
        const year = parseInt(h.judgementdate?.slice(0, 4) ?? "2000", 10);

        try {
          await db
            .insert(jurisprudenceCases)
            .values({
              id,
              court: "ECHR",
              name: h.docname ?? "Unknown",
              citation: appno ?? "",
              year,
              country: extractCountryFromRespondent(h.respondent ?? ""),
              summary: h.conclusion ?? "Pending review.",
              holding: "Pending manual review.",
              relevance: mapHudocImportance(h.importance ?? "3"),
              rightsCategories: ["private_life"],
              aiActArticles: [],
              sectors: [],
              keywords: [],
              url: h.docurl ?? null,
              ingestSource: "hudoc",
              externalId: appno ?? null,
              isActive: false,
            })
            .onConflictDoUpdate({
              target: [jurisprudenceCases.externalId, jurisprudenceCases.ingestSource],
              set: {
                name: sql`excluded.name`,
                updatedAt: sql`NOW()`,
              },
            });
          inserted++;
        } catch (err) {
          errors++;
          errorDetails.push(`hudoc:${appno}: ${String(err)}`);
        }
      }
    }
  } catch (err) {
    errors++;
    errorDetails.push(`fatal: ${String(err)}`);
  }

  await db
    .update(jurisprudenceIngestLog)
    .set({
      completedAt: new Date(),
      inserted,
      updated,
      skipped: 0,
      errors,
      errorDetails,
    })
    .where(sql`id = ${log.id}`);

  return NextResponse.json({ inserted, updated, errors, errorDetails });
}
