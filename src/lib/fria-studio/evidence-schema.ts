/**
 * FRIA Studio — Evidence schema.
 * Turns declarative risk answers into an evidence chain:
 *   Risk → Control → Evidence → Confidence.
 * The assurance level is derived only from the evidence actually provided —
 * never asserted. No evidence means no confidence, by design.
 */

export type EvidenceType =
  | "policy"
  | "procedure"
  | "technical_doc"
  | "test_report"
  | "audit"
  | "contract"
  | "dpia"
  | "training_record"
  | "monitoring_data"
  | "other";

export type ControlStatus = "none" | "planned" | "partial" | "implemented" | "verified";

export interface EvidenceTypeDefinition {
  code: EvidenceType;
  label: string;
  description: string;
  assuranceWeight: number; // 0..1 — how much this evidence type supports a claim
}

export const EVIDENCE_TYPES: EvidenceTypeDefinition[] = [
  { code: "audit",            label: "Independent audit", description: "Third-party or internal-audit report assessing the control.", assuranceWeight: 1.0 },
  { code: "test_report",      label: "Test report",       description: "Bias, robustness, accuracy or penetration test results.", assuranceWeight: 0.9 },
  { code: "monitoring_data",  label: "Monitoring data",   description: "Live performance or fairness metrics from operation.", assuranceWeight: 0.9 },
  { code: "dpia",             label: "DPIA / FRIA record", description: "Completed impact assessment referencing this risk.", assuranceWeight: 0.8 },
  { code: "technical_doc",    label: "Technical documentation", description: "Architecture, data governance or model card evidencing the control.", assuranceWeight: 0.7 },
  { code: "procedure",        label: "Documented procedure", description: "Written operational procedure that is demonstrably followed.", assuranceWeight: 0.6 },
  { code: "training_record",  label: "Training record",   description: "Evidence that responsible staff are trained on the control.", assuranceWeight: 0.5 },
  { code: "contract",         label: "Contractual clause", description: "Binding clause with a provider or processor implementing the control.", assuranceWeight: 0.5 },
  { code: "policy",           label: "Policy",            description: "Organisational policy stating the commitment.", assuranceWeight: 0.4 },
  { code: "other",            label: "Other evidence",    description: "Any other supporting artefact.", assuranceWeight: 0.3 },
];

export const CONTROL_STATUS_CONFIG: Record<ControlStatus, { label: string; baseConfidence: number }> = {
  none:        { label: "No control",   baseConfidence: 0 },
  planned:     { label: "Planned",      baseConfidence: 0.1 },
  partial:     { label: "Partial",      baseConfidence: 0.4 },
  implemented: { label: "Implemented",  baseConfidence: 0.7 },
  verified:    { label: "Verified",     baseConfidence: 0.9 },
};

export interface EvidenceItem {
  id: string;
  type: EvidenceType;
  reference: string;       // document name, URL, or identifier
  note?: string;
}

export interface RiskControlRecord {
  riskCode: string;
  controlDescription: string;
  controlStatus: ControlStatus;
  evidence: EvidenceItem[];
  residualRiskNote?: string;
}

export interface EvidenceState {
  [riskCode: string]: RiskControlRecord;
}

/**
 * Confidence is the combination of:
 *  - the control status base confidence, and
 *  - the strongest evidence backing it (assurance weight).
 * A claim with status "verified" but no evidence is capped low,
 * because confidence must be evidenced, not asserted.
 */
export function computeConfidence(record: RiskControlRecord | undefined): number {
  if (!record) return 0;
  const base = CONTROL_STATUS_CONFIG[record.controlStatus].baseConfidence;
  if (record.evidence.length === 0) {
    // No evidence: cap at "planned"-level confidence regardless of asserted status.
    return Math.min(base, 0.2);
  }
  const strongest = Math.max(
    ...record.evidence.map((e) => EVIDENCE_TYPES.find((t) => t.code === e.type)?.assuranceWeight ?? 0.3)
  );
  // Confidence is the geometric blend of asserted status and evidence strength,
  // so both must be high for a high score.
  return Math.round(Math.sqrt(base * strongest) * 100) / 100;
}

export function confidenceBand(value: number): { label: string; color: string } {
  if (value >= 0.75) return { label: "High assurance", color: "#34d399" };
  if (value >= 0.45) return { label: "Moderate", color: "#4f7cff" };
  if (value >= 0.2)  return { label: "Low", color: "#e8b84b" };
  return { label: "Unevidenced", color: "#ef4444" };
}

export function evidenceCompleteness(state: EvidenceState, riskCodes: string[]): {
  total: number;
  withControl: number;
  withEvidence: number;
  averageConfidence: number;
} {
  const total = riskCodes.length;
  let withControl = 0;
  let withEvidence = 0;
  let confidenceSum = 0;

  for (const code of riskCodes) {
    const rec = state[code];
    if (rec && rec.controlStatus !== "none") withControl++;
    if (rec && rec.evidence.length > 0) withEvidence++;
    confidenceSum += computeConfidence(rec);
  }

  return {
    total,
    withControl,
    withEvidence,
    averageConfidence: total > 0 ? Math.round((confidenceSum / total) * 100) / 100 : 0,
  };
}
