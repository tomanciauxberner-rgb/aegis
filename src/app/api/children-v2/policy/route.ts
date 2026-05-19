import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql, SQL, gte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { childrenPolicySignals, childrenPolicySources } from "@/db/schema";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  signal_type: z.enum([
    "research_project", "opinion_or_guidance",
    "consultation_open", "consultation_closed",
    "bill_introduced", "bill_adopted",
    "parliamentary_question", "position_paper",
    "work_programme", "stakeholder_event",
  ]).optional(),
  status: z.enum(["upcoming", "open", "in_progress", "closed", "adopted", "withdrawn"]).optional(),
  jurisdiction: z.string().max(50).optional(),
  theme: z.string().max(50).optional(),
  source_id: z.string().max(50).optional(),
  min_relevance: z.coerce.number().int().min(0).max(100).default(50),
  q: z.string().max(200).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(40),
  offset: z.coerce.number().int().min(0).default(0),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-policy:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const { signal_type, status, jurisdiction, theme, source_id, min_relevance, q, limit, offset } = parsed.data;

  try {
    const conditions: SQL[] = [gte(childrenPolicySignals.relevanceScore, min_relevance)];
    if (signal_type)  conditions.push(eq(childrenPolicySignals.signalType, signal_type));
    if (status)       conditions.push(eq(childrenPolicySignals.status, status));
    if (jurisdiction) conditions.push(eq(childrenPolicySignals.jurisdiction, jurisdiction));
    if (source_id)    conditions.push(eq(childrenPolicySignals.sourceId, source_id));
    if (theme)        conditions.push(sql`${childrenPolicySignals.themes} @> ${JSON.stringify([theme])}::jsonb`);

    let ftsCondition: SQL | null = null;
    if (q && q.trim().length > 0) {
      const safe = q.trim().replace(/[^\p{L}\p{N}\s-]/gu, " ").trim();
      if (safe.length > 0) {
        const tsquery = safe.split(/\s+/).filter(Boolean).slice(0, 6).map((w) => `${w}:*`).join(" & ");
        ftsCondition = sql`${childrenPolicySignals}.search_vector @@ to_tsquery('simple', unaccent(${tsquery}))`;
      }
    }

    const whereClause = ftsCondition
      ? and(...conditions, ftsCondition)
      : and(...conditions);

    const rows = await db
      .select({
        id: childrenPolicySignals.id,
        sourceId: childrenPolicySignals.sourceId,
        signalType: childrenPolicySignals.signalType,
        status: childrenPolicySignals.status,
        titleOriginal: childrenPolicySignals.titleOriginal,
        titleEn: childrenPolicySignals.titleEn,
        summaryEn: childrenPolicySignals.summaryEn,
        signalDate: childrenPolicySignals.signalDate,
        deadlineDate: childrenPolicySignals.deadlineDate,
        jurisdiction: childrenPolicySignals.jurisdiction,
        countryCodes: childrenPolicySignals.countryCodes,
        themes: childrenPolicySignals.themes,
        legalFrameworks: childrenPolicySignals.legalFrameworks,
        relevanceScore: childrenPolicySignals.relevanceScore,
        whyItMatters: childrenPolicySignals.whyItMatters,
        stakeholders: childrenPolicySignals.stakeholders,
        sourceUrl: childrenPolicySignals.sourceUrl,
        sourceName: childrenPolicySources.name,
        sourceAcronym: childrenPolicySources.acronym,
      })
      .from(childrenPolicySignals)
      .innerJoin(childrenPolicySources, eq(childrenPolicySignals.sourceId, childrenPolicySources.id))
      .where(whereClause)
      .orderBy(
        desc(childrenPolicySignals.relevanceScore),
        desc(childrenPolicySignals.signalDate),
      )
      .limit(limit)
      .offset(offset);

    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(childrenPolicySignals)
      .where(whereClause);

    return NextResponse.json({
      items: rows,
      total: count,
      limit,
      offset,
    }, {
      headers: { "Cache-Control": "public, max-age=180, s-maxage=180" },
    });
  } catch (e) {
    console.error("[children-v2/policy]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
