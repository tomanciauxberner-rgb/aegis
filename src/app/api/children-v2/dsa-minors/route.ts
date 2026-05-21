import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-dsa-minors:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT id, action_type, status, target, title, summary, dsa_article,
             concerns, action_date::text AS action_date, source_url
      FROM children_dsa_minors
      ORDER BY action_date DESC
    `);

    const items = (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.id),
      actionType: String(r.action_type),
      status: String(r.status),
      target: r.target ? String(r.target) : null,
      title: String(r.title),
      summary: String(r.summary),
      dsaArticle: String(r.dsa_article),
      concerns: (r.concerns as string[]) ?? [],
      actionDate: String(r.action_date),
      sourceUrl: String(r.source_url),
    }));

    const summary = {
      total: items.length,
      ongoing: items.filter((i) => i.status === "ongoing" || i.status === "preliminary").length,
      targets: [...new Set(items.filter((i) => i.target).map((i) => i.target))].length,
    };

    return NextResponse.json(
      { items, summary, generated_at: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=600, s-maxage=600" } },
    );
  } catch (e) {
    console.error("[children-v2/dsa-minors]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
