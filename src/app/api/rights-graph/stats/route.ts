import { NextRequest, NextResponse } from "next/server";
import { rateLimitDistributed } from "@/lib/rate-limit";
import { getRightsGraphStats } from "@/lib/rights-graph-stats";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`rg-stats:${ip}`, 120);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const stats = await getRightsGraphStats();
  if (!stats) return NextResponse.json({ error: "Database error" }, { status: 500 });

  return NextResponse.json(stats, {
    headers: { "Cache-Control": "public, max-age=300, s-maxage=300" },
  });
}
