import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-systems:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const area = request.nextUrl.searchParams.get("area");
  const tier = request.nextUrl.searchParams.get("tier");

  try {
    const rows = await db.execute(sql`
      SELECT s.id, s.name, s.purpose, s.annex_area, s.risk_tier, s.deployment_status,
             s.countries, s.legal_basis, s.fria_known, s.affects_children, s.affects_migrants,
             s.provenance, s.created_at,
             p.name AS provider_name, p.country AS provider_country,
             (SELECT COUNT(*)::int FROM rg_sources src WHERE src.entity_type = 'system' AND src.entity_id = s.id) AS source_count
      FROM rg_systems s
      LEFT JOIN rg_providers p ON p.id = s.provider_id
      ${area ? sql`WHERE s.annex_area = ${area}` : sql``}
      ${tier && !area ? sql`WHERE s.risk_tier = ${tier}` : sql``}
      ${tier && area ? sql`AND s.risk_tier = ${tier}` : sql``}
      ORDER BY
        CASE s.provenance WHEN 'expert_validated' THEN 0 WHEN 'verified' THEN 1 ELSE 2 END,
        s.created_at DESC
      LIMIT 200
    `);

    const items = (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      name: String(r.name),
      purpose: String(r.purpose),
      annexArea: String(r.annex_area),
      riskTier: String(r.risk_tier),
      deploymentStatus: String(r.deployment_status),
      countries: (r.countries as string[]) ?? [],
      legalBasis: r.legal_basis ? String(r.legal_basis) : null,
      friaKnown: !!r.fria_known,
      affectsChildren: !!r.affects_children,
      affectsMigrants: !!r.affects_migrants,
      provenance: String(r.provenance),
      provider: r.provider_name ? String(r.provider_name) : null,
      sourceCount: Number(r.source_count ?? 0),
    }));

    const summary = {
      total: items.length,
      highRisk: items.filter((i) => i.riskTier === "high_risk" || i.riskTier === "prohibited").length,
      withoutFria: items.filter((i) => !i.friaKnown && (i.riskTier === "high_risk" || i.riskTier === "prohibited")).length,
      affectingChildren: items.filter((i) => i.affectsChildren).length,
      affectingMigrants: items.filter((i) => i.affectsMigrants).length,
      verified: items.filter((i) => i.provenance === "verified" || i.provenance === "expert_validated").length,
    };

    return NextResponse.json(
      { items, summary, generated_at: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/systems]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
