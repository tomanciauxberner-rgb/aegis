import { NextRequest, NextResponse } from "next/server";
import { insertSignals, buildExternalId } from "@/lib/signal-inserter";

const WP_API = "https://artificialintelligenceact.eu/wp-json/wp/v2/posts?per_page=20&_fields=id,title,link,excerpt,date";

const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

async function fetchPosts(): Promise<{ id: number; title: string; link: string; excerpt: string; date: string }[]> {
  const res = await fetch(WP_API, {
    headers: { "User-Agent": "Aegis-Intelligence-Bot/1.0" },
    signal: AbortSignal.timeout(10000),
  });
  if (!res.ok) throw new Error(`WP API failed: ${res.status}`);
  const posts = await res.json();
  return posts.map((p: any) => ({
    id: p.id,
    title: p.title?.rendered ?? "",
    link: p.link ?? "",
    excerpt: (p.excerpt?.rendered ?? "").replace(/<[^>]+>/g, "").slice(0, 500),
    date: p.date ?? "",
  }));
}

async function parseWithClaude(posts: { id: number; title: string; link: string; excerpt: string; date: string }[]): Promise<{
  country: string;
  group_id: string;
  sector: string;
  severity: "critical" | "elevated" | "watch";
  title: string;
  summary: string;
  year: number;
  url: string;
  external_id_suffix: string;
}[]> {
  const prompt = `You are an EU fundamental rights analyst. Analyze these EU AI Act articles and extract only those that describe a concrete legislative development, national implementation measure, or Annex III high-risk AI system declaration affecting an EU27 member state and a specific population group.

Focus on: national AI strategies, Annex III declarations, enforcement actions, country-specific compliance issues, AI systems deployed in employment/justice/benefits/healthcare affecting minorities or vulnerable groups.

EU27 countries: Austria (AT), Belgium (BE), Bulgaria (BG), Croatia (HR), Cyprus (CY), Czechia (CZ), Denmark (DK), Estonia (EE), Finland (FI), France (FR), Germany (DE), Greece (GR), Hungary (HU), Ireland (IE), Italy (IT), Latvia (LV), Lithuania (LT), Luxembourg (LU), Malta (MT), Netherlands (NL), Poland (PL), Portugal (PT), Romania (RO), Slovakia (SK), Slovenia (SI), Spain (ES), Sweden (SE).

For each relevant item extract:
- country: ISO 2-letter code (EU27 only — use "EU" if affects all member states, skip if no specific country)
- group_id: one of: african_descent, roma, muslims, lgbtiq, women, disabilities, migrants, jews, general
- sector: one of: employment, education, housing, healthcare, law_enforcement, essential_services, online, justice
- severity: critical (enforcement/violation), elevated (declaration/implementation), watch (guidance/consultation)
- title: concise factual title max 100 chars
- summary: 1-2 sentences factual max 200 chars
- year: publication year as integer
- url: article link
- external_id_suffix: slug max 50 chars

Skip purely technical or legal commentary articles with no country/group specificity.
Respond ONLY with a JSON array. Empty array if nothing relevant. No markdown, no preamble.

ARTICLES:
${posts.map((p, i) => `[${i}] TITLE: ${p.title}\nURL: ${p.link}\nDATE: ${p.date}\nEXCERPT: ${p.excerpt}`).join("\n\n")}`;

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY ?? "",
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 2048,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) throw new Error(`Anthropic error: ${res.status}`);
  const data = await res.json();
  const raw = data.content?.[0]?.text ?? "[]";
  const clean = raw.replace(/```json|```/g, "").trim();
  return JSON.parse(clean);
}

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const posts = await fetchPosts();
    if (!posts.length) {
      return NextResponse.json({ processed: 0, inserted: 0, skipped: 0, errors: [], timestamp: new Date().toISOString() });
    }

    const parsed = await parseWithClaude(posts);
    const valid = parsed.filter((p) => EU27.has(p.country) || p.country === "EU");

    const signals = valid.map((p) => ({
      country: p.country === "EU" ? "EU" : p.country,
      group_id: p.group_id,
      sector: p.sector,
      signal_type: "legislative" as const,
      severity: p.severity,
      title: p.title,
      summary: p.summary,
      source_label: "EU AI Act — artificialintelligenceact.eu",
      source_url: p.url,
      year_observed: p.year,
      external_id: buildExternalId("aiact", p.country, p.external_id_suffix),
    })).filter((s) => EU27.has(s.country));

    const result = signals.length > 0
      ? await insertSignals(signals)
      : { inserted: 0, skipped: 0, errors: [] };

    return NextResponse.json({
      processed: posts.length,
      extracted: valid.length,
      ...result,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "Unknown error";
    console.error("[cron/aiact]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
