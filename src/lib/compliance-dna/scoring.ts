/**
 * Compliance DNA — scoring engine.
 *
 * Two outputs, both defensible:
 *  1. Compliance Genome: per-regime coverage, broken down by legal force
 *     (binding obligation vs voluntary standard) — never a single opaque score.
 *  2. Risk-to-Fine: a BOUNDED exposure range, computed only from the statutory
 *     ceilings of the applicable regime scaled by the unevidenced obligation
 *     share. It is an upper-bound exposure, explicitly labelled as such — not a
 *     prediction of an actual fine.
 */

import { COMPLIANCE_REGIMES, type ComplianceRegime, type PenaltyTier } from "./regimes";

export type ObligationForce = "obligation" | "harmonised_standard" | "best_practice";
export type ObligationStatus = "met" | "partial" | "unmet" | "not_applicable";

export interface ObligationAssessment {
  regimeCode: string;
  obligationId: string;
  label: string;
  force: ObligationForce;
  status: ObligationStatus;
  tierCode?: string; // which penalty tier this obligation maps to, if any
}

export interface RegimeScore {
  regime: ComplianceRegime;
  applicable: number;
  met: number;
  partial: number;
  unmet: number;
  coveragePct: number;        // weighted coverage 0..100
  byForce: {
    obligation: { total: number; met: number };
    harmonised_standard: { total: number; met: number };
    best_practice: { total: number; met: number };
  };
}

const STATUS_WEIGHT: Record<ObligationStatus, number> = {
  met: 1,
  partial: 0.5,
  unmet: 0,
  not_applicable: 0,
};

// Legal force weights: binding obligations dominate the score; best practice counts least.
const FORCE_WEIGHT: Record<ObligationForce, number> = {
  obligation: 1.0,
  harmonised_standard: 0.6,
  best_practice: 0.3,
};

export function scoreRegime(regimeCode: string, assessments: ObligationAssessment[]): RegimeScore | null {
  const regime = COMPLIANCE_REGIMES.find((r) => r.code === regimeCode);
  if (!regime) return null;

  const relevant = assessments.filter((a) => a.regimeCode === regimeCode && a.status !== "not_applicable");

  const byForce = {
    obligation: { total: 0, met: 0 },
    harmonised_standard: { total: 0, met: 0 },
    best_practice: { total: 0, met: 0 },
  };

  let weightedTotal = 0;
  let weightedMet = 0;

  for (const a of relevant) {
    const fw = FORCE_WEIGHT[a.force];
    weightedTotal += fw;
    weightedMet += fw * STATUS_WEIGHT[a.status];
    byForce[a.force].total += 1;
    if (a.status === "met") byForce[a.force].met += 1;
    else if (a.status === "partial") byForce[a.force].met += 0.5;
  }

  return {
    regime,
    applicable: relevant.length,
    met: relevant.filter((a) => a.status === "met").length,
    partial: relevant.filter((a) => a.status === "partial").length,
    unmet: relevant.filter((a) => a.status === "unmet").length,
    coveragePct: weightedTotal > 0 ? Math.round((weightedMet / weightedTotal) * 100) : 0,
    byForce,
  };
}

export interface FineExposureTier {
  tier: PenaltyTier;
  fixedCeilingEur: number | null;
  turnoverBasedEur: number | null;
  applicableCeilingEur: number | null; // the binding ceiling given the higher_of / lower_of rule
  unevidencedShare: number;            // 0..1 — share of this tier's obligations not met
  boundedExposureEur: number | null;   // applicableCeiling * unevidencedShare
}

export interface RegimeFineExposure {
  regimeCode: string;
  regimeName: string;
  hasFinancialPenalty: boolean;
  nationalDiscretionOnly: boolean;
  tiers: FineExposureTier[];
  maxBoundedExposureEur: number | null;
  note?: string;
}

/**
 * Computes a BOUNDED exposure per regime tier.
 * - If turnover provided, the binding ceiling follows the regime's rule
 *   (higher_of for most; lower_of for AI Act SMEs).
 * - boundedExposure = applicableCeiling × unevidencedShare for that tier.
 * This is an UPPER-BOUND, not a predicted fine. National discretion regimes
 * (DORA) and voluntary standards (ISO 42001) return null exposure by design.
 */
export function computeFineExposure(
  regimeCode: string,
  assessments: ObligationAssessment[],
  opts: { worldwideTurnoverEur?: number; isSme?: boolean } = {},
): RegimeFineExposure | null {
  const regime = COMPLIANCE_REGIMES.find((r) => r.code === regimeCode);
  if (!regime) return null;

  if (!regime.hasFinancialPenalty) {
    return {
      regimeCode, regimeName: regime.name, hasFinancialPenalty: false,
      nationalDiscretionOnly: false, tiers: [], maxBoundedExposureEur: null,
      note: regime.note,
    };
  }

  const tiers: FineExposureTier[] = regime.tiers.map((tier) => {
    const fixed = tier.fixedCeilingEur;
    const turnoverBased = (tier.turnoverPct !== null && opts.worldwideTurnoverEur)
      ? Math.round(opts.worldwideTurnoverEur * (tier.turnoverPct / 100))
      : null;

    let applicableCeiling: number | null = null;
    if (tier.rule === "national_discretion") {
      applicableCeiling = null;
    } else if (fixed !== null && turnoverBased !== null) {
      // AI Act SME special rule: lower of the two; otherwise higher of the two.
      const useLower = regime.code === "ai_act" && opts.isSme;
      applicableCeiling = useLower ? Math.min(fixed, turnoverBased) : Math.max(fixed, turnoverBased);
    } else if (fixed !== null) {
      applicableCeiling = fixed;
    } else {
      applicableCeiling = turnoverBased;
    }

    // Unevidenced share for obligations mapped to this tier
    const tierObligations = assessments.filter(
      (a) => a.regimeCode === regimeCode && a.tierCode === tier.code && a.status !== "not_applicable",
    );
    let unevidencedShare = 0;
    if (tierObligations.length > 0) {
      const unmetWeight = tierObligations.reduce((s, a) => s + (1 - STATUS_WEIGHT[a.status]), 0);
      unevidencedShare = Math.round((unmetWeight / tierObligations.length) * 100) / 100;
    }

    const boundedExposure = (applicableCeiling !== null && tierObligations.length > 0)
      ? Math.round(applicableCeiling * unevidencedShare)
      : null;

    return {
      tier,
      fixedCeilingEur: fixed,
      turnoverBasedEur: turnoverBased,
      applicableCeilingEur: applicableCeiling,
      unevidencedShare,
      boundedExposureEur: boundedExposure,
    };
  });

  const exposures = tiers.map((t) => t.boundedExposureEur).filter((v): v is number => v !== null);
  const maxBounded = exposures.length > 0 ? Math.max(...exposures) : null;
  const nationalOnly = regime.tiers.every((t) => t.rule === "national_discretion");

  return {
    regimeCode,
    regimeName: regime.name,
    hasFinancialPenalty: true,
    nationalDiscretionOnly: nationalOnly,
    tiers,
    maxBoundedExposureEur: maxBounded,
    note: regime.note,
  };
}

export function formatEur(value: number | null): string {
  if (value === null) return "—";
  if (value >= 1_000_000) return `€${(value / 1_000_000).toFixed(value >= 10_000_000 ? 0 : 1)}M`;
  if (value >= 1_000) return `€${Math.round(value / 1_000)}k`;
  return `€${value}`;
}

export interface BoardSummary {
  totalMaxExposureEur: number | null;
  regimesAtRisk: number;
  regimesAssessed: number;
  worstRegime: { code: string; name: string; exposureEur: number } | null;
  averageCoveragePct: number;
}

export function buildBoardSummary(
  assessments: ObligationAssessment[],
  opts: { worldwideTurnoverEur?: number; isSme?: boolean } = {},
): BoardSummary {
  const assessedRegimes = [...new Set(assessments.map((a) => a.regimeCode))];
  let totalMax = 0;
  let anyExposure = false;
  let worst: { code: string; name: string; exposureEur: number } | null = null;
  let coverageSum = 0;
  let coverageCount = 0;

  for (const code of assessedRegimes) {
    const score = scoreRegime(code, assessments);
    if (score) { coverageSum += score.coveragePct; coverageCount++; }

    const exposure = computeFineExposure(code, assessments, opts);
    if (exposure?.maxBoundedExposureEur != null) {
      anyExposure = true;
      totalMax += exposure.maxBoundedExposureEur;
      if (!worst || exposure.maxBoundedExposureEur > worst.exposureEur) {
        worst = { code, name: exposure.regimeName, exposureEur: exposure.maxBoundedExposureEur };
      }
    }
  }

  return {
    totalMaxExposureEur: anyExposure ? totalMax : null,
    regimesAtRisk: assessedRegimes.filter((c) => {
      const e = computeFineExposure(c, assessments, opts);
      return e?.maxBoundedExposureEur != null && e.maxBoundedExposureEur > 0;
    }).length,
    regimesAssessed: assessedRegimes.length,
    worstRegime: worst,
    averageCoveragePct: coverageCount > 0 ? Math.round(coverageSum / coverageCount) : 0,
  };
}
