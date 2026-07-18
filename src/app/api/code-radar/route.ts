import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";
import { RADAR_SOURCES } from "@/lib/code-radar/sources";
import type { CodeRadarPayload } from "@/db/schema/code-radar";

interface SnapshotRow {
  source_id: string;
  country: string;
  captured_at: string;
  status: string;
  payload: CodeRadarPayload | null;
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("code_radar_snapshots")
    .select("source_id, country, captured_at, status, payload")
    .order("captured_at", { ascending: false })
    .limit(100);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const latestAny: Record<string, SnapshotRow> = {};
  const latestOk: Record<string, SnapshotRow> = {};
  for (const row of (data ?? []) as SnapshotRow[]) {
    if (!latestAny[row.source_id]) latestAny[row.source_id] = row;
    if (row.status === "ok" && !latestOk[row.source_id]) latestOk[row.source_id] = row;
  }

  const sources = RADAR_SOURCES.map((s) => {
    const any = latestAny[s.id] ?? null;
    const ok = latestOk[s.id] ?? null;
    return {
      id: s.id,
      country: s.country,
      label: s.label,
      kind: s.kind,
      enabled: s.enabled,
      note: s.note,
      latest: any
        ? {
            captured_at: any.captured_at,
            status: any.status,
            fetched_via: any.payload?.fetched_via ?? null,
            totals: any.payload?.totals ?? null,
          }
        : null,
      last_ok: ok
        ? {
            captured_at: ok.captured_at,
            totals: ok.payload?.totals ?? null,
            hosts: ok.payload?.hosts ?? [],
          }
        : null,
    };
  });

  return NextResponse.json(
    { sources, generated_at: new Date().toISOString() },
    { headers: { "Cache-Control": "public, max-age=300" } }
  );
}
