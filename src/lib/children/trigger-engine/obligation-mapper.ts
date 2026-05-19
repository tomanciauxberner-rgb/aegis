import type { DetectedSignal, ResolvedJurisdiction, TriggerObligation } from "./types";
import type { ChildrenLegalBasis } from "@/types/children-v2";
import matrixData from "./obligations-matrix.json";

interface MatrixRule {
  id: string;
  signal_types: string[];
  jurisdictions: string[];
  legal_basis: string;
  title: string;
  description: string;
  action_required: string;
  timing: string;
  max_fine_eur: number | null;
  max_fine_pct_revenue: number | null;
  enforcing_authority: string[];
  source_url: string;
}

interface ObligationsMatrix {
  version: string;
  last_updated: string;
  rules: MatrixRule[];
}

const matrix = matrixData as ObligationsMatrix;

export function mapObligations(
  signals: DetectedSignal[],
  jurisdictions: ResolvedJurisdiction[],
): TriggerObligation[] {
  if (signals.length === 0) return [];

  const detectedTypes = new Set(signals.map((s) => s.type));
  const resolvedJurisdictions = new Set(jurisdictions.map((j) => j.jurisdiction));

  const obligations: TriggerObligation[] = [];
  const seenRuleIds = new Set<string>();

  for (const rule of matrix.rules) {
    if (seenRuleIds.has(rule.id)) continue;

    const signalMatch = rule.signal_types.some((st) => detectedTypes.has(st as never));
    if (!signalMatch) continue;

    const jurisdictionMatch = rule.jurisdictions.some(
      (rj) => rj === "all" || resolvedJurisdictions.has(rj),
    );
    if (!jurisdictionMatch) continue;

    const triggeredBy = rule.signal_types.filter((st) =>
      detectedTypes.has(st as never),
    );

    obligations.push({
      rule_id: rule.id,
      legal_basis: rule.legal_basis as ChildrenLegalBasis,
      title: rule.title,
      description: rule.description,
      action_required: rule.action_required,
      timing: rule.timing as TriggerObligation["timing"],
      max_fine_eur: rule.max_fine_eur,
      max_fine_pct_revenue: rule.max_fine_pct_revenue,
      enforcing_authority: rule.enforcing_authority,
      source_url: rule.source_url,
      triggered_by: triggeredBy as TriggerObligation["triggered_by"],
    });

    seenRuleIds.add(rule.id);
  }

  return obligations.sort(sortByUrgency);
}

function sortByUrgency(a: TriggerObligation, b: TriggerObligation): number {
  const order: Record<string, number> = {
    immediate: 0,
    within_72h: 1,
    pre_deployment: 2,
    within_30d: 3,
  };
  const timingDiff = (order[a.timing] ?? 99) - (order[b.timing] ?? 99);
  if (timingDiff !== 0) return timingDiff;
  const fineA = a.max_fine_eur ?? 0;
  const fineB = b.max_fine_eur ?? 0;
  return fineB - fineA;
}
