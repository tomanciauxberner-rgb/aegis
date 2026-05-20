import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface AtlasSystem {
  id: string;
  country_code: string;
  system_name: string;
  vendor: string | null;
  deployment_scope: string;
  students_affected: number | null;
  ai_features: string[];
  annex3_categories: string[];
  risk_tier: string;
  legal_status: string | null;
  source_url: string | null;
  description: string;
  last_verified: string;
  legal_age_consent: number | null;
  risk_score: number;
  fria_required: boolean;
  fria_rationale: string;
}

function computeRiskScore(s: {
  deployment_scope: string;
  ai_features: string[];
  annex3_categories: string[];
  risk_tier: string;
  legal_status: string | null;
}): { score: number; friaRequired: boolean; rationale: string } {
  let score = 0;
  const reasons: string[] = [];

  const scopeWeight: Record<string, number> = { national: 35, regional: 22, pilot: 10, withdrawn: 2 };
  score += scopeWeight[s.deployment_scope] ?? 5;
  if (s.deployment_scope === "national") reasons.push("national deployment");

  if (s.risk_tier === "annex3") { score += 30; reasons.push("AI Act Annex III high-risk"); }
  else if (s.risk_tier === "prohibited") { score += 40; reasons.push("prohibited practice"); }
  else if (s.risk_tier === "limited") { score += 8; }

  const featureWeight = Math.min(20, s.ai_features.length * 7);
  score += featureWeight;
  const sensitive = s.ai_features.filter((f) =>
    /scoring|predictive|behavioral|ranking|profiling|assignment/i.test(f),
  );
  if (sensitive.length > 0) { score += 10; reasons.push(`${sensitive.length} sensitive AI feature(s)`); }

  score += Math.min(15, s.annex3_categories.length * 8);

  if (s.legal_status === "under_investigation") { score += 12; reasons.push("under investigation"); }
  else if (s.legal_status === "under_review") { score += 6; reasons.push("under review"); }

  score = Math.min(100, Math.round(score));

  const friaRequired = s.risk_tier === "annex3" || s.risk_tier === "prohibited";
  const rationale = friaRequired
    ? `FRIA mandatory under AI Act Art. 27 — ${reasons.join(", ") || "high-risk classification"}.`
    : `No mandatory FRIA at current classification, but recommended given ${reasons.join(", ") || "deployment footprint"}.`;

  return { score, friaRequired, rationale };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-atlas:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT
        e.id, e.country_code, e.system_name, e.vendor, e.deployment_scope,
        e.students_affected, e.ai_features, e.annex3_categories, e.risk_tier,
        e.legal_status, e.source_url, e.description, e.last_verified::text AS last_verified,
        g.age_consent AS legal_age_consent
      FROM children_edtech_systems e
      LEFT JOIN children_gdpr_age g ON g.country_code = e.country_code
      ORDER BY e.country_code, e.system_name
    `);

    const systems: AtlasSystem[] = (rows as unknown as Array<Record<string, unknown>>).map((r) => {
      const aiFeatures = (r.ai_features as string[]) ?? [];
      const annex3 = (r.annex3_categories as string[]) ?? [];
      const scope = String(r.deployment_scope);
      const tier = String(r.risk_tier);
      const legalStatus = r.legal_status ? String(r.legal_status) : null;

      const { score, friaRequired, rationale } = computeRiskScore({
        deployment_scope: scope,
        ai_features: aiFeatures,
        annex3_categories: annex3,
        risk_tier: tier,
        legal_status: legalStatus,
      });

      return {
        id: String(r.id),
        country_code: String(r.country_code),
        system_name: String(r.system_name),
        vendor: r.vendor ? String(r.vendor) : null,
        deployment_scope: scope,
        students_affected: r.students_affected !== null ? Number(r.students_affected) : null,
        ai_features: aiFeatures,
        annex3_categories: annex3,
        risk_tier: tier,
        legal_status: legalStatus,
        source_url: r.source_url ? String(r.source_url) : null,
        description: String(r.description),
        last_verified: String(r.last_verified),
        legal_age_consent: r.legal_age_consent !== null ? Number(r.legal_age_consent) : null,
        risk_score: score,
        fria_required: friaRequired,
        fria_rationale: rationale,
      };
    });

    systems.sort((a, b) => b.risk_score - a.risk_score);

    const summary = {
      total: systems.length,
      annex3_count: systems.filter((s) => s.risk_tier === "annex3").length,
      fria_required_count: systems.filter((s) => s.fria_required).length,
      countries: [...new Set(systems.map((s) => s.country_code))].length,
      students_total: systems.reduce((sum, s) => sum + (s.students_affected ?? 0), 0),
    };

    return NextResponse.json(
      { systems, summary, generated_at: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=600" } },
    );
  } catch (e) {
    console.error("[children-v2/atlas]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
