import { NextRequest, NextResponse } from "next/server";
import { eq, and, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { friaAssessments } from "@/db/schema/tables";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrg } from "@/lib/auth/org";

export const dynamic = "force-dynamic";

const CreateSchema = z.object({
  title: z.string().max(300).optional(),
  sourceRef: z.string().max(200).optional(),
  draftState: z.record(z.string(), z.unknown()).optional(),
});

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const orgId = await getOrCreateOrg(user.id);
    const rows = await db
      .select({
        id: friaAssessments.id,
        title: friaAssessments.title,
        status: friaAssessments.status,
        version: friaAssessments.version,
        overallRiskLevel: friaAssessments.overallRiskLevel,
        sourceRef: friaAssessments.sourceRef,
        updatedAt: friaAssessments.updatedAt,
        createdAt: friaAssessments.createdAt,
      })
      .from(friaAssessments)
      .where(eq(friaAssessments.orgId, orgId))
      .orderBy(desc(friaAssessments.updatedAt))
      .limit(100);

    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error("[fria/assessments GET]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  const parsed = CreateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid body", details: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const orgId = await getOrCreateOrg(user.id);
    const { title, sourceRef, draftState } = parsed.data;

    const [row] = await db
      .insert(friaAssessments)
      .values({
        orgId,
        aiSystemId: null,
        conductedBy: user.id,
        status: "draft",
        title: title ?? "Untitled FRIA",
        sourceRef: sourceRef ?? null,
        draftState: draftState ?? null,
      })
      .returning({ id: friaAssessments.id, createdAt: friaAssessments.createdAt });

    return NextResponse.json({ id: row.id, createdAt: row.createdAt }, { status: 201 });
  } catch (e) {
    console.error("[fria/assessments POST]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
