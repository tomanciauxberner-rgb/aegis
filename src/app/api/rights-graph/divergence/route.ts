import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const AUTHORITY_KINDS = new Set(["eu_body", "national_dpa", "sector_regulator", "court"]);

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-divergence:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT p.topic, p.authority, p.authority_code, p.stance, p.source_url,
             p.stated_at, p.provenance, p.source_tier,
             p.anchor_quote, p.anchor_locator,
             a.label AS authority_label, a.kind AS authority_kind, a.in_eea
      FROM rg_positions p
      LEFT JOIN rg_authorities a ON a.code = p.authority_code
      ORDER BY p.topic, p.stated_at DESC NULLS LAST
    `);

    const byTopic = new Map<string, Array<Record<string, unknown>>>();
    for (const r of rows as unknown as Array<Record<string, unknown>>) {
      const t = String(r.topic);
      if (!byTopic.has(t)) byTopic.set(t, []);
      byTopic.get(t)!.push({
        authority: String(r.authority),
        authorityCode: r.authority_code ? String(r.authority_code) : null,
        authorityLabel: r.authority_label ? String(r.authority_label) : null,
        authorityKind: r.authority_kind ? String(r.authority_kind) : null,
        inEea: r.in_eea === null || r.in_eea === undefined ? null : Boolean(r.in_eea),
        stance: String(r.stance),
        sourceUrl: String(r.source_url),
        sourceTier: r.source_tier ? String(r.source_tier) : null,
        statedAt: r.stated_at ? String(r.stated_at) : null,
        provenance: String(r.provenance),
        anchorQuote: r.anchor_quote ? String(r.anchor_quote) : null,
        anchorLocator: r.anchor_locator ? String(r.anchor_locator) : null,
      });
    }

    const topics = Array.from(byTopic.entries()).map(([topic, positions]) => {
      const codes = new Set(
        positions
          .filter((p) => p.authorityCode && AUTHORITY_KINDS.has(String(p.authorityKind)))
          .map((p) => String(p.authorityCode)),
      );
      return {
        topic,
        positions,
        authorityCount: codes.size,
        diverges: codes.size >= 2,
        unmappedCount: positions.filter((p) => !p.authorityCode).length,
      };
    });

    topics.sort((a, b) => Number(b.diverges) - Number(a.diverges) || b.authorityCount - a.authorityCount);

    const all = Array.from(byTopic.values()).flat();
    const summary = {
      topics: topics.length,
      diverging: topics.filter((t) => t.diverges).length,
      positions: all.length,
      primary: all.filter((p) => p.sourceTier === "primary").length,
      secondary: all.filter((p) => p.sourceTier === "secondary").length,
      anchored: all.filter((p) => p.anchorQuote).length,
    };

    return NextResponse.json(
      { topics, summary, generated_at: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/divergence]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
