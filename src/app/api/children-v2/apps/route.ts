import { NextRequest, NextResponse } from "next/server";
import { and, desc, eq, sql, SQL, gte, lte } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { childrenApps, childrenAppRankings, childrenGdprAge } from "@/db/schema/children";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  country: z.string().length(2).optional(),
  category: z.enum(["kids", "social", "entertainment", "games"]).optional(),
  vlop_only: z.enum(["true", "false"]).optional(),
  min_age_below: z.coerce.number().int().min(0).max(18).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(50),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-apps:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const { country, category, vlop_only, min_age_below, limit } = parsed.data;

  try {
    const latestObservedRow = await db
      .select({ latest: sql<string>`MAX(${childrenAppRankings.observedAt})` })
      .from(childrenAppRankings);
    const latestObserved = latestObservedRow[0]?.latest;
    if (!latestObserved) {
      return NextResponse.json({ items: [], total: 0, observed_at: null });
    }

    const sinceCutoff = new Date(new Date(latestObserved).getTime() - 24 * 3600 * 1000).toISOString();

    const conditions: SQL[] = [gte(childrenAppRankings.observedAt, new Date(sinceCutoff))];
    if (country)  conditions.push(eq(childrenAppRankings.countryCode, country.toUpperCase()));
    if (category) conditions.push(eq(childrenAppRankings.chartCategory, category));
    if (vlop_only === "true") conditions.push(eq(childrenApps.isVlop, true));
    if (min_age_below !== undefined) conditions.push(lte(childrenApps.declaredMinAge, min_age_below));

    const rows = await db
      .select({
        appId: childrenApps.id,
        bundleId: childrenApps.bundleId,
        name: childrenApps.name,
        publisher: childrenApps.publisher,
        category: childrenApps.category,
        declaredMinAge: childrenApps.declaredMinAge,
        isVlop: childrenApps.isVlop,
        vlopDesignationDate: childrenApps.vlopDesignationDate,
        dsaTransparencyUrl: childrenApps.dsaTransparencyUrl,
        countryCode: childrenAppRankings.countryCode,
        platform: childrenAppRankings.platform,
        chartCategory: childrenAppRankings.chartCategory,
        rank: childrenAppRankings.rank,
        observedAt: childrenAppRankings.observedAt,
      })
      .from(childrenAppRankings)
      .innerJoin(childrenApps, eq(childrenAppRankings.appId, childrenApps.id))
      .where(and(...conditions))
      .orderBy(childrenAppRankings.countryCode, childrenAppRankings.chartCategory, childrenAppRankings.rank)
      .limit(limit);

    const gdprAges = await db.select().from(childrenGdprAge);
    const ageMap = new Map<string, number>();
    for (const r of gdprAges) ageMap.set(r.countryCode, r.ageConsent);

    const itemsWithGap = rows.map((r) => {
      const legalAge = ageMap.get(r.countryCode);
      const declared = r.declaredMinAge;
      let compliance_gap: "ok" | "borderline" | "violation" | "unknown" = "unknown";
      if (legalAge !== undefined && declared !== null) {
        if (declared >= legalAge) compliance_gap = "ok";
        else if (declared >= legalAge - 2) compliance_gap = "borderline";
        else compliance_gap = "violation";
      }
      return {
        ...r,
        legal_age_gdpr_art8: legalAge ?? null,
        compliance_gap,
      };
    });

    return NextResponse.json({
      items: itemsWithGap,
      total: itemsWithGap.length,
      observed_at: latestObserved,
    }, {
      headers: { "Cache-Control": "public, max-age=600, s-maxage=600" },
    });
  } catch (e) {
    console.error("[children-v2/apps]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
