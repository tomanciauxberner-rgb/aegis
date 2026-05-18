import { NextRequest, NextResponse } from "next/server";
import { db } from "@/db/client";
import { aiSystems, organizations, orgMembers } from "@/db/schema/tables";
import { eq, and } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { rateLimit } from "@/lib/rate-limit";

async function getOrCreateOrg(userId: string): Promise<string> {
  const existing = await db
    .select({ orgId: orgMembers.orgId })
    .from(orgMembers)
    .where(eq(orgMembers.userId, userId))
    .limit(1);

  if (existing.length > 0) return existing[0].orgId;

  const [org] = await db.insert(organizations).values({
    name: "My Organization",
    slug: `org-${userId.slice(0, 8)}`,
    plan: "starter",
  }).returning({ id: organizations.id });

  await db.insert(orgMembers).values({
    orgId: org.id,
    userId,
    role: "owner",
  });

  return org.id;
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 30);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orgId = await getOrCreateOrg(user.id);
    const systems = await db
      .select()
      .from(aiSystems)
      .where(and(eq(aiSystems.orgId, orgId), eq(aiSystems.status, "active")))
      .orderBy(aiSystems.createdAt);

    return NextResponse.json({ systems, total: systems.length });
  } catch (error) {
    console.error("[systems/get]", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const identifier = request.headers.get("x-forwarded-for") ?? "anon";
  const { success } = rateLimit(identifier, 10);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: any;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid JSON" }, { status: 400 }); }

  const { name, description, provider, version, riskCategory, deploymentCountries, intendedPurpose, affectedPopulations } = body;
  if (!name?.trim()) return NextResponse.json({ error: "Name is required" }, { status: 400 });

  const HIGH_RISK_CATEGORIES = ["biometrics", "critical_infrastructure", "education", "employment", "essential_services", "law_enforcement", "migration", "justice"];
  const isHighRisk = HIGH_RISK_CATEGORIES.includes(riskCategory);

  try {
    const orgId = await getOrCreateOrg(user.id);
    const [system] = await db.insert(aiSystems).values({
      orgId,
      name: name.trim(),
      description: description?.trim() || null,
      provider: provider?.trim() || null,
      version: version?.trim() || null,
      riskCategory: riskCategory || null,
      deploymentCountries: deploymentCountries || [],
      intendedPurpose: intendedPurpose?.trim() || null,
      affectedPopulations: affectedPopulations || [],
      isHighRisk,
      requiresFria: isHighRisk,
      status: "active",
    }).returning();

    return NextResponse.json(system, { status: 201 });
  } catch (error) {
    console.error("[systems/post]", error);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
