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
  positionsPrimary: number;
  positionsAnchored: number;
  incidents: number;
  incidentsLinked: number;
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

    // Divergence is counted from the controlled authority list, restricted to kinds
    // that actually are authorities. A regulated entity stating its own position is
    // displayed but never counted. This must stay identical to the queries in
    // /api/rights-graph/divergence and /api/rights-graph/exposure so the three
    // surfaces never report different figures for the same data.
    const divRows = await db.execute(sql`
      SELECT COUNT(*)::int AS positions,
             COUNT(*) FILTER (WHERE source_tier = 'primary')::int AS positions_primary,
             COUNT(*) FILTER (WHERE anchor_quote IS NOT NULL)::int AS positions_anchored,
             (SELECT COUNT(*) FROM (
                SELECT p.topic
                FROM rg_positions p
                JOIN rg_authorities a ON a.code = p.authority_code
                WHERE a.kind IN ('eu_body','national_dpa','sector_regulator','court')
                GROUP BY p.topic
                HAVING COUNT(DISTINCT p.authority_code) >= 2
             ) d)::int AS diverging_topics
      FROM rg_positions
    `);
    const dv = (divRows as unknown as Row[])[0] ?? {};

    let incidents = 0;
    let incidentsLinked = 0;
    try {
      const incRows = await db.execute(sql`
        SELECT COUNT(*)::int AS total,
               COUNT(*) FILTER (WHERE system_id IS NOT NULL)::int AS linked
        FROM rg_incidents
      `);
      const inc = (incRows as unknown as Row[])[0] ?? {};
      incidents = Number(inc.total ?? 0);
      incidentsLinked = Number(inc.linked ?? 0);
    } catch {
      // rg_incidents may not exist yet in every environment; counters stay at zero.
    }

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
      positionsPrimary: Number(dv.positions_primary ?? 0),
      positionsAnchored: Number(dv.positions_anchored ?? 0),
      incidents,
      incidentsLinked,
    };
  } catch (e) {
    console.error("[rights-graph-stats]", e);
    return null;
  }
}
