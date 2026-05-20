import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface AppGap {
  app_id: string;
  name: string;
  publisher: string | null;
  category: string | null;
  declared_min_age: number | null;
  is_vlop: boolean;
  dsa_transparency_url: string | null;
  violation_countries: string[];
  borderline_countries: string[];
  ok_countries: string[];
  violation_count: number;
  max_gap_years: number;
  worst_country: string | null;
  exposure_rank_best: number | null;
}

interface CountryGap {
  country_code: string;
  legal_age: number;
  apps_observed: number;
  violations: number;
  borderline: number;
  violation_rate: number;
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-gaps:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const latestRow = await db.execute(sql`SELECT MAX(observed_at) AS latest FROM children_app_rankings`);
    const latest = (latestRow as unknown as Array<{ latest: string | null }>)[0]?.latest;
    if (!latest) {
      return NextResponse.json({ apps: [], countries: [], summary: null, observed_at: null });
    }
    const cutoff = new Date(new Date(latest).getTime() - 24 * 3600 * 1000).toISOString();

    // Per-app systemic gap: across all countries where the app is charting,
    // compare declared min age vs each country's GDPR Art.8 legal age.
    const appGapsRaw = await db.execute(sql`
      WITH latest_rankings AS (
        SELECT DISTINCT r.app_id, r.country_code, MIN(r.rank) AS best_rank
        FROM children_app_rankings r
        WHERE r.observed_at >= ${cutoff}
        GROUP BY r.app_id, r.country_code
      ),
      joined AS (
        SELECT
          a.id AS app_id, a.name, a.publisher, a.category,
          a.declared_min_age, a.is_vlop, a.dsa_transparency_url,
          lr.country_code, lr.best_rank,
          g.age_consent AS legal_age,
          CASE
            WHEN a.declared_min_age IS NULL OR g.age_consent IS NULL THEN 'unknown'
            WHEN a.declared_min_age >= g.age_consent THEN 'ok'
            WHEN a.declared_min_age >= g.age_consent - 2 THEN 'borderline'
            ELSE 'violation'
          END AS gap_status,
          GREATEST(0, COALESCE(g.age_consent,0) - COALESCE(a.declared_min_age,0)) AS gap_years
        FROM latest_rankings lr
        JOIN children_apps a ON a.id = lr.app_id
        LEFT JOIN children_gdpr_age g ON g.country_code = lr.country_code
      )
      SELECT
        app_id, name, publisher, category, declared_min_age, is_vlop, dsa_transparency_url,
        array_agg(country_code) FILTER (WHERE gap_status = 'violation')  AS violation_countries,
        array_agg(country_code) FILTER (WHERE gap_status = 'borderline') AS borderline_countries,
        array_agg(country_code) FILTER (WHERE gap_status = 'ok')         AS ok_countries,
        COUNT(*) FILTER (WHERE gap_status = 'violation')::int            AS violation_count,
        MAX(gap_years)::int                                             AS max_gap_years,
        (array_agg(country_code ORDER BY gap_years DESC) FILTER (WHERE gap_status = 'violation'))[1] AS worst_country,
        MIN(best_rank)::int                                             AS exposure_rank_best
      FROM joined
      GROUP BY app_id, name, publisher, category, declared_min_age, is_vlop, dsa_transparency_url
      HAVING COUNT(*) FILTER (WHERE gap_status = 'violation') > 0
      ORDER BY violation_count DESC, max_gap_years DESC
      LIMIT 50
    `);

    const apps: AppGap[] = (appGapsRaw as unknown as Array<Record<string, unknown>>).map((r) => ({
      app_id: String(r.app_id),
      name: String(r.name),
      publisher: r.publisher ? String(r.publisher) : null,
      category: r.category ? String(r.category) : null,
      declared_min_age: r.declared_min_age !== null ? Number(r.declared_min_age) : null,
      is_vlop: Boolean(r.is_vlop),
      dsa_transparency_url: r.dsa_transparency_url ? String(r.dsa_transparency_url) : null,
      violation_countries: (r.violation_countries as string[]) ?? [],
      borderline_countries: (r.borderline_countries as string[]) ?? [],
      ok_countries: (r.ok_countries as string[]) ?? [],
      violation_count: Number(r.violation_count ?? 0),
      max_gap_years: Number(r.max_gap_years ?? 0),
      worst_country: r.worst_country ? String(r.worst_country) : null,
      exposure_rank_best: r.exposure_rank_best !== null ? Number(r.exposure_rank_best) : null,
    }));

    // Per-country gap rate
    const countryGapsRaw = await db.execute(sql`
      WITH latest_rankings AS (
        SELECT DISTINCT r.app_id, r.country_code
        FROM children_app_rankings r
        WHERE r.observed_at >= ${cutoff}
      ),
      joined AS (
        SELECT
          lr.country_code,
          g.age_consent AS legal_age,
          CASE
            WHEN a.declared_min_age IS NULL OR g.age_consent IS NULL THEN 'unknown'
            WHEN a.declared_min_age >= g.age_consent THEN 'ok'
            WHEN a.declared_min_age >= g.age_consent - 2 THEN 'borderline'
            ELSE 'violation'
          END AS gap_status
        FROM latest_rankings lr
        JOIN children_apps a ON a.id = lr.app_id
        LEFT JOIN children_gdpr_age g ON g.country_code = lr.country_code
      )
      SELECT
        country_code,
        MAX(legal_age)::int AS legal_age,
        COUNT(*)::int AS apps_observed,
        COUNT(*) FILTER (WHERE gap_status = 'violation')::int  AS violations,
        COUNT(*) FILTER (WHERE gap_status = 'borderline')::int AS borderline
      FROM joined
      WHERE legal_age IS NOT NULL
      GROUP BY country_code
      ORDER BY (COUNT(*) FILTER (WHERE gap_status = 'violation')::float / NULLIF(COUNT(*),0)) DESC
    `);

    const countries: CountryGap[] = (countryGapsRaw as unknown as Array<Record<string, unknown>>).map((r) => {
      const observed = Number(r.apps_observed ?? 0);
      const violations = Number(r.violations ?? 0);
      return {
        country_code: String(r.country_code),
        legal_age: Number(r.legal_age ?? 0),
        apps_observed: observed,
        violations,
        borderline: Number(r.borderline ?? 0),
        violation_rate: observed > 0 ? Math.round((violations / observed) * 100) : 0,
      };
    });

    const summary = {
      apps_in_violation: apps.length,
      total_violation_instances: apps.reduce((s, a) => s + a.violation_count, 0),
      vlops_in_violation: apps.filter((a) => a.is_vlop).length,
      worst_app: apps[0]?.name ?? null,
      countries_analysed: countries.length,
    };

    return NextResponse.json(
      { apps, countries, summary, observed_at: latest },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=600" } },
    );
  } catch (e) {
    console.error("[children-v2/gaps]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
