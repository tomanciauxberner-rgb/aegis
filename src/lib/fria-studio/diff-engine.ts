/**
 * FRIA Studio — Diff engine.
 * Compares two FRIA Studio snapshots and produces a structured changelog:
 * which risks changed status, which controls gained/lost evidence,
 * and how residual rights exposure moved between versions.
 * Drives the "FRIA Diff" view so a reviewer sees what changed and why.
 */

import { computeConfidence, type EvidenceState } from "./evidence-schema";
import { buildRightsHeatmap } from "./rights-heatmap";
import { getDomainRights } from "./annex3-taxonomy";

export interface FriaStudioSnapshot {
  domainCode: string | null;
  lifecycleState: Record<string, Record<string, string>>;
  evidenceState: EvidenceState;
  capturedAt: string; // ISO date
  label?: string;
}

export type ChangeDirection = "improved" | "regressed" | "unchanged";

export interface RiskChange {
  riskCode: string;
  field: "controlStatus" | "evidence" | "confidence";
  before: string | number;
  after: string | number;
  direction: ChangeDirection;
}

export interface RightExposureChange {
  rightCode: string;
  rightLabel: string;
  beforeResidual: number;
  afterResidual: number;
  delta: number;
  direction: ChangeDirection;
}

export interface FriaDiff {
  fromLabel: string;
  toLabel: string;
  fromDate: string;
  toDate: string;
  riskChanges: RiskChange[];
  exposureChanges: RightExposureChange[];
  summary: {
    risksImproved: number;
    risksRegressed: number;
    evidenceAdded: number;
    evidenceRemoved: number;
    netExposureDelta: number; // negative = overall improvement
  };
}

function statusRank(status: string): number {
  const order = ["none", "planned", "partial", "implemented", "verified"];
  const idx = order.indexOf(status);
  return idx === -1 ? 0 : idx;
}

export function diffFriaSnapshots(from: FriaStudioSnapshot, to: FriaStudioSnapshot): FriaDiff {
  const riskChanges: RiskChange[] = [];
  let evidenceAdded = 0;
  let evidenceRemoved = 0;

  const allRiskCodes = new Set<string>([
    ...Object.keys(from.evidenceState),
    ...Object.keys(to.evidenceState),
  ]);

  for (const code of allRiskCodes) {
    const recBefore = from.evidenceState[code];
    const recAfter = to.evidenceState[code];

    const statusBefore = recBefore?.controlStatus ?? "none";
    const statusAfter = recAfter?.controlStatus ?? "none";
    if (statusBefore !== statusAfter) {
      const rankDelta = statusRank(statusAfter) - statusRank(statusBefore);
      riskChanges.push({
        riskCode: code,
        field: "controlStatus",
        before: statusBefore,
        after: statusAfter,
        direction: rankDelta > 0 ? "improved" : rankDelta < 0 ? "regressed" : "unchanged",
      });
    }

    const evBefore = recBefore?.evidence.length ?? 0;
    const evAfter = recAfter?.evidence.length ?? 0;
    if (evAfter > evBefore) evidenceAdded += evAfter - evBefore;
    if (evAfter < evBefore) evidenceRemoved += evBefore - evAfter;
    if (evBefore !== evAfter) {
      riskChanges.push({
        riskCode: code,
        field: "evidence",
        before: evBefore,
        after: evAfter,
        direction: evAfter > evBefore ? "improved" : "regressed",
      });
    }

    const confBefore = computeConfidence(recBefore);
    const confAfter = computeConfidence(recAfter);
    if (Math.abs(confAfter - confBefore) >= 0.01) {
      riskChanges.push({
        riskCode: code,
        field: "confidence",
        before: Math.round(confBefore * 100),
        after: Math.round(confAfter * 100),
        direction: confAfter > confBefore ? "improved" : "regressed",
      });
    }
  }

  // Exposure deltas per right (only meaningful if same domain)
  const exposureChanges: RightExposureChange[] = [];
  let netExposureDelta = 0;

  if (to.domainCode && from.domainCode === to.domainCode) {
    const rightCodes = getDomainRights(to.domainCode).map((r) => r.code);
    const heatBefore = buildRightsHeatmap(rightCodes, from.evidenceState);
    const heatAfter = buildRightsHeatmap(rightCodes, to.evidenceState);

    const beforeMap = new Map(heatBefore.map((e) => [e.right.code, e]));
    for (const after of heatAfter) {
      const before = beforeMap.get(after.right.code);
      if (!before || after.riskCount === 0) continue;
      const delta = Math.round((after.residualExposure - before.residualExposure) * 100) / 100;
      if (Math.abs(delta) >= 0.01) {
        netExposureDelta += delta;
        exposureChanges.push({
          rightCode: after.right.code,
          rightLabel: after.right.label,
          beforeResidual: before.residualExposure,
          afterResidual: after.residualExposure,
          delta,
          direction: delta < 0 ? "improved" : delta > 0 ? "regressed" : "unchanged",
        });
      }
    }
    exposureChanges.sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta));
  }

  return {
    fromLabel: from.label ?? "Previous version",
    toLabel: to.label ?? "Current version",
    fromDate: from.capturedAt,
    toDate: to.capturedAt,
    riskChanges,
    exposureChanges,
    summary: {
      risksImproved: riskChanges.filter((c) => c.field === "controlStatus" && c.direction === "improved").length,
      risksRegressed: riskChanges.filter((c) => c.field === "controlStatus" && c.direction === "regressed").length,
      evidenceAdded,
      evidenceRemoved,
      netExposureDelta: Math.round(netExposureDelta * 100) / 100,
    },
  };
}
