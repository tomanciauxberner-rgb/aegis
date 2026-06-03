/**
 * FRIA Studio — Rights heatmap engine.
 * Aggregates per-fundamental-right exposure from the lifecycle risk
 * assessment, weighted by severity and offset by mitigation confidence.
 * The output drives a visual heatmap so a reviewer sees, at a glance,
 * which rights carry the most unmitigated exposure.
 */

import { LIFECYCLE_PHASES, type RiskSeverity } from "./lifecycle-risks";
import { FUNDAMENTAL_RIGHTS, type FundamentalRight } from "./annex3-taxonomy";
import { computeConfidence, type EvidenceState } from "./evidence-schema";

const SEVERITY_WEIGHT: Record<RiskSeverity, number> = {
  critical: 1.0,
  high: 0.7,
  medium: 0.4,
  low: 0.2,
};

export interface RightExposure {
  right: FundamentalRight;
  rawExposure: number;       // 0..1 — severity-weighted, before mitigation
  residualExposure: number;  // 0..1 — after mitigation confidence
  riskCount: number;
  contributingRisks: { code: string; label: string; severity: RiskSeverity; phase: string }[];
}

/**
 * Builds the per-right exposure map.
 * - rawExposure: how much severity-weighted risk touches this right
 * - residualExposure: that exposure discounted by the confidence that
 *   each contributing risk is mitigated (from the evidence chain)
 */
export function buildRightsHeatmap(
  domainRightCodes: string[],
  evidenceState: EvidenceState,
): RightExposure[] {
  const allRisks = LIFECYCLE_PHASES.flatMap((p) =>
    p.risks.map((r) => ({ ...r, phase: p.label }))
  );

  const exposures: RightExposure[] = [];

  for (const rightCode of domainRightCodes) {
    const right = FUNDAMENTAL_RIGHTS[rightCode];
    if (!right) continue;

    const contributing = allRisks.filter((r) => r.rights.includes(rightCode));
    if (contributing.length === 0) {
      exposures.push({ right, rawExposure: 0, residualExposure: 0, riskCount: 0, contributingRisks: [] });
      continue;
    }

    // Raw exposure: normalised sum of severity weights, saturating towards 1.
    const severitySum = contributing.reduce((s, r) => s + SEVERITY_WEIGHT[r.severity], 0);
    const rawExposure = 1 - Math.exp(-severitySum / 2); // saturating curve, 0..1

    // Residual: each risk's contribution is discounted by its mitigation confidence.
    const residualSum = contributing.reduce((s, r) => {
      const conf = computeConfidence(evidenceState[r.code]);
      return s + SEVERITY_WEIGHT[r.severity] * (1 - conf);
    }, 0);
    const residualExposure = 1 - Math.exp(-residualSum / 2);

    exposures.push({
      right,
      rawExposure: Math.round(rawExposure * 100) / 100,
      residualExposure: Math.round(residualExposure * 100) / 100,
      riskCount: contributing.length,
      contributingRisks: contributing.map((r) => ({
        code: r.code,
        label: r.label,
        severity: r.severity,
        phase: r.phase,
      })),
    });
  }

  // Highest residual exposure first.
  return exposures.sort((a, b) => b.residualExposure - a.residualExposure);
}

export function exposureBand(value: number): { label: string; color: string } {
  if (value >= 0.7) return { label: "Severe", color: "#ef4444" };
  if (value >= 0.45) return { label: "Elevated", color: "#e8b84b" };
  if (value >= 0.2) return { label: "Moderate", color: "#4f7cff" };
  if (value > 0) return { label: "Low", color: "#34d399" };
  return { label: "None", color: "rgba(255,255,255,0.2)" };
}

export function heatmapSummary(exposures: RightExposure[]): {
  rightsAtSevere: number;
  rightsMitigated: number;
  topRight: RightExposure | null;
  averageResidual: number;
} {
  const active = exposures.filter((e) => e.riskCount > 0);
  const severe = active.filter((e) => e.residualExposure >= 0.7).length;
  const mitigated = active.filter((e) => e.rawExposure >= 0.45 && e.residualExposure < 0.2).length;
  const avg = active.length > 0
    ? Math.round((active.reduce((s, e) => s + e.residualExposure, 0) / active.length) * 100) / 100
    : 0;
  return {
    rightsAtSevere: severe,
    rightsMitigated: mitigated,
    topRight: active.length > 0 ? active[0] : null,
    averageResidual: avg,
  };
}
