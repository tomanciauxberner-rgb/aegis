import { NextRequest, NextResponse } from "next/server";
import { asc } from "drizzle-orm";
import { db } from "@/db/client";
import { childrenGdprAge } from "@/db/schema/children";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-gdpr:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  try {
    const rows = await db
      .select()
      .from(childrenGdprAge)
      .orderBy(asc(childrenGdprAge.countryCode));

    return NextResponse.json({
      items: rows,
      total: rows.length,
    }, {
      headers: { "Cache-Control": "public, max-age=3600, s-maxage=3600" },
    });
  } catch (e) {
    console.error("[children-v2/gdpr-age]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
