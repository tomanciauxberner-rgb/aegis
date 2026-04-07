import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) return NextResponse.json({ error: "Rate limit" }, { status: 429 });

  const { searchParams } = new URL(request.url);
  const group = searchParams.get("group");
  const sector = searchParams.get("sector");
  const indicator = searchParams.get("indicator");

  const supabase = await createClient();

  let query = supabase
    .from("signals")
    .select("country, group_id, sector, value_observed, value_eu_avg, year_observed, title, severity")
    .eq("is_active", true)
    .eq("signal_type", "statistical")
    .not("value_observed", "is", null);

  if (group) query = query.eq("group_id", group);
  if (sector) query = query.eq("sector", sector);

  const { data, error } = await query.order("year_observed", { ascending: false }).limit(200);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const byCountry: Record<string, { value: number; year: number; severity: string; title: string }> = {};
  for (const row of (data ?? [])) {
    if (!row.country || row.country === "EU" || row.country.length !== 2) continue;
    if (indicator && !row.title?.toLowerCase().includes(indicator.toLowerCase())) continue;
    if (!byCountry[row.country] || row.year_observed > byCountry[row.country].year) {
      byCountry[row.country] = {
        value: Number(row.value_observed),
        year: row.year_observed,
        severity: row.severity,
        title: row.title,
      };
    }
  }

  return NextResponse.json({ data: byCountry }, {
    headers: { "Cache-Control": "public, max-age=300" },
  });
}
