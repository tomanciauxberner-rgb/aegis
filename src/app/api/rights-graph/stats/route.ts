import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-stats:${ip}`, 120);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const sysRows = await db.execute(sql`
      SELECT
        COUNT(*)::int AS systems,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited') AND fria_known = TRUE)::int AS high_risk_with_fria,
        COUNT(DISTINCT annex_area)::int AS domains
      FROM rg_systems
    `);
    const s = (sysRows as unknown as Array<Record<string, unknown>>)[0] ?? {};

    const countryRows = await db.execute(sql`
      SELECT COUNT(DISTINCT c.country)::int AS countries
      FROM rg_systems s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.countries) AS c(country)
    `);
    const countries = Number((countryRows as unknown as Array<Record<string, unknown>>)[0]?.countries ?? 0);

    const linkRows = await db.execute(sql`SELECT COUNT(*)::int AS links FROM rg_system_rights`);
    const sourceRows = await db.execute(sql`SELECT COUNT(*)::int AS sources FROM rg_sources`);

    const divRows = await db.execute(sql`
      SELECT COUNT(*)::int AS positions,
             (SELECT COUNT(*) FROM (
                SELECT topic FROM rg_positions GROUP BY topic HAVING COUNT(DISTINCT authority) >= 2
             ) d)::int AS diverging_topics
      FROM rg_positions
    `);
    const dv = (divRows as unknown as Array<Record<string, unknown>>)[0] ?? {};

    const highRisk = Number(s.high_risk ?? 0);
    const highRiskWithFria = Number(s.high_risk_with_fria ?? 0);

    return NextResponse.json(
      {
        systems: Number(s.systems ?? 0),
        highRisk,
        knownFria: highRiskWithFria,
        friaGap: highRisk - highRiskWithFria,
        domains: Number(s.domains ?? 0),
        countries,
        rightsLinks: Number((linkRows as unknown as Array<Record<string, unknown>>)[0]?.links ?? 0),
        sources: Number((sourceRows as unknown as Array<Record<string, unknown>>)[0]?.sources ?? 0),
        positions: Number(dv.positions ?? 0),
        divergingTopics: Number(dv.diverging_topics ?? 0),
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/stats]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
