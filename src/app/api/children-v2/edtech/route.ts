import { NextRequest, NextResponse } from "next/server";
import { and, eq, desc, SQL } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { childrenEdtechSystems } from "@/db/schema/children";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

const QuerySchema = z.object({
  country: z.string().length(2).optional(),
  risk_tier: z.enum(["annex3", "prohibited", "limited", "minimal", "unknown"]).optional(),
  scope: z.enum(["national", "regional", "pilot", "withdrawn"]).optional(),
});

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-edtech:${ip}`, 60);
  if (!success) {
    return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });
  }

  const parsed = QuerySchema.safeParse(Object.fromEntries(request.nextUrl.searchParams));
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid query", details: parsed.error.flatten() }, { status: 400 });
  }

  const { country, risk_tier, scope } = parsed.data;

  try {
    const conditions: SQL[] = [];
    if (country)   conditions.push(eq(childrenEdtechSystems.countryCode, country.toUpperCase()));
    if (risk_tier) conditions.push(eq(childrenEdtechSystems.riskTier, risk_tier));
    if (scope)     conditions.push(eq(childrenEdtechSystems.deploymentScope, scope));

    const baseQuery = db.select().from(childrenEdtechSystems);
    const rows = conditions.length > 0
      ? await baseQuery.where(and(...conditions)).orderBy(desc(childrenEdtechSystems.lastVerified))
      : await baseQuery.orderBy(desc(childrenEdtechSystems.lastVerified));

    return NextResponse.json({
      items: rows,
      total: rows.length,
    }, {
      headers: { "Cache-Control": "public, max-age=900, s-maxage=900" },
    });
  } catch (e) {
    console.error("[children-v2/edtech]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
