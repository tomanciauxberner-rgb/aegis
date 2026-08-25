import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

function flagFor(code: string): string {
  if (!/^[A-Za-z]{2}$/.test(code)) return "";
  return String.fromCodePoint(
    ...code.toUpperCase().split("").map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-incidents:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT i.ext_id, i.country, i.title, i.summary, i.sector, i.groups,
             i.severity, i.occurred_at, i.occurred_label,
             i.source_label, i.source_url, i.source_tier, i.provenance::text AS provenance,
             i.system_id, s.name AS system_name
      FROM rg_incidents i
      LEFT JOIN rg_systems s ON s.id = i.system_id
      ORDER BY
        CASE i.severity WHEN 'critical' THEN 0 WHEN 'high' THEN 1 WHEN 'elevated' THEN 2 ELSE 3 END,
        i.occurred_at DESC NULLS LAST
    `);

    const incidents = (rows as unknown as Array<Record<string, unknown>>).map((r) => ({
      id: String(r.ext_id),
      country: String(r.country),
      flag: flagFor(String(r.country)),
      title: String(r.title),
      summary: String(r.summary),
      sector: r.sector ? String(r.sector) : "",
      groups: (r.groups as string[]) ?? [],
      severity: String(r.severity),
      date: r.occurred_label ? String(r.occurred_label) : (r.occurred_at ? String(r.occurred_at) : ""),
      source: String(r.source_label),
      url: String(r.source_url),
      sourceTier: r.source_tier ? String(r.source_tier) : null,
      provenance: r.provenance ? String(r.provenance) : null,
      systemId: r.system_id ? String(r.system_id) : null,
      systemName: r.system_name ? String(r.system_name) : null,
    }));

    return NextResponse.json(
      {
        incidents,
        summary: {
          total: incidents.length,
          linkedToGraph: incidents.filter((i) => i.systemId).length,
          primarySourced: incidents.filter((i) => i.sourceTier === "primary").length,
        },
        generated_at: new Date().toISOString(),
      },
      { headers: { "Cache-Control": "public, max-age=300, s-maxage=300" } },
    );
  } catch (e) {
    console.error("[rg/incidents]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
