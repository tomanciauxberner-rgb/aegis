"use client";

import { useState } from "react";
import { AlertTriangle, ChevronDown, ChevronRight, ShieldCheck, FileText } from "lucide-react";
import {
  LIFECYCLE_PHASES,
  type LifecyclePhase,
  type LifecycleRisk,
  type LifecyclePhaseDefinition,
} from "@/lib/fria-studio/lifecycle-risks";

interface PhaseRiskState {
  [riskCode: string]: "unaddressed" | "mitigated" | "accepted" | "na";
}

interface LifecycleState {
  [phase: string]: PhaseRiskState;
}

interface StepLifecycleProps {
  domainCode: string | null;
  lifecycleState: LifecycleState;
  onUpdate: (state: LifecycleState) => void;
}

const STATUS_CONFIG = {
  unaddressed: { label: "Not assessed", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.04)", border: "rgba(255,255,255,0.1)" },
  mitigated:   { label: "Mitigated",    color: "#34d399",              bg: "rgba(52,211,153,0.08)",   border: "rgba(52,211,153,0.25)" },
  accepted:    { label: "Accepted",     color: "#e8b84b",              bg: "rgba(232,184,75,0.08)",   border: "rgba(232,184,75,0.25)" },
  na:          { label: "Not applicable", color: "rgba(255,255,255,0.3)", bg: "rgba(255,255,255,0.02)", border: "rgba(255,255,255,0.07)" },
};

const SEVERITY_COLORS = {
  critical: "#ef4444",
  high:     "#e8b84b",
  medium:   "#4f7cff",
  low:      "#34d399",
};

function riskStatusForPhase(state: LifecycleState, phase: string): "complete" | "partial" | "empty" {
  const phaseState = state[phase] ?? {};
  const total = LIFECYCLE_PHASES.find((p) => p.phase === phase)?.risks.length ?? 0;
  if (total === 0) return "complete";
  const addressed = Object.values(phaseState).filter((v) => v !== "unaddressed").length;
  if (addressed === 0) return "empty";
  if (addressed >= total) return "complete";
  return "partial";
}

function PhaseRiskRow({ risk, status, onStatusChange }: {
  risk: LifecycleRisk;
  status: PhaseRiskState[string];
  onStatusChange: (code: string, status: PhaseRiskState[string]) => void;
}) {
  const [open, setOpen] = useState(false);
  const current = status ?? "unaddressed";
  const config = STATUS_CONFIG[current];
  const severityColor = SEVERITY_COLORS[risk.severity];

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 8,
    }}>
      <div
        onClick={() => setOpen((v) => !v)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 14px",
          cursor: "pointer",
          background: open ? "rgba(255,255,255,0.025)" : "transparent",
          transition: "background 0.15s",
        }}
      >
        <span style={{
          fontSize: 9,
          fontFamily: "var(--font-mono), monospace",
          fontWeight: 700,
          letterSpacing: "0.1em",
          textTransform: "uppercase",
          padding: "2px 7px",
          borderRadius: 4,
          background: `${severityColor}18`,
          color: severityColor,
          border: `1px solid ${severityColor}33`,
          flexShrink: 0,
        }}>
          {risk.severity}
        </span>

        <span style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>
          {risk.label}
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          {(["unaddressed", "mitigated", "accepted", "na"] as const).map((s) => (
            <button
              key={s}
              onClick={(e) => { e.stopPropagation(); onStatusChange(risk.code, s); }}
              style={{
                fontSize: 10,
                fontFamily: "var(--font-mono), monospace",
                padding: "3px 8px",
                borderRadius: 5,
                border: `1px solid ${current === s ? STATUS_CONFIG[s].border : "rgba(255,255,255,0.07)"}`,
                background: current === s ? STATUS_CONFIG[s].bg : "transparent",
                color: current === s ? STATUS_CONFIG[s].color : "rgba(255,255,255,0.3)",
                cursor: "pointer",
                transition: "all 0.15s",
                whiteSpace: "nowrap",
              }}
            >
              {STATUS_CONFIG[s].label}
            </button>
          ))}
          {open ? <ChevronDown size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} /> : <ChevronRight size={14} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />}
        </div>
      </div>

      {open && (
        <div style={{ padding: "0 14px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, marginTop: 12, marginBottom: 14 }}>
            {risk.description}
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14 }}>
            <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 2 }}>
              Applicable obligations
            </p>
            {risk.obligations.map((ob) => (
              <div key={ob.article} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 12, lineHeight: 1.5 }}>
                <span style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#4f7cff", flexShrink: 0 }}>
                  {ob.instrument} {ob.article}
                </span>
                <span style={{ color: "rgba(255,255,255,0.6)" }}>{ob.label} — {ob.text}</span>
              </div>
            ))}
          </div>

          <div style={{
            padding: "10px 12px",
            background: "rgba(79,124,255,0.06)",
            border: "1px solid rgba(79,124,255,0.18)",
            borderRadius: 8,
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
          }}>
            <FileText size={13} style={{ color: "#4f7cff", flexShrink: 0, marginTop: 1 }} />
            <div>
              <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4f7cff", marginBottom: 4 }}>
                Evidence required
              </p>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.55, margin: 0 }}>
                {risk.evidencePrompt}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function PhaseBlock({ phase, state, onUpdate, isActive, onActivate }: {
  phase: LifecyclePhaseDefinition;
  state: LifecycleState;
  onUpdate: (state: LifecycleState) => void;
  isActive: boolean;
  onActivate: () => void;
}) {
  const phaseStatus = riskStatusForPhase(state, phase.phase);
  const phaseState = state[phase.phase] ?? {};

  const totalRisks = phase.risks.length;
  const criticalRisks = phase.risks.filter((r) => r.severity === "critical").length;
  const addressed = Object.values(phaseState).filter((v) => v !== "unaddressed").length;

  const statusColor = phaseStatus === "complete" ? "#34d399" : phaseStatus === "partial" ? "#e8b84b" : "rgba(255,255,255,0.3)";

  function updateRiskStatus(riskCode: string, status: PhaseRiskState[string]) {
    onUpdate({
      ...state,
      [phase.phase]: { ...phaseState, [riskCode]: status },
    });
  }

  return (
    <div style={{
      border: `1px solid ${isActive ? "rgba(79,124,255,0.4)" : "rgba(255,255,255,0.07)"}`,
      borderRadius: 14,
      overflow: "hidden",
      background: isActive ? "rgba(79,124,255,0.04)" : "rgba(255,255,255,0.01)",
      transition: "border-color 0.2s",
    }}>
      <div
        onClick={onActivate}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 14,
          padding: "16px 18px",
          cursor: "pointer",
        }}
      >
        <span style={{ fontSize: 20, flexShrink: 0 }}>{phase.icon}</span>

        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{phase.label}</span>
            {criticalRisks > 0 && (
              <span style={{
                display: "flex", alignItems: "center", gap: 4,
                fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700,
                letterSpacing: "0.1em", textTransform: "uppercase",
                padding: "2px 7px", borderRadius: 4,
                background: "rgba(239,68,68,0.1)", color: "#ef4444", border: "1px solid rgba(239,68,68,0.2)",
              }}>
                <AlertTriangle size={9} /> {criticalRisks} critical
              </span>
            )}
          </div>
          <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", margin: 0 }}>{phase.description}</p>
        </div>

        <div style={{ textAlign: "right", flexShrink: 0 }}>
          <p style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: statusColor, fontWeight: 700, margin: 0 }}>
            {addressed}/{totalRisks}
          </p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", margin: "2px 0 0" }}>risks assessed</p>
        </div>

        {isActive
          ? <ChevronDown size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
          : <ChevronRight size={16} style={{ color: "rgba(255,255,255,0.4)", flexShrink: 0 }} />
        }
      </div>

      {isActive && (
        <div style={{ padding: "0 18px 18px", borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          <div style={{ padding: "12px 0 16px" }}>
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
              Key questions for this phase
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
              {phase.keyQuestions.map((q, i) => (
                <div key={i} style={{ display: "flex", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>
                  <span style={{ color: "#4f7cff", fontFamily: "var(--font-mono), monospace", flexShrink: 0 }}>{i + 1}.</span>
                  <span>{q}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {phase.risks.map((risk) => (
              <PhaseRiskRow
                key={risk.code}
                risk={risk}
                status={phaseState[risk.code] ?? "unaddressed"}
                onStatusChange={updateRiskStatus}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StepLifecycle({ domainCode, lifecycleState, onUpdate }: StepLifecycleProps) {
  const [activePhase, setActivePhase] = useState<LifecyclePhase | null>("design");

  const totalRisks = LIFECYCLE_PHASES.reduce((sum, p) => sum + p.risks.length, 0);
  const totalCritical = LIFECYCLE_PHASES.reduce((sum, p) => sum + p.risks.filter((r) => r.severity === "critical").length, 0);
  const totalAddressed = LIFECYCLE_PHASES.reduce((sum, p) => {
    const ps = lifecycleState[p.phase] ?? {};
    return sum + Object.values(ps).filter((v) => v !== "unaddressed").length;
  }, 0);

  const completedPhases = LIFECYCLE_PHASES.filter((p) => riskStatusForPhase(lifecycleState, p.phase) === "complete").length;

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Lifecycle risk assessment
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          Fundamental-rights risks mapped to each phase of your AI system&apos;s lifecycle —
          from design through monitoring. Each risk lists the applicable legal obligations
          and the evidence needed to demonstrate it is addressed.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Phases", value: `${completedPhases}/${LIFECYCLE_PHASES.length}`, color: "#4f7cff" },
          { label: "Risks assessed", value: `${totalAddressed}/${totalRisks}`, color: "#34d399" },
          { label: "Critical risks", value: String(totalCritical), color: "#ef4444" },
        ].map((stat) => (
          <div key={stat.label} style={{
            padding: "12px 18px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            flex: 1,
            minWidth: 120,
          }}>
            <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: stat.color, margin: 0, lineHeight: 1 }}>
              {stat.value}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              {stat.label}
            </p>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {LIFECYCLE_PHASES.map((phase, idx) => (
          <div key={phase.phase} style={{ position: "relative" }}>
            {idx < LIFECYCLE_PHASES.length - 1 && (
              <div style={{
                position: "absolute",
                left: 28,
                bottom: -10,
                width: 1,
                height: 10,
                background: "rgba(79,124,255,0.2)",
                zIndex: 1,
              }} />
            )}
            <PhaseBlock
              phase={phase}
              state={lifecycleState}
              onUpdate={onUpdate}
              isActive={activePhase === phase.phase}
              onActivate={() => setActivePhase(activePhase === phase.phase ? null : phase.phase)}
            />
          </div>
        ))}
      </div>

      {totalAddressed === totalRisks && (
        <div style={{
          marginTop: 20,
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
          <ShieldCheck size={16} />
          All lifecycle risks assessed — proceed to the rights heatmap.
        </div>
      )}
    </div>
  );
}
