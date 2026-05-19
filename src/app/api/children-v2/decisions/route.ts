import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql, SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { childrenDpaDecisions, childrenDpaRegistry } from "@/db/schema/children";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  country: z.string().length(2).optional(),
  severity: z.enum(["critical", "high", "medium", "low", "informational"]).optional(),
  outcome: z.enum(["fine", "warning", "injunction", "dismissed", "ongoing", "settled", "guidance"]).optional(),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-decisions:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const { country, severity, outcome, q, limit, offset } = parsed.data;

  try {
    const conditions: SQL[] = [];
    if (country)  conditions.push(eq(childrenDpaDecisions.countryCode, country.toUpperCase()));
    if (severity) conditions.push(eq(childrenDpaDecisions.severity, severity));
    if (outcome)  conditions.push(eq(childrenDpaDecisions.outcome, outcome));

    let ftsCondition: SQL | null = null;
    let tsquery: string | null = null;
    if (q && q.trim().length > 0) {
      const safe = q.trim().replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
      if (safe.length > 0) {
        tsquery = safe.split(/\s+/).filter(Boolean).slice(0, 6).map((w) => `${w}:*`).join(" & ");
        ftsCondition = sql`${childrenDpaDecisions}.search_vector @@ to_tsquery('simple', unaccent(${tsquery}))`;
      }
    }

    const whereClause = ftsCondition
      ? (conditions.length > 0 ? and(...conditions, ftsCondition) : ftsCondition)
      : (conditions.length > 0 ? and(...conditions) : undefined);

    const baseQuery = db
      .select({
        id: childrenDpaDecisions.id,
        countryCode: childrenDpaDecisions.countryCode,
        decisionDate: childrenDpaDecisions.decisionDate,
        publishedDate: childrenDpaDecisions.publishedDate,
        titleOriginal: childrenDpaDecisions.titleOriginal,
        titleEn: childrenDpaDecisions.titleEn,
        summaryEn: childrenDpaDecisions.summaryEn,
        outcome: childrenDpaDecisions.outcome,
        fineAmountEur: childrenDpaDecisions.fineAmountEur,
        respondentName: childrenDpaDecisions.respondentName,
        respondentSector: childrenDpaDecisions.respondentSector,
        legalBases: childrenDpaDecisions.legalBases,
        ageRangeAffected: childrenDpaDecisions.ageRangeAffected,
        severity: childrenDpaDecisions.severity,
        sourceUrl: childrenDpaDecisions.sourceUrl,
        languageOriginal: childrenDpaDecisions.languageOriginal,
        isVerified: childrenDpaDecisions.isVerified,
        dpaAcronym: childrenDpaRegistry.acronym,
        dpaNameEn: childrenDpaRegistry.nameEn,
      })
      .from(childrenDpaDecisions)
      .innerJoin(childrenDpaRegistry, eq(childrenDpaDecisions.dpaId, childrenDpaRegistry.id));

    const rows = whereClause
      ? await baseQuery.where(whereClause).orderBy(desc(childrenDpaDecisions.decisionDate)).limit(limit).offset(offset)
      : await baseQuery.orderBy(desc(childrenDpaDecisions.decisionDate)).limit(limit).offset(offset);

    const countQuery = db.select({ count: sql<number>`count(*)::int` }).from(childrenDpaDecisions);
    const [{ count }] = whereClause
      ? await countQuery.where(whereClause)
      : await countQuery;

    return NextResponse.json({
      items: rows,
      total: count,
      limit,
      offset,
    }, {
      headers: { "Cache-Control": "public, max-age=120, s-maxage=120" },
    });
  } catch (e) {
    console.error("[children-v2/decisions]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
