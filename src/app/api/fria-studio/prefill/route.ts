import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { createClient } from "@/lib/supabase/server";
import { mapAnnexAreaToDomain } from "@/lib/fria-studio/area-mapping";
import { getDomainByCode } from "@/lib/fria-studio/annex3-taxonomy";

export const dynamic = "force-dynamic";

/**
 * Builds a FRIA Studio draft state from a Rights Graph system.
 * Closes the loop: a system already mapped (sourced, with rights and
 * classification) generates its FRIA in one click. Nothing is fabricated —
 * fields the graph does not contain are left empty for expert completion.
 */
export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const systemId = request.nextUrl.searchParams.get("systemId");
  if (!systemId) return NextResponse.json({ error: "systemId required" }, { status: 400 });

  // Validate UUID shape before hitting the DB
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(systemId)) {
    return NextResponse.json({ error: "Invalid systemId" }, { status: 400 });
  }

  try {
    const sysRows = await db.execute(sql`
      SELECT s.id, s.name, s.purpose, s.annex_area, s.risk_tier, s.deployment_status,
             s.countries, s.legal_basis, s.fria_known, s.affects_children, s.affects_migrants,
             s.provenance,
             p.name AS provider_name, p.country AS provider_country
      FROM rg_systems s
      LEFT JOIN rg_providers p ON p.id = s.provider_id
      WHERE s.id = ${systemId}
      LIMIT 1
    `);

    const arr = sysRows as unknown as Array<Record<string, unknown>>;
    if (arr.length === 0) return NextResponse.json({ error: "System not found" }, { status: 404 });
    const s = arr[0];

    // Rights already mapped to this system in the graph
    const rightRows = await db.execute(sql`
      SELECT r.id, r.label, r.instrument, r.article, sr.impact_note
      FROM rg_system_rights sr
      JOIN rg_rights r ON r.id = sr.right_id
      WHERE sr.system_id = ${systemId}
    `);
    const mappedRights = (rightRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      label: String(r.label),
      instrument: String(r.instrument),
      article: r.article ? String(r.article) : null,
      impactNote: r.impact_note ? String(r.impact_note) : null,
    }));

    // Sources for traceability
    const sourceRows = await db.execute(sql`
      SELECT title, url, publisher, published_at
      FROM rg_sources
      WHERE entity_type = 'system' AND entity_id = ${systemId}
      ORDER BY published_at DESC NULLS LAST
      LIMIT 20
    `);
    const sources = (sourceRows as unknown as Array<Record<string, unknown>>).map((r) => ({
      title: String(r.title),
      url: String(r.url),
      publisher: r.publisher ? String(r.publisher) : null,
      publishedAt: r.published_at ? String(r.published_at) : null,
    }));

    const annexArea = s.annex_area ? String(s.annex_area) : null;
    const domainCode = mapAnnexAreaToDomain(annexArea);
    const domain = domainCode ? getDomainByCode(domainCode) : undefined;

    const countries = (s.countries as string[]) ?? [];
    const riskTier = String(s.risk_tier);
    const providerName = s.provider_name ? String(s.provider_name) : null;

    const draftState = {
      step: 1,
      source: "rights_graph",
      sourceSystemId: String(s.id),
      domainCode: domainCode ?? null,
      context: {
        deploymentDescription:
          `${String(s.name)}${providerName ? ` (${providerName})` : ""} — ${String(s.purpose)}` +
          (countries.length ? ` Deployed in: ${countries.join(", ")}.` : ""),
        operationalFrequency: "",
        duration: "",
        humanOversightMeasures: "",
      },
      lifecycleState: {},
      evidenceState: {},
      // Rights from the graph, plus the domain's full rights set as a checklist
      prefilledRights: mappedRights,
      domainRights: domain ? domain.fundamentalRights.map((r) => ({ code: r.code, label: r.label, charter: r.charter ?? null })) : [],
      sources,
      meta: {
        systemName: String(s.name),
        provider: providerName,
        annexArea,
        domainResolved: domainCode,
        domainResolvable: domainCode !== null,
        riskTier,
        deploymentStatus: String(s.deployment_status),
        friaKnown: !!s.fria_known,
        affectsChildren: !!s.affects_children,
        affectsMigrants: !!s.affects_migrants,
        provenance: String(s.provenance),
        legalBasis: s.legal_basis ? String(s.legal_basis) : null,
        friaRequired: riskTier === "high_risk" || riskTier === "prohibited",
      },
    };

    return NextResponse.json({
      title: `FRIA — ${String(s.name)}`,
      sourceRef: String(s.id),
      draftState,
    });
  } catch (e) {
    console.error("[fria-studio/prefill]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
