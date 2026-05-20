import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const EU27 = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];

interface CountryIndex {
  country_code: string;
  legal_age_consent: number | null;
  enforcement_score: number;
  exposure_score: number;
  edtech_risk_score: number;
  framework_score: number;
  cdri: number;
  band: "robust" | "developing" | "exposed" | "insufficient_data";
  signals: {
    dpa_decisions: number;
    app_violations: number;
    edtech_systems: number;
    edtech_annex3: number;
  };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-cdri:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const cutoffRow = await db.execute(sql`SELECT MAX(observed_at) AS latest FROM children_app_rankings`);
    const latest = (cutoffRow as unknown as Array<{ latest: string | null }>)[0]?.latest;
    const appCutoff = latest ? new Date(new Date(latest).getTime() - 24 * 3600 * 1000).toISOString() : new Date(0).toISOString();

    // Dimension 1: enforcement activity (more child-protective decisions = higher protection signal)
    const enforcementRaw = await db.execute(sql`
      SELECT country_code, COUNT(*)::int AS decisions
      FROM children_dpa_decisions
      GROUP BY country_code
    `);
    const enforcement = new Map<string, number>();
    for (const r of enforcementRaw as unknown as Array<{ country_code: string; decisions: number }>) {
      enforcement.set(r.country_code, Number(r.decisions));
    }

    // Dimension 2: app exposure (violation rate — higher = worse, inverted in score)
    const exposureRaw = await db.execute(sql`
      WITH lr AS (
        SELECT DISTINCT app_id, country_code FROM children_app_rankings WHERE observed_at >= ${appCutoff}
      ),
      j AS (
        SELECT lr.country_code,
          CASE WHEN a.declared_min_age IS NULL OR g.age_consent IS NULL THEN 'unknown'
               WHEN a.declared_min_age >= g.age_consent THEN 'ok'
               WHEN a.declared_min_age >= g.age_consent - 2 THEN 'borderline'
               ELSE 'violation' END AS st
        FROM lr JOIN children_apps a ON a.id = lr.app_id
        LEFT JOIN children_gdpr_age g ON g.country_code = lr.country_code
      )
      SELECT country_code,
        COUNT(*)::int AS observed,
        COUNT(*) FILTER (WHERE st = 'violation')::int AS violations
      FROM j GROUP BY country_code
    `);
    const exposure = new Map<string, { observed: number; violations: number }>();
    for (const r of exposureRaw as unknown as Array<{ country_code: string; observed: number; violations: number }>) {
      exposure.set(r.country_code, { observed: Number(r.observed), violations: Number(r.violations) });
    }

    // Dimension 3: edtech risk (presence of annex3 systems)
    const edtechRaw = await db.execute(sql`
      SELECT country_code,
        COUNT(*)::int AS systems,
        COUNT(*) FILTER (WHERE risk_tier = 'annex3')::int AS annex3
      FROM children_edtech_systems
      GROUP BY country_code
    `);
    const edtech = new Map<string, { systems: number; annex3: number }>();
    for (const r of edtechRaw as unknown as Array<{ country_code: string; systems: number; annex3: number }>) {
      edtech.set(r.country_code, { systems: Number(r.systems), annex3: Number(r.annex3) });
    }

    // Dimension 4: framework maturity (GDPR Art.8 age — higher consent age = stronger baseline protection)
    const ageRaw = await db.execute(sql`SELECT country_code, age_consent FROM children_gdpr_age`);
    const ages = new Map<string, number>();
    for (const r of ageRaw as unknown as Array<{ country_code: string; age_consent: number }>) {
      ages.set(r.country_code, Number(r.age_consent));
    }

    const maxDecisions = Math.max(1, ...[...enforcement.values()]);

    const index: CountryIndex[] = EU27.map((cc) => {
      const decisions = enforcement.get(cc) ?? 0;
      const exp = exposure.get(cc);
      const et = edtech.get(cc);
      const age = ages.get(cc) ?? null;

      // Enforcement: normalized 0-100 (relative to most active DPA)
      const enforcementScore = Math.round((decisions / maxDecisions) * 100);

      // Exposure: inverted violation rate (fewer violations = higher protection)
      let exposureScore = 50;
      if (exp && exp.observed > 0) {
        const rate = exp.violations / exp.observed;
        exposureScore = Math.round((1 - rate) * 100);
      }

      // Edtech risk: inverted (more annex3 high-risk systems unmitigated = lower score)
      let edtechRiskScore = 70;
      if (et && et.systems > 0) {
        const annex3Ratio = et.annex3 / et.systems;
        edtechRiskScore = Math.round((1 - annex3Ratio) * 100);
      }

      // Framework: GDPR Art.8 age mapped 13->40, 14->60, 15->80, 16->100
      const frameworkScore = age === null ? 50 : Math.round(((age - 12) / 4) * 100);

      const hasData = decisions > 0 || (exp?.observed ?? 0) > 0 || (et?.systems ?? 0) > 0;

      // CDRI: weighted composite
      const cdri = Math.round(
        enforcementScore * 0.20 +
        exposureScore * 0.30 +
        edtechRiskScore * 0.20 +
        frameworkScore * 0.30,
      );

      let band: CountryIndex["band"];
      if (!hasData && age === null) band = "insufficient_data";
      else if (cdri >= 70) band = "robust";
      else if (cdri >= 50) band = "developing";
      else band = "exposed";

      return {
        country_code: cc,
        legal_age_consent: age,
        enforcement_score: enforcementScore,
        exposure_score: exposureScore,
        edtech_risk_score: edtechRiskScore,
        framework_score: frameworkScore,
        cdri,
        band,
        signals: {
          dpa_decisions: decisions,
          app_violations: exp?.violations ?? 0,
          edtech_systems: et?.systems ?? 0,
          edtech_annex3: et?.annex3 ?? 0,
        },
      };
    });

    index.sort((a, b) => b.cdri - a.cdri);

    const euAvg = Math.round(index.reduce((s, c) => s + c.cdri, 0) / index.length);

    return NextResponse.json(
      {
        index,
        eu_average: euAvg,
        methodology: {
          weights: { exposure: 0.30, framework: 0.30, enforcement: 0.20, edtech_risk: 0.20 },
          note: "Composite of four live dimensions: DPA enforcement activity, app-store age-of-consent compliance, EdTech Annex III risk, and GDPR Art. 8 framework maturity. Scores are relative and recomputed on each load.",
        },
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=600" } },
    );
  } catch (e) {
    console.error("[children-v2/index]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
