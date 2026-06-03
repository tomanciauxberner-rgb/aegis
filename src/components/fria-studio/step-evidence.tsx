"use client";

import { useState } from "react";
import { Plus, Trash2, FileCheck, ShieldAlert, ChevronDown, ChevronRight } from "lucide-react";
import {
  EVIDENCE_TYPES,
  CONTROL_STATUS_CONFIG,
  computeConfidence,
  confidenceBand,
  evidenceCompleteness,
  type EvidenceState,
  type EvidenceType,
  type ControlStatus,
  type RiskControlRecord,
} from "@/lib/fria-studio/evidence-schema";
import { LIFECYCLE_PHASES, type LifecycleRisk } from "@/lib/fria-studio/lifecycle-risks";

interface LifecycleStatusState {
  [phase: string]: { [riskCode: string]: string };
}

interface StepEvidenceProps {
  lifecycleState: LifecycleStatusState;
  evidenceState: EvidenceState;
  onUpdate: (state: EvidenceState) => void;
}

const SEVERITY_COLORS = { critical: "#ef4444", high: "#e8b84b", medium: "#4f7cff", low: "#34d399" };

function genId(): string {
  return `ev_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function EvidenceRiskCard({ risk, phaseLabel, record, onChange }: {
  risk: LifecycleRisk;
  phaseLabel: string;
  record: RiskControlRecord | undefined;
  onChange: (rec: RiskControlRecord) => void;
}) {
  const [open, setOpen] = useState(false);

  const current: RiskControlRecord = record ?? {
    riskCode: risk.code,
    controlDescription: "",
    controlStatus: "none",
    evidence: [],
  };

  const confidence = computeConfidence(current);
  const band = confidenceBand(confidence);
  const severityColor = SEVERITY_COLORS[risk.severity];

  function update(patch: Partial<RiskControlRecord>) {
    onChange({ ...current, ...patch });
  }

  function addEvidence() {
    update({ evidence: [...current.evidence, { id: genId(), type: "policy", reference: "" }] });
  }

  function updateEvidence(id: string, patch: Partial<{ type: EvidenceType; reference: string; note: string }>) {
    update({ evidence: current.evidence.map((e) => (e.id === id ? { ...e, ...patch } : e)) });
  }

  function removeEvidence(id: string) {
    update({ evidence: current.evidence.filter((e) => e.id !== id) });
  }

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 8,
    }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 14px", cursor: "pointer", background: open ? "rgba(255,255,255,0.025)" : "transparent" }}
      >
        <span style={{
          fontSize: 8, fontFamily: "var(--font-mono), monospace", fontWeight: 700,
          letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 6px", borderRadius: 3,
          background: `${severityColor}18`, color: severityColor, flexShrink: 0,
        }}>
          {risk.severity}
        </span>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{risk.label}</span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: band.color, margin: 0 }}>
              {Math.round(confidence * 100)}%
            </p>
            <p style={{ fontSize: 9, color: band.color, margin: "1px 0 0", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {band.label}
            </p>
          </div>
          {open ? <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)" }} /> : <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.4)" }} />}
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 14px 16px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <div style={{
            padding: "10px 12px",
            background: "rgba(79,124,255,0.05)",
            border: "1px solid rgba(79,124,255,0.15)",
            borderRadius: 8,
            margin: "12px 0",
          }}>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>
              <span style={{ color: "#4f7cff", fontWeight: 600 }}>Evidence needed: </span>
              {risk.evidencePrompt}
            </p>
          </div>

          {/* Control description */}
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>
            Control in place
          </label>
          <textarea
            value={current.controlDescription}
            onChange={(e) => update({ controlDescription: e.target.value })}
            placeholder="Describe the control that addresses this risk…"
            rows={2}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e8eaf0",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
              marginBottom: 14,
            }}
          />

          {/* Control status */}
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", marginBottom: 6 }}>
            Control status
          </label>
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
            {(Object.keys(CONTROL_STATUS_CONFIG) as ControlStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => update({ controlStatus: s })}
                style={{
                  fontSize: 11, fontFamily: "var(--font-mono), monospace",
                  padding: "5px 10px", borderRadius: 6,
                  border: `1px solid ${current.controlStatus === s ? "#4f7cff" : "rgba(255,255,255,0.1)"}`,
                  background: current.controlStatus === s ? "rgba(79,124,255,0.12)" : "transparent",
                  color: current.controlStatus === s ? "#4f7cff" : "rgba(255,255,255,0.4)",
                  cursor: "pointer",
                }}
              >
                {CONTROL_STATUS_CONFIG[s].label}
              </button>
            ))}
          </div>

          {/* Evidence list */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <label style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)" }}>
              Supporting evidence
            </label>
            <button
              onClick={addEvidence}
              style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#4f7cff", background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono), monospace" }}
            >
              <Plus size={12} /> Add evidence
            </button>
          </div>

          {current.evidence.length === 0 ? (
            <div style={{
              padding: "12px",
              border: "1px dashed rgba(239,68,68,0.25)",
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              gap: 8,
              fontSize: 12,
              color: "rgba(239,68,68,0.7)",
              marginBottom: 8,
            }}>
              <ShieldAlert size={13} />
              No evidence recorded — confidence is capped until you attach a document, test or audit.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {current.evidence.map((ev) => (
                <div key={ev.id} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <select
                    value={ev.type}
                    onChange={(e) => updateEvidence(ev.id, { type: e.target.value as EvidenceType })}
                    style={{
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "8px 10px",
                      color: "#e8eaf0",
                      fontSize: 12,
                      width: 170,
                      flexShrink: 0,
                    }}
                  >
                    {EVIDENCE_TYPES.map((t) => (
                      <option key={t.code} value={t.code} style={{ background: "#0d1b35" }}>{t.label}</option>
                    ))}
                  </select>
                  <input
                    value={ev.reference}
                    onChange={(e) => updateEvidence(ev.id, { reference: e.target.value })}
                    placeholder="Document name, ID or URL"
                    style={{
                      flex: 1,
                      background: "rgba(255,255,255,0.04)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 6,
                      padding: "8px 10px",
                      color: "#e8eaf0",
                      fontSize: 12,
                    }}
                  />
                  <button
                    onClick={() => removeEvidence(ev.id)}
                    style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 8, flexShrink: 0 }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Residual note */}
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", display: "block", margin: "14px 0 6px" }}>
            Residual risk note
          </label>
          <textarea
            value={current.residualRiskNote ?? ""}
            onChange={(e) => update({ residualRiskNote: e.target.value })}
            placeholder="Any residual risk remaining after the control…"
            rows={2}
            style={{
              width: "100%",
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 8,
              padding: "10px 12px",
              color: "#e8eaf0",
              fontSize: 13,
              fontFamily: "inherit",
              resize: "vertical",
            }}
          />
        </div>
      )}
    </div>
  );
}

export function StepEvidence({ lifecycleState, evidenceState, onUpdate }: StepEvidenceProps) {
  // Only surface risks the user actually flagged in the lifecycle step
  // (status not "na" and present). If lifecycle empty, show all.
  const flaggedRiskCodes = new Set<string>();
  for (const phase of Object.keys(lifecycleState)) {
    for (const [code, status] of Object.entries(lifecycleState[phase] ?? {})) {
      if (status !== "na") flaggedRiskCodes.add(code);
    }
  }

  const phasesToShow = LIFECYCLE_PHASES.map((p) => ({
    ...p,
    risks: p.risks.filter((r) => flaggedRiskCodes.size === 0 || flaggedRiskCodes.has(r.code)),
  })).filter((p) => p.risks.length > 0);

  const allShownCodes = phasesToShow.flatMap((p) => p.risks.map((r) => r.code));
  const completeness = evidenceCompleteness(evidenceState, allShownCodes);

  function updateRecord(rec: RiskControlRecord) {
    onUpdate({ ...evidenceState, [rec.riskCode]: rec });
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Evidence engine
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          For each risk: what control addresses it, and what evidence proves the control works.
          Confidence is derived from the evidence you attach — a claim without a document, test or
          audit stays low by design. This is the chain that makes a FRIA defensible: risk → control → evidence → confidence.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Risks", value: `${completeness.withControl}/${completeness.total}`, sub: "with control", color: "#4f7cff" },
          { label: "Evidenced", value: `${completeness.withEvidence}/${completeness.total}`, sub: "with evidence", color: "#34d399" },
          { label: "Avg confidence", value: `${Math.round(completeness.averageConfidence * 100)}%`, sub: "evidence-derived", color: "#e8b84b" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "12px 18px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            flex: 1,
            minWidth: 130,
          }}>
            <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              {s.label} · {s.sub}
            </p>
          </div>
        ))}
      </div>

      {phasesToShow.map((phase) => (
        <div key={phase.phase} style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 16 }}>{phase.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.7)", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}>
              {phase.label}
            </span>
          </div>
          {phase.risks.map((risk) => (
            <EvidenceRiskCard
              key={risk.code}
              risk={risk}
              phaseLabel={phase.label}
              record={evidenceState[risk.code]}
              onChange={updateRecord}
            />
          ))}
        </div>
      ))}

      {completeness.withEvidence === completeness.total && completeness.total > 0 && (
        <div style={{
          padding: "14px 18px",
          background: "rgba(52,211,153,0.06)",
          border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          color: "#34d399",
        }}>
          <FileCheck size={16} />
          Every flagged risk has supporting evidence — this FRIA is defensible to a reviewer.
        </div>
      )}
    </div>
  );
}
