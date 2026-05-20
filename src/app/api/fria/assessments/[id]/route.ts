import { NextRequest, NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { friaAssessments } from "@/db/schema/tables";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrg } from "@/lib/auth/org";

export const dynamic = "force-dynamic";

const UpdateSchema = z.object({
  title: z.string().max(300).optional(),
  status: z.enum(["draft", "in_review", "published", "archived"]).optional(),
  draftState: z.record(z.string(), z.unknown()).optional(),
  overallRiskLevel: z.enum(["minimal", "low", "medium", "high", "critical"]).optional(),
  conclusion: z.string().optional(),
  dpiaReference: z.string().max(200).optional(),
  dpiaOverlapNotes: z.string().optional(),
});

async function resolve(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  const orgId = await getOrCreateOrg(user.id);
  return { user, orgId };
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await resolve(request);
  if ("error" in ctx) return ctx.error;

  try {
    const rows = await db
      .select()
      .from(friaAssessments)
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, ctx.orgId)))
      .limit(1);

    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rows[0]);
  } catch (e) {
    console.error("[fria/assessments/[id] GET]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await resolve(request);
  if ("error" in ctx) return ctx.error;

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  const parsed = UpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const owned = await db
      .select({ id: friaAssessments.id })
      .from(friaAssessments)
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, ctx.orgId)))
      .limit(1);
    if (owned.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const u = parsed.data;
    const [row] = await db
      .update(friaAssessments)
      .set({
        ...(u.title !== undefined ? { title: u.title } : {}),
        ...(u.status !== undefined ? { status: u.status } : {}),
        ...(u.draftState !== undefined ? { draftState: u.draftState } : {}),
        ...(u.overallRiskLevel !== undefined ? { overallRiskLevel: u.overallRiskLevel } : {}),
        ...(u.conclusion !== undefined ? { conclusion: u.conclusion } : {}),
        ...(u.dpiaReference !== undefined ? { dpiaReference: u.dpiaReference } : {}),
        ...(u.dpiaOverlapNotes !== undefined ? { dpiaOverlapNotes: u.dpiaOverlapNotes } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, ctx.orgId)))
      .returning({ id: friaAssessments.id, updatedAt: friaAssessments.updatedAt });

    return NextResponse.json({ id: row.id, updatedAt: row.updatedAt });
  } catch (e) {
    console.error("[fria/assessments/[id] PATCH]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const ctx = await resolve(request);
  if ("error" in ctx) return ctx.error;

  try {
    const deleted = await db
      .delete(friaAssessments)
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, ctx.orgId)))
      .returning({ id: friaAssessments.id });

    if (deleted.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ deleted: deleted[0].id });
  } catch (e) {
    console.error("[fria/assessments/[id] DELETE]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
