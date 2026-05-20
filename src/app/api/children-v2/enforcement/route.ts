import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface EnforcementPattern {
  legal_basis: string;
  decision_count: number;
  countries: string[];
  country_count: number;
  total_fines_eur: number;
  first_seen: string;
  last_seen: string;
  trend_label: "emerging" | "active" | "established";
  sample_titles: string[];
}

interface SectorTrend {
  sector: string;
  decision_count: number;
  countries: string[];
  avg_severity_score: number;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-enforcement:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    // Cross-border enforcement patterns: same legal basis used across multiple countries
    const patternsRaw = await db.execute(sql`
      WITH exploded AS (
        SELECT
          jsonb_array_elements_text(legal_bases) AS legal_basis,
          country_code,
          decision_date,
          fine_amount_eur,
          severity,
          title_en
        FROM children_dpa_decisions
      )
      SELECT
        legal_basis,
        COUNT(*)::int                              AS decision_count,
        array_agg(DISTINCT country_code)           AS countries,
        COUNT(DISTINCT country_code)::int          AS country_count,
        COALESCE(SUM(fine_amount_eur), 0)::bigint  AS total_fines_eur,
        MIN(decision_date)::text                   AS first_seen,
        MAX(decision_date)::text                   AS last_seen,
        (array_agg(title_en ORDER BY decision_date DESC))[1:3] AS sample_titles
      FROM exploded
      GROUP BY legal_basis
      ORDER BY country_count DESC, decision_count DESC
    `);

    const patterns: EnforcementPattern[] = (patternsRaw as unknown as Array<Record<string, unknown>>).map((r) => {
      const countryCount = Number(r.country_count ?? 0);
      const decisionCount = Number(r.decision_count ?? 0);
      let trend: EnforcementPattern["trend_label"] = "emerging";
      if (countryCount >= 5 || decisionCount >= 10) trend = "established";
      else if (countryCount >= 2 || decisionCount >= 3) trend = "active";
      return {
        legal_basis: String(r.legal_basis),
        decision_count: decisionCount,
        countries: (r.countries as string[]) ?? [],
        country_count: countryCount,
        total_fines_eur: Number(r.total_fines_eur ?? 0),
        first_seen: String(r.first_seen ?? ""),
        last_seen: String(r.last_seen ?? ""),
        trend_label: trend,
        sample_titles: ((r.sample_titles as string[]) ?? []).filter(Boolean),
      };
    });

    // Sector trends
    const sectorsRaw = await db.execute(sql`
      SELECT
        COALESCE(respondent_sector, 'unspecified') AS sector,
        COUNT(*)::int                    AS decision_count,
        array_agg(DISTINCT country_code) AS countries,
        AVG(
          CASE severity
            WHEN 'critical' THEN 5 WHEN 'high' THEN 4 WHEN 'medium' THEN 3
            WHEN 'low' THEN 2 ELSE 1 END
        )::numeric(4,2)                  AS avg_severity_score
      FROM children_dpa_decisions
      GROUP BY COALESCE(respondent_sector, 'unspecified')
      ORDER BY decision_count DESC
    `);

    const sectorTrends: SectorTrend[] = (sectorsRaw as unknown as Array<Record<string, unknown>>).map((r) => ({
      sector: String(r.sector),
      decision_count: Number(r.decision_count ?? 0),
      countries: (r.countries as string[]) ?? [],
      avg_severity_score: Number(r.avg_severity_score ?? 0),
    }));

    // Link each legal basis to relevant jurisprudence precedents
    const precedentsRaw = await db.execute(sql`
      WITH dpa_bases AS (
        SELECT DISTINCT jsonb_array_elements_text(legal_bases) AS basis
        FROM children_dpa_decisions
      )
      SELECT
        jc.id, jc.court, jc.name, jc.citation, jc.year, jc.country,
        jc.holding, jc.relevance, jc.rights_categories, jc.ai_act_articles
      FROM jurisprudence_cases jc
      WHERE EXISTS (
        SELECT 1 FROM dpa_bases db
        WHERE jc.ai_act_articles ? db.basis
           OR jc.rights_categories ? db.basis
      )
      ORDER BY jc.year DESC
      LIMIT 20
    `);

    const precedents = (precedentsRaw as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      court: String(r.court),
      name: String(r.name),
      citation: String(r.citation),
      year: Number(r.year),
      country: r.country ? String(r.country) : null,
      holding: String(r.holding),
      relevance: String(r.relevance),
      rights_categories: (r.rights_categories as string[]) ?? [],
      ai_act_articles: (r.ai_act_articles as string[]) ?? [],
    }));

    return NextResponse.json({
      patterns,
      sector_trends: sectorTrends,
      precedents,
      generated_at: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (e) {
    console.error("[children-v2/enforcement]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
