import { sql } from "drizzle-orm";
import { db } from "@/db/client";

export interface RightsGraphStats {
  systems: number;
  highRisk: number;
  knownFria: number;
  friaGap: number;
  domains: number;
  countries: number;
  rightsLinks: number;
  sources: number;
  positions: number;
  divergingTopics: number;
}

type Row = Record<string, unknown>;

export async function getRightsGraphStats(): Promise<RightsGraphStats | null> {
  try {
    const sysRows = await db.execute(sql`
      SELECT
        COUNT(*)::int AS systems,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited') AND fria_known = TRUE)::int AS high_risk_with_fria,
        COUNT(DISTINCT annex_area)::int AS domains
      FROM rg_systems
    `);
    const s = (sysRows as unknown as Row[])[0] ?? {};

    const countryRows = await db.execute(sql`
      SELECT COUNT(DISTINCT c.country)::int AS countries
      FROM rg_systems s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.countries) AS c(country)
    `);

    const linkRows = await db.execute(sql`SELECT COUNT(*)::int AS links FROM rg_system_rights`);
    const sourceRows = await db.execute(sql`SELECT COUNT(*)::int AS sources FROM rg_sources`);

    const divRows = await db.execute(sql`
      SELECT COUNT(*)::int AS positions,
             (SELECT COUNT(*) FROM (
                SELECT topic FROM rg_positions GROUP BY topic HAVING COUNT(DISTINCT authority) >= 2
             ) d)::int AS diverging_topics
      FROM rg_positions
    `);
    const dv = (divRows as unknown as Row[])[0] ?? {};

    const highRisk = Number(s.high_risk ?? 0);
    const knownFria = Number(s.high_risk_with_fria ?? 0);

    return {
      systems: Number(s.systems ?? 0),
      highRisk,
      knownFria,
      friaGap: highRisk - knownFria,
      domains: Number(s.domains ?? 0),
      countries: Number((countryRows as unknown as Row[])[0]?.countries ?? 0),
      rightsLinks: Number((linkRows as unknown as Row[])[0]?.links ?? 0),
      sources: Number((sourceRows as unknown as Row[])[0]?.sources ?? 0),
      positions: Number(dv.positions ?? 0),
      divergingTopics: Number(dv.diverging_topics ?? 0),
    };
  } catch (e) {
    console.error("[rights-graph-stats]", e);
    return null;
  }
}
