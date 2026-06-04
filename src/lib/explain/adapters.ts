/**
 * Explain Why — adapters.
 *
 * Each adapter turns an engine's output into the generic Explanation shape.
 * All reasons, remediations and score impacts are derived from the engine
 * data itself — nothing here is hand-waved. Adding a new explainable view
 * means adding one adapter, not touching the popover or the engine.
 */

import type { Explanation, ExplainRemediation } from "./explain-engine";
import type { RegimeScore } from "@/lib/compliance-dna/scoring";
import type { CoverageResult } from "@/lib/compliance-bridge/bridge-engine";

/**
 * Compliance DNA: explain a single regime's weighted coverage score.
 * Reasons = unmet/partial obligations by force; remediations = closing them,
 * weighted so that legal obligations (highest force weight) give the most points.
 */
export function explainRegimeScore(score: RegimeScore): Explanation {
  const reasons = [];
  const remediations: ExplainRemediation[] = [];

  const gap = 100 - score.coveragePct;

  if (score.unmet > 0) {
    reasons.push({
      code: "unmet",
      label: `${score.unmet} obligation${score.unmet > 1 ? "s" : ""} unmet`,
      detail: `Unmet items weigh most heavily where they are legal obligations rather than best practice.`,
    });
    remediations.push({
      code: "close_unmet",
      action: `Evidence the ${score.unmet} unmet obligation${score.unmet > 1 ? "s" : ""} in ${score.regime.name}`,
      effort: score.unmet > 4 ? "high" : score.unmet > 1 ? "medium" : "low",
      timeEstimate: score.unmet > 4 ? "4–8 weeks" : score.unmet > 1 ? "2–4 weeks" : "1–2 weeks",
      scoreImpactPts: Math.round(gap * 0.7),
    });
  }

  if (score.partial > 0) {
    reasons.push({
      code: "partial",
      label: `${score.partial} obligation${score.partial > 1 ? "s" : ""} only partially met`,
      detail: `Partial items count at half weight; completing the evidence converts them to full coverage.`,
    });
    remediations.push({
      code: "complete_partial",
      action: `Complete evidence for ${score.partial} partial obligation${score.partial > 1 ? "s" : ""}`,
      effort: "low",
      timeEstimate: "1–2 weeks",
      scoreImpactPts: Math.round(gap * 0.3),
    });
  }

  if (score.regime.legalForce === "voluntary_standard") {
    reasons.push({
      code: "voluntary",
      label: "Voluntary standard",
      detail: "This regime carries no administrative fine; coverage reflects certification readiness, not legal exposure.",
    });
  }

  return {
    subject: `${score.regime.name} coverage`,
    currentValue: `${score.coveragePct}%`,
    reasons,
    remediations,
    projectedValue: remediations.length > 0 ? `${Math.min(100, score.coveragePct + remediations.reduce((s, r) => s + r.scoreImpactPts, 0))}%` : undefined,
  };
}

/**
 * Compliance Bridge: explain reverse-coverage (ISO 42001 → AI Act).
 * Reasons = the gaps; remediations = standing up each missing AI Act
 * obligation, since these have no ISO 42001 equivalent.
 */
export function explainReverseCoverage(result: CoverageResult): Explanation {
  const reasons = result.gaps.map((m) => ({
    code: m.id,
    label: `${m.aiAct.ref} not covered`,
    detail: m.note,
    reference: m.aiAct.ref,
  }));

  const perGapGain = result.gaps.length > 0 ? Math.round((100 - result.coveragePct) / result.gaps.length) : 0;

  const remediations: ExplainRemediation[] = result.gaps.map((m) => ({
    code: `fix_${m.id}`,
    action: `Stand up ${m.aiAct.title} (${m.aiAct.ref}) — no ISO 42001 equivalent exists`,
    effort: /registration|CE marking/i.test(m.aiAct.title) ? "low" : "high",
    timeEstimate: /registration|CE marking/i.test(m.aiAct.title) ? "1–2 weeks" : "4–10 weeks",
    scoreImpactPts: perGapGain,
    reference: m.aiAct.ref,
  }));

  return {
    subject: `${result.fromFramework} → ${result.toFramework} coverage`,
    currentValue: `${result.coveragePct}%`,
    reasons,
    remediations,
    projectedValue: "100%",
  };
}
