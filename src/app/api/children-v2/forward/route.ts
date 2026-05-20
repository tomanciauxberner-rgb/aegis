import { NextRequest, NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/db/client";
import { rateLimitDistributed } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";

interface ForwardSignal {
  id: string;
  signal_type: string;
  status: string;
  title_en: string;
  summary_en: string;
  signal_date: string;
  deadline_date: string | null;
  days_to_deadline: number | null;
  jurisdiction: string;
  themes: string[];
  legal_frameworks: string[];
  relevance_score: number;
  why_it_matters: string | null;
  stakeholders: string[];
  source_url: string;
  source_acronym: string | null;
  action_score: number;
  action_label: "act_now" | "monitor" | "track";
}

function actionScore(row: {
  status: string;
  relevance: number;
  daysToDeadline: number | null;
}): { score: number; label: ForwardSignal["action_label"] } {
  let score = row.relevance;

  const actionableStatus: Record<string, number> = {
    open: 30, upcoming: 15, in_progress: 10, closed: -10, adopted: 0, withdrawn: -30,
  };
  score += actionableStatus[row.status] ?? 0;

  let label: ForwardSignal["action_label"] = "track";
  if (row.daysToDeadline !== null && row.daysToDeadline >= 0) {
    if (row.daysToDeadline <= 14) { score += 40; label = "act_now"; }
    else if (row.daysToDeadline <= 45) { score += 20; label = "monitor"; }
    else { score += 5; }
  }
  if (label !== "act_now" && row.status === "open") label = "monitor";

  return { score: Math.max(0, Math.min(150, Math.round(score))), label };
}

export async function GET(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? "anon";
  const { success } = await rateLimitDistributed(`children-forward:${ip}`, 60);
  if (!success) return NextResponse.json({ error: "Rate limit exceeded" }, { status: 429 });

  try {
    const rows = await db.execute(sql`
      SELECT
        ps.id, ps.signal_type, ps.status, ps.title_en, ps.summary_en,
        ps.signal_date::text AS signal_date,
        ps.deadline_date::text AS deadline_date,
        CASE WHEN ps.deadline_date IS NOT NULL
             THEN (ps.deadline_date - CURRENT_DATE)
             ELSE NULL END AS days_to_deadline,
        ps.jurisdiction, ps.themes, ps.legal_frameworks, ps.relevance_score,
        ps.why_it_matters, ps.stakeholders, ps.source_url,
        src.acronym AS source_acronym
      FROM children_policy_signals ps
      JOIN children_policy_sources src ON src.id = ps.source_id
      WHERE ps.relevance_score >= 40
      ORDER BY ps.signal_date DESC
      LIMIT 100
    `);

    const signals: ForwardSignal[] = (rows as unknown as Array<Record<string, unknown>>).map((r) => {
      const days = r.days_to_deadline !== null ? Number(r.days_to_deadline) : null;
      const { score, label } = actionScore({
        status: String(r.status),
        relevance: Number(r.relevance_score ?? 0),
        daysToDeadline: days,
      });
      return {
        id: String(r.id),
        signal_type: String(r.signal_type),
        status: String(r.status),
        title_en: String(r.title_en),
        summary_en: String(r.summary_en),
        signal_date: String(r.signal_date),
        deadline_date: r.deadline_date ? String(r.deadline_date) : null,
        days_to_deadline: days,
        jurisdiction: String(r.jurisdiction),
        themes: (r.themes as string[]) ?? [],
        legal_frameworks: (r.legal_frameworks as string[]) ?? [],
        relevance_score: Number(r.relevance_score ?? 0),
        why_it_matters: r.why_it_matters ? String(r.why_it_matters) : null,
        stakeholders: (r.stakeholders as string[]) ?? [],
        source_url: String(r.source_url),
        source_acronym: r.source_acronym ? String(r.source_acronym) : null,
        action_score: score,
        action_label: label,
      };
    });

    signals.sort((a, b) => b.action_score - a.action_score);

    const actNow = signals.filter((s) => s.action_label === "act_now");
    const monitor = signals.filter((s) => s.action_label === "monitor");
    const track = signals.filter((s) => s.action_label === "track");

    const summary = {
      total: signals.length,
      act_now: actNow.length,
      monitor: monitor.length,
      open_consultations: signals.filter((s) => s.status === "open").length,
      next_deadline: actNow[0]?.deadline_date ?? monitor[0]?.deadline_date ?? null,
    };

    return NextResponse.json(
      { act_now: actNow, monitor, track, summary, generated_at: new Date().toISOString() },
      { headers: { "Cache-Control": "public, max-age=180, s-maxage=180" } },
    );
  } catch (e) {
    console.error("[children-v2/forward]", e);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
