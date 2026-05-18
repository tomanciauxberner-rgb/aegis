import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/db/client";
import { jurisprudenceCases } from "@/db/schema/jurisprudence-table";
import { rateLimit } from "@/lib/rate-limit";
import { sql, and, eq, gte, lte, inArray, or } from "drizzle-orm";
import type { JurisprudenceResponse, Court } from "@/types/jurisprudence";

const QuerySchema = z.object({
  categories: z.string().optional(),
  sectors: z.string().optional(),
  courts: z.string().optional(),
  countries: z.string().optional(),
  relevance: z.enum(["binding", "persuasive", "illustrative"]).optional(),
  year_from: z.coerce.number().int().min(1950).max(2100).optional(),
  year_to: z.coerce.number().int().min(1950).max(2100).optional(),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(10),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const identifier =
    request.headers.get("x-forwarded-for") ??
    request.headers.get("x-real-ip") ??
    "anon";

  const { success } = rateLimit(identifier, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = QuerySchema.safeParse(
    Object.fromEntries(new URL(request.url).searchParams)
  );

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid parameters", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const {
    categories,
    sectors,
    courts,
    countries,
    relevance,
    year_from,
    year_to,
    q,
    limit,
    offset,
  } = parsed.data;

  const rightsArr = categories
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
  const sectorsArr = sectors
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) ?? [];
  const courtsArr = courts
    ?.split(",")
    .map((s) => s.trim())
    .filter(Boolean) as Court[] | undefined;
  const countriesArr = countries
    ?.split(",")
    .map((s) => s.trim().toUpperCase())
    .filter(Boolean) ?? [];

  if (rightsArr.length === 0 && sectorsArr.length === 0 && !q) {
    return NextResponse.json(
      { error: "Provide at least one of: categories, sectors, or q" },
      { status: 400 }
    );
  }

  const conditions = [eq(jurisprudenceCases.isActive, true)];

  if (rightsArr.length > 0) {
    const catConditions = rightsArr.map((cat) =>
      sql`${jurisprudenceCases.rightsCategories} @> ${JSON.stringify([cat])}::jsonb`
    );
    conditions.push(or(...catConditions)!);
  }

  if (sectorsArr.length > 0) {
    const secConditions = sectorsArr.map((sec) =>
      sql`${jurisprudenceCases.sectors} @> ${JSON.stringify([sec])}::jsonb`
    );
    conditions.push(or(...secConditions)!);
  }

  if (courtsArr && courtsArr.length > 0) {
    conditions.push(inArray(jurisprudenceCases.court, courtsArr));
  }

  if (countriesArr.length > 0) {
    conditions.push(inArray(jurisprudenceCases.country, countriesArr));
  }

  if (relevance) {
    conditions.push(eq(jurisprudenceCases.relevance, relevance));
  }

  if (year_from) {
    conditions.push(gte(jurisprudenceCases.year, year_from));
  }

  if (year_to) {
    conditions.push(lte(jurisprudenceCases.year, year_to));
  }

  const whereClause = and(...conditions);

  let rows;
  let total: number;

  if (q && q.trim().length > 0) {
    const tsquery = q
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .map((w) => `${w}:*`)
      .join(" & ");

    const ftsCondition = sql`${jurisprudenceCases.searchVector} @@ to_tsquery('simple', unaccent(${tsquery}))`;

    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jurisprudenceCases)
      .where(and(whereClause, ftsCondition));

    total = countResult?.count ?? 0;

    rows = await db
      .select({
        id: jurisprudenceCases.id,
        court: jurisprudenceCases.court,
        name: jurisprudenceCases.name,
        citation: jurisprudenceCases.citation,
        year: jurisprudenceCases.year,
        country: jurisprudenceCases.country,
        summary: jurisprudenceCases.summary,
        holding: jurisprudenceCases.holding,
        relevance: jurisprudenceCases.relevance,
        rightsCategories: jurisprudenceCases.rightsCategories,
        aiActArticles: jurisprudenceCases.aiActArticles,
        sectors: jurisprudenceCases.sectors,
        keywords: jurisprudenceCases.keywords,
        url: jurisprudenceCases.url,
        rank: sql<number>`ts_rank(${jurisprudenceCases.searchVector}, to_tsquery('simple', unaccent(${tsquery})))`,
      })
      .from(jurisprudenceCases)
      .where(and(whereClause, ftsCondition))
      .orderBy(
        sql`ts_rank(${jurisprudenceCases.searchVector}, to_tsquery('simple', unaccent(${tsquery}))) DESC`,
        sql`CASE relevance WHEN 'binding' THEN 0 WHEN 'persuasive' THEN 1 ELSE 2 END`,
        jurisprudenceCases.year
      )
      .limit(limit)
      .offset(offset);
  } else {
    const [countResult] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(jurisprudenceCases)
      .where(whereClause);

    total = countResult?.count ?? 0;

    rows = await db
      .select({
        id: jurisprudenceCases.id,
        court: jurisprudenceCases.court,
        name: jurisprudenceCases.name,
        citation: jurisprudenceCases.citation,
        year: jurisprudenceCases.year,
        country: jurisprudenceCases.country,
        summary: jurisprudenceCases.summary,
        holding: jurisprudenceCases.holding,
        relevance: jurisprudenceCases.relevance,
        rightsCategories: jurisprudenceCases.rightsCategories,
        aiActArticles: jurisprudenceCases.aiActArticles,
        sectors: jurisprudenceCases.sectors,
        keywords: jurisprudenceCases.keywords,
        url: jurisprudenceCases.url,
        rank: sql<number>`CASE relevance WHEN 'binding' THEN 1.0 WHEN 'persuasive' THEN 0.6 ELSE 0.3 END`,
      })
      .from(jurisprudenceCases)
      .where(whereClause)
      .orderBy(
        sql`CASE relevance WHEN 'binding' THEN 0 WHEN 'persuasive' THEN 1 ELSE 2 END`,
        sql`year DESC`
      )
      .limit(limit)
      .offset(offset);
  }

  const cases = rows.map((r) => ({
    id: r.id,
    court: r.court,
    name: r.name,
    citation: r.citation,
    year: r.year,
    country: r.country,
    summary: r.summary,
    holding: r.holding,
    relevance: r.relevance,
    rights_categories: (r.rightsCategories as string[]) ?? [],
    ai_act_articles: (r.aiActArticles as string[]) ?? [],
    sectors: (r.sectors as string[]) ?? [],
    keywords: (r.keywords as string[]) ?? [],
    url: r.url,
    _rank: r.rank,
  }));

  const by_court = cases.reduce(
    (acc, c) => {
      acc[c.court] = (acc[c.court] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const matched_categories = [
    ...new Set(
      cases.flatMap((c) =>
        c.rights_categories.filter((r) => rightsArr.includes(r))
      )
    ),
  ];

  const response: JurisprudenceResponse & {
    pagination: { total: number; limit: number; offset: number; pages: number };
  } = {
    cases: cases as unknown as JurisprudenceResponse["cases"],
    total: cases.length,
    by_court: by_court as JurisprudenceResponse["by_court"],
    matched_categories,
    pagination: {
      total,
      limit,
      offset,
      pages: Math.ceil(total / limit),
    },
  };

  return NextResponse.json(response, {
    headers: {
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}
