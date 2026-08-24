import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-divergence:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT topic, authority, stance, source_url, stated_at, provenance
      FROM rg_positions
      ORDER BY topic, stated_at DESC NULLS LAST
    `);

    const byTopic = new Map<string, Array<Record<string, unknown>>>();
    for (const r of rows as unknown as Array<Record<string, unknown>>) {
      const t = String(r.topic);
      if (!byTopic.has(t)) byTopic.set(t, []);
      byTopic.get(t)!.push({
        authority: String(r.authority),
        stance: String(r.stance),
        sourceUrl: String(r.source_url),
        statedAt: r.stated_at ? String(r.stated_at) : null,
        provenance: String(r.provenance),
      });
    }

    const topics = Array.from(byTopic.entries()).map(([topic, positions]) => {
      const authorities = new Set(positions.map((p) => p.authority));
      return {
        topic,
        positions,
        authorityCount: authorities.size,
        diverges: authorities.size >= 2,
      };
    });

    // Diverging topics first, then by number of positions
    topics.sort((a, b) => Number(b.diverges) - Number(a.diverges) || b.positions.length - a.positions.length);

    const summary = {
      topics: topics.length,
      diverging: topics.filter((t) => t.diverges).length,
      positions: (rows as unknown as unknown[]).length,
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
