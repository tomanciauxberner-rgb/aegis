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
  const { success } = await rateLimitDistributed(`rg-exposure:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    // High-risk / prohibited systems with NO known FRIA — the core of the expert question.
    const sysRows = await db.execute(sql`
      SELECT s.id, s.name, s.annex_area, s.risk_tier, s.countries, s.legal_basis,
             s.affects_children, s.affects_migrants,
             p.name AS provider,
             (SELECT COUNT(*)::int FROM rg_sources src WHERE src.entity_type = 'system' AND src.entity_id = s.id) AS sources
      FROM rg_systems s
      LEFT JOIN rg_providers p ON p.id = s.provider_id
      WHERE s.risk_tier IN ('high_risk','prohibited') AND s.fria_known = FALSE
      ORDER BY
        CASE s.provenance WHEN 'expert_validated' THEN 0 WHEN 'verified' THEN 1 ELSE 2 END,
        s.annex_area
    `);

    // Topics where regulators diverge (>= 2 authorities).
    const divRows = await db.execute(sql`
      SELECT topic, COUNT(DISTINCT authority)::int AS authorities
      FROM rg_positions
      GROUP BY topic
      HAVING COUNT(DISTINCT authority) >= 2
      ORDER BY authorities DESC
    `);
    const divergences = (divRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      topic: String(r.topic),
      authorities: Number(r.authorities ?? 0),
    }));

    const systems = (sysRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      area: String(r.annex_area),
      areaLabel: AREA_LABEL[String(r.annex_area)] ?? String(r.annex_area),
      riskTier: String(r.risk_tier),
      countries: (r.countries as string[]) ?? [],
      provider: r.provider ? String(r.provider) : null,
      affectsChildren: !!r.affects_children,
      affectsMigrants: !!r.affects_migrants,
      sources: Number(r.sources ?? 0),
    }));

    return NextResponse.json(
      {
        question: "High-risk AI systems with no publicly identifiable Fundamental Rights Impact Assessment — set against the regulatory questions where authorities themselves diverge.",
        systems,
        divergences,
        summary: {
          systemsNoFria: systems.length,
          affectingChildren: systems.filter((s) => s.affectsChildren).length,
          affectingMigrants: systems.filter((s) => s.affectsMigrants).length,
          divergingTopics: divergences.length,
        },
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/exposure]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
