import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const AREA_LABEL: Record<string, string> = {
  biometrics: "Biometrics", critical_infra: "Critical infrastructure", education: "Education",
  employment: "Employment", essential: "Essential services", law_enforcement: "Law enforcement",
  migration: "Migration & asylum", justice: "Justice & democracy", none: "Outside Annex III",
};

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-fria-gap:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    // Only high-risk and prohibited systems carry a meaningful FRIA expectation.
    const overallRows = await db.execute(sql`
      SELECT
        COUNT(*)::int AS total,
        COUNT(*) FILTER (WHERE fria_known = TRUE)::int AS with_fria,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited') AND fria_known = TRUE)::int AS high_risk_with_fria
      FROM rg_systems
    `);
    const o = (overallRows as unknown as Array<Record<string, unknown>>)[0] ?? {};
    const highRisk = Number(o.high_risk ?? 0);
    const highRiskWithFria = Number(o.high_risk_with_fria ?? 0);

    const byAreaRows = await db.execute(sql`
      SELECT annex_area,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited') AND fria_known = TRUE)::int AS with_fria
      FROM rg_systems
      GROUP BY annex_area
      HAVING COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited')) > 0
      ORDER BY high_risk DESC
    `);
    const byArea = (byAreaRows as unknown as Array<Record<string, unknown>>).map((r) => {
      const hr = Number(r.high_risk ?? 0);
      const wf = Number(r.with_fria ?? 0);
      return {
        area: String(r.annex_area),
        label: AREA_LABEL[String(r.annex_area)] ?? String(r.annex_area),
        highRisk: hr,
        withFria: wf,
        gap: hr - wf,
      };
    });

    // Country-level: countries is a JSONB array; expand it.
    const byCountryRows = await db.execute(sql`
      SELECT c.country,
        COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited') AND s.fria_known = TRUE)::int AS with_fria
      FROM rg_systems s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.countries) AS c(country)
      GROUP BY c.country
      HAVING COUNT(*) FILTER (WHERE s.risk_tier IN ('high_risk','prohibited')) > 0
      ORDER BY high_risk DESC
    `);
    const byCountry = (byCountryRows as unknown as Array<Record<string, unknown>>).map((r) => {
      const hr = Number(r.high_risk ?? 0);
      const wf = Number(r.with_fria ?? 0);
      return { country: String(r.country), highRisk: hr, withFria: wf, gap: hr - wf };
    });

    return NextResponse.json(
      {
        sample: {
          totalSystems: Number(o.total ?? 0),
          highRiskSystems: highRisk,
        },
        coverage: {
          highRisk,
          withFria: highRiskWithFria,
          gap: highRisk - highRiskWithFria,
          coverageRate: highRisk > 0 ? Math.round((highRiskWithFria / highRisk) * 100) : null,
        },
        byArea,
        byCountry,
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/fria-gap]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
