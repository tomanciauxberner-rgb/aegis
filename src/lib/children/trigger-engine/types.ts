import type { ChildrenLegalBasis } from "@/types/children-v2";

export type SignalType =
  | "explicit_age_minor"
  | "explicit_age_minor_under13"
  | "implicit_age_minor"
  | "parental_role"
  | "educational_context"
  | "edtech_context"
  | "advertising_context"
  | "profiling_context"
  | "automated_decision"
  | "large_scale_processing"
  | "high_risk_ai"
  | "account_creation";

export type Jurisdiction = string;
export const KNOWN_JURISDICTIONS = ["eu", "us", "gb", "ca", "br", "au", "in", "sg", "kr", "all"] as const;

export type ObligationTiming =
  | "immediate"
  | "pre_deployment"
  | "within_72h"
  | "within_30d";

export interface DetectedSignal {
  type: SignalType;
  match: string;
  position: number;
  confidence: number;
}

export interface ResolvedJurisdiction {
  jurisdiction: Jurisdiction;
  confidence: number;
  reason: string;
}

export interface TriggerObligation {
  rule_id: string;
  legal_basis: ChildrenLegalBasis;
  title: string;
  description: string;
  action_required: string;
  timing: ObligationTiming;
  max_fine_eur: number | null;
  max_fine_pct_revenue: number | null;
  enforcing_authority: string[];
  source_url: string;
  triggered_by: SignalType[];
}

export interface TriggerScanResult {
  input_hash: string;
  signals: DetectedSignal[];
  jurisdictions: ResolvedJurisdiction[];
  obligations: TriggerObligation[];
  scanned_at: string;
  signal_count: number;
  obligation_count: number;
}
