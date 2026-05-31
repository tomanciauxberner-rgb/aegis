import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

// rg_systems.annex_area  ->  jurisprudence sectors vocabulary
const AREA_TO_SECTORS: Record<string, string[]> = {
  employment: ["employment"],
  education: ["education"],
  essential: ["essential_services"],
  law_enforcement: ["law_enforcement", "justice"],
  migration: ["migration", "law_enforcement"],
  justice: ["justice", "law_enforcement"],
  biometrics: ["law_enforcement", "essential_services"],
  critical_infra: ["essential_services"],
  healthcare: ["essential_services"],
};

const RELEVANCE_RANK: Record<string, number> = { binding: 0, persuasive: 1, illustrative: 2 };

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-precedents:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const systemId = searchParams.get("system");

  try {
    // Resolve target systems: one if ?system=, else all high-risk/prohibited.
    const sysRows = await db.execute(
      systemId
        ? sql`SELECT id, name, annex_area, risk_tier FROM rg_systems WHERE id = ${systemId} LIMIT 1`
        : sql`SELECT id, name, annex_area, risk_tier FROM rg_systems WHERE risk_tier IN ('high_risk','prohibited') ORDER BY annex_area`
    );
    const systems = sysRows as unknown as Array<Record<string, unknown>>;
    if (systems.length === 0) {
      return NextResponse.json({ systems: [], generated_at: new Date().toISOString() });
    }

    // Pull active jurisprudence once.
    const caseRows = await db.execute(sql`
      SELECT id, court, name, citation, year, country, holding, relevance, sectors, ai_act_articles, rights_categories, url
      FROM jurisprudence_cases
      WHERE is_active = TRUE
    `);
    const cases = (caseRows as unknown as Array<Record<string, unknown>>).map((c) => ({
      id: String(c.id),
      court: String(c.court),
      name: String(c.name),
      citation: String(c.citation),
      year: Number(c.year),
      country: c.country ? String(c.country) : null,
      holding: String(c.holding),
      relevance: String(c.relevance),
      sectors: (c.sectors as string[]) ?? [],
      aiActArticles: (c.ai_act_articles as string[]) ?? [],
      rightsCategories: (c.rights_categories as string[]) ?? [],
      url: c.url ? String(c.url) : null,
    }));

    const result = systems.map((s) => {
      const area = String(s.annex_area);
      const targetSectors = AREA_TO_SECTORS[area] ?? [];
      const matched = cases
        .filter((c) => c.sectors.some((sec) => targetSectors.includes(sec)))
        .sort((a, b) =>
          (RELEVANCE_RANK[a.relevance] ?? 9) - (RELEVANCE_RANK[b.relevance] ?? 9) || b.year - a.year
        );
      return {
        systemId: String(s.id),
        systemName: String(s.name),
        area,
        riskTier: String(s.risk_tier),
        precedentCount: matched.length,
        precedents: matched.slice(0, 8),
      };
    });

    // If a single system was requested, return it directly.
    if (systemId) {
      return NextResponse.json(
        { ...result[0], note: "Precedents are matched by shared regulatory sector, not by a direct link between this system and these rulings.", generated_at: new Date().toISOString() },
        { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
      );
    }

    return NextResponse.json(
      {
        systems: result,
        note: "Precedents are matched by shared regulatory sector. They are relevant context, not a claim that a ruling concerned this specific system.",
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } }
    );
  } catch (e) {
    console.error("[rg/precedents]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
