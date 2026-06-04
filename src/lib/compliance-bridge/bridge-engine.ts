/**
 * Compliance Bridge — analysis engine.
 *
 * Smart Bridge: for any node, what maps to it and how strongly.
 * Reverse Compliance: "I hold framework X — what % of framework Y does that
 * cover, and what is missing?" Computed only from the source-verified mappings,
 * with gaps surfaced explicitly. Coverage is weighted by alignment strength.
 */

import { BRIDGE_MAPPINGS, type BridgeMapping, type Alignment } from "./mappings";

const ALIGNMENT_WEIGHT: Record<Alignment, number> = {
  high: 1.0,
  partial: 0.5,
  gap: 0.0,
};

export interface CoverageResult {
  fromFramework: string;
  toFramework: string;
  totalTargetObligations: number;
  covered: number;          // weighted coverage count
  coveragePct: number;      // 0..100
  highCount: number;
  partialCount: number;
  gapCount: number;
  highMappings: BridgeMapping[];
  partialMappings: BridgeMapping[];
  gaps: BridgeMapping[];
}

/**
 * Reverse compliance: holding ISO 42001, how much of the AI Act
 * (as represented in the mapping set) is covered?
 * Direction is fixed by the mapping data (ISO → AI Act).
 */
export function reverseCoverageIsoToAiAct(): CoverageResult {
  const mappings = BRIDGE_MAPPINGS;
  const total = mappings.length;

  const high = mappings.filter((m) => m.alignment === "high");
  const partial = mappings.filter((m) => m.alignment === "partial");
  const gaps = mappings.filter((m) => m.alignment === "gap");

  const weighted = mappings.reduce((s, m) => s + ALIGNMENT_WEIGHT[m.alignment], 0);
  const coveragePct = total > 0 ? Math.round((weighted / total) * 100) : 0;

  return {
    fromFramework: "ISO/IEC 42001",
    toFramework: "EU AI Act",
    totalTargetObligations: total,
    covered: Math.round(weighted * 10) / 10,
    coveragePct,
    highCount: high.length,
    partialCount: partial.length,
    gapCount: gaps.length,
    highMappings: high,
    partialMappings: partial,
    gaps,
  };
}

/** Smart Bridge: everything that maps to a given AI Act node code. */
export function bridgeForAiActNode(aiActCode: string): BridgeMapping[] {
  return BRIDGE_MAPPINGS.filter((m) => m.aiAct.code === aiActCode);
}

/** Smart Bridge: everything an ISO node maps onto. */
export function bridgeForIsoNode(isoCode: string): BridgeMapping[] {
  return BRIDGE_MAPPINGS.filter((m) => m.iso?.code === isoCode);
}

export interface AlignmentSummary {
  high: number;
  partial: number;
  gap: number;
  total: number;
  weightedCoveragePct: number;
}

export function alignmentSummary(): AlignmentSummary {
  const total = BRIDGE_MAPPINGS.length;
  const high = BRIDGE_MAPPINGS.filter((m) => m.alignment === "high").length;
  const partial = BRIDGE_MAPPINGS.filter((m) => m.alignment === "partial").length;
  const gap = BRIDGE_MAPPINGS.filter((m) => m.alignment === "gap").length;
  const weighted = BRIDGE_MAPPINGS.reduce((s, m) => s + ALIGNMENT_WEIGHT[m.alignment], 0);
  return {
    high, partial, gap, total,
    weightedCoveragePct: total > 0 ? Math.round((weighted / total) * 100) : 0,
  };
}
