import { NextRequest, NextResponse } from "next/server";
import { eq, desc } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { scenarioAnalyses } from "@/db/schema/scenario-analyses";
import { createClient } from "@/lib/supabase/server";
import { canContribute } from "@/lib/auth/contributor";

export const dynamic = "force-dynamic";

export async function GET() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canContribute(user.id))) {
    return NextResponse.json({ error: "Contributor access required" }, { status: 403 });
  }

  try {
    const rows = await db
      .select({
        id: scenarioAnalyses.id,
        role: scenarioAnalyses.role,
        nature: scenarioAnalyses.nature,
        annexArea: scenarioAnalyses.annexArea,
        country: scenarioAnalyses.country,
        description: scenarioAnalyses.description,
        verdict: scenarioAnalyses.verdict,
        profilingFlag: scenarioAnalyses.profilingFlag,
        analysis: scenarioAnalyses.analysis,
        reviewStatus: scenarioAnalyses.reviewStatus,
        reviewerNote: scenarioAnalyses.reviewerNote,
        reviewedAt: scenarioAnalyses.reviewedAt,
        createdAt: scenarioAnalyses.createdAt,
      })
      .from(scenarioAnalyses)
      .orderBy(desc(scenarioAnalyses.createdAt))
      .limit(50);

    return NextResponse.json({ items: rows });
  } catch (e) {
    console.error("[scenario/review GET]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

const PatchSchema = z.object({
  id: z.string().uuid(),
  status: z.enum(["validated", "corrected"]),
  note: z.string().max(2000).optional().or(z.literal("")),
});

export async function PATCH(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!(await canContribute(user.id))) {
    return NextResponse.json({ error: "Contributor access required" }, { status: 403 });
  }

  let body: unknown;
  try { body = await request.json(); } catch { return NextResponse.json({ error: "Invalid body" }, { status: 400 }); }
  const parsed = PatchSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 });

  try {
    const [row] = await db
      .update(scenarioAnalyses)
      .set({
        reviewStatus: parsed.data.status,
        reviewerId: user.id,
        reviewerNote: parsed.data.note || null,
        reviewedAt: new Date(),
      })
      .where(eq(scenarioAnalyses.id, parsed.data.id))
      .returning({ id: scenarioAnalyses.id, reviewStatus: scenarioAnalyses.reviewStatus });

    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ id: row.id, reviewStatus: row.reviewStatus });
  } catch (e) {
    console.error("[scenario/review PATCH]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
