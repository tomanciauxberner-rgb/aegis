import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-overview:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const [
      decisionsAgg,
      appsAgg,
      edtechAgg,
      lastIngestRow,
    ] = await Promise.all([
      db.execute(sql`
        SELECT
          COUNT(*)::int                                AS total,
          COUNT(*) FILTER (WHERE severity = 'critical')::int AS critical,
          COUNT(*) FILTER (WHERE severity = 'high')::int     AS high,
          COUNT(DISTINCT country_code)::int            AS countries,
          COALESCE(SUM(fine_amount_eur), 0)::bigint    AS total_fines
        FROM children_dpa_decisions
      `),
      db.execute(sql`
        SELECT
          COUNT(*)::int                                AS total,
          COUNT(*) FILTER (WHERE is_vlop = TRUE)::int  AS vlops,
          COUNT(*) FILTER (WHERE declared_min_age IS NOT NULL AND declared_min_age <= 12)::int AS rated_under_12
        FROM children_apps
      `),
      db.execute(sql`
        SELECT
          COUNT(*)::int                                AS total,
          COUNT(*) FILTER (WHERE risk_tier = 'annex3')::int AS annex3,
          COUNT(DISTINCT country_code)::int            AS countries
        FROM children_edtech_systems
      `),
      db.execute(sql`
        SELECT pipeline, completed_at, inserted, errors
        FROM children_ingest_log
        WHERE completed_at IS NOT NULL
        ORDER BY completed_at DESC
        LIMIT 8
      `),
    ]);

    const decisions = (decisionsAgg as unknown as Array<{ total: number; critical: number; high: number; countries: number; total_fines: string | number }>)[0] ?? { total: 0, critical: 0, high: 0, countries: 0, total_fines: 0 };
    const apps = (appsAgg as unknown as Array<{ total: number; vlops: number; rated_under_12: number }>)[0] ?? { total: 0, vlops: 0, rated_under_12: 0 };
    const edtech = (edtechAgg as unknown as Array<{ total: number; annex3: number; countries: number }>)[0] ?? { total: 0, annex3: 0, countries: 0 };
    const lastIngest = lastIngestRow as unknown as Array<{ pipeline: string; completed_at: string; inserted: number; errors: number }>;

    return NextResponse.json({
      decisions: {
        total: decisions.total,
        critical: decisions.critical,
        high: decisions.high,
        countries_covered: decisions.countries,
        total_fines_eur: Number(decisions.total_fines ?? 0),
      },
      apps: {
        total: apps.total,
        vlops_count: apps.vlops,
        rated_under_12: apps.rated_under_12,
      },
      edtech: {
        total: edtech.total,
        annex3_count: edtech.annex3,
        countries_mapped: edtech.countries,
      },
      ingest_runs: lastIngest,
      generated_at: new Date().toISOString(),
    }, {
      headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
    });
  } catch (e) {
    console.error("[children-v2/overview]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
