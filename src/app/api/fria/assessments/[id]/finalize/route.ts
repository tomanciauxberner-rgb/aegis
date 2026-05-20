import { NextRequest, NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db/client";
import { friaAssessments, friaRisks, friaMitigations, rightsCategories } from "@/db/schema/tables";
import { createClient } from "@/lib/supabase/server";
import { getOrCreateOrg } from "@/lib/auth/org";

export const dynamic = "force-dynamic";

const RISK_SCORE: Record<string, number> = { minimal: 1, low: 2, medium: 3, high: 4, critical: 5 };
const SCORE_TO_LEVEL = (n: number): "minimal" | "low" | "medium" | "high" | "critical" => {
  if (n >= 20) return "critical";
  if (n >= 12) return "high";
  if (n >= 6) return "medium";
  if (n >= 3) return "low";
  return "minimal";
};

const BodySchema = z.object({
  targetStatus: z.enum(["in_review", "published"]).default("in_review"),
});

interface DraftRisk {
  id: string;
  rightsCategoryCode: string;
  title: string;
  description: string;
  likelihood: string;
  severity: string;
  dataEvidence?: { indicatorId: string; value: number; country: string; year: number; source: string }[];
}
interface DraftMitigation {
  id: string;
  riskId: string;
  title: string;
  description: string;
  responsible: string;
  deadline: string;
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let body: unknown;
  try { body = await request.json(); } catch { body = {}; }
  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  const { targetStatus } = parsed.data;

  try {
    const orgId = await getOrCreateOrg(user.id);

    const rows = await db
      .select()
      .from(friaAssessments)
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, orgId)))
      .limit(1);
    if (rows.length === 0) return NextResponse.json({ error: "Not found" }, { status: 404 });

    const fria = rows[0];
    const draft = (fria.draftState ?? {}) as {
      risks?: DraftRisk[];
      mitigations?: DraftMitigation[];
    };
    const draftRisks = draft.risks ?? [];
    const draftMitigations = draft.mitigations ?? [];

    // Resolve rights category codes -> uuids
    const codes = [...new Set(draftRisks.map((r) => r.rightsCategoryCode).filter(Boolean))];
    const catMap = new Map<string, string>();
    if (codes.length > 0) {
      const cats = await db
        .select({ id: rightsCategories.id, code: rightsCategories.code })
        .from(rightsCategories)
        .where(inArray(rightsCategories.code, codes));
      for (const c of cats) catMap.set(c.code, c.id);
    }

    // Wipe previously normalized rows for idempotency
    await db.delete(friaRisks).where(eq(friaRisks.friaId, id));

    // Insert normalized risks, keep mapping draftRiskId -> new uuid
    const riskIdMap = new Map<string, string>();
    let maxScore = 0;
    for (let i = 0; i < draftRisks.length; i++) {
      const r = draftRisks[i];
      const likelihood = (RISK_SCORE[r.likelihood] ? r.likelihood : "medium") as keyof typeof RISK_SCORE;
      const severity = (RISK_SCORE[r.severity] ? r.severity : "medium") as keyof typeof RISK_SCORE;
      const overall = SCORE_TO_LEVEL(RISK_SCORE[likelihood] * RISK_SCORE[severity]);
      maxScore = Math.max(maxScore, RISK_SCORE[likelihood] * RISK_SCORE[severity]);

      const [inserted] = await db.insert(friaRisks).values({
        friaId: id,
        rightsCategoryId: catMap.get(r.rightsCategoryCode) ?? null,
        title: (r.title || "Untitled risk").slice(0, 300),
        description: r.description || "",
        likelihood: likelihood as "minimal" | "low" | "medium" | "high" | "critical",
        severity: severity as "minimal" | "low" | "medium" | "high" | "critical",
        overallRisk: overall,
        dataEvidence: r.dataEvidence ?? [],
        sortOrder: i,
      }).returning({ id: friaRisks.id });
      riskIdMap.set(r.id, inserted.id);
    }

    // Insert normalized mitigations
    for (let i = 0; i < draftMitigations.length; i++) {
      const m = draftMitigations[i];
      let deadline: Date | null = null;
      if (m.deadline) {
        const d = new Date(m.deadline);
        if (!isNaN(d.getTime())) deadline = d;
      }
      await db.insert(friaMitigations).values({
        friaId: id,
        riskId: riskIdMap.get(m.riskId) ?? null,
        title: (m.title || "Untitled measure").slice(0, 300),
        description: m.description || "",
        responsible: m.responsible || null,
        deadline,
        status: "planned",
        sortOrder: i,
      });
    }

    const overallRiskLevel = draftRisks.length > 0 ? SCORE_TO_LEVEL(maxScore) : null;

    const [updated] = await db
      .update(friaAssessments)
      .set({
        status: targetStatus,
        overallRiskLevel,
        ...(targetStatus === "published" ? { publishedAt: new Date() } : {}),
        ...(targetStatus === "in_review" ? { reviewedBy: user.id } : {}),
        updatedAt: new Date(),
      })
      .where(and(eq(friaAssessments.id, id), eq(friaAssessments.orgId, orgId)))
      .returning({ id: friaAssessments.id, status: friaAssessments.status, overallRiskLevel: friaAssessments.overallRiskLevel });

    return NextResponse.json({
      id: updated.id,
      status: updated.status,
      overallRiskLevel: updated.overallRiskLevel,
      normalized: { risks: draftRisks.length, mitigations: draftMitigations.length },
    });
  } catch (e) {
    console.error("[fria/finalize]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
