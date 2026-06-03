"use client";

import { useMemo, useState } from "react";
import { ChevronDown, ChevronRight, ShieldCheck, AlertTriangle } from "lucide-react";
import { buildRightsHeatmap, exposureBand, heatmapSummary, type RightExposure } from "@/lib/fria-studio/rights-heatmap";
import { getDomainRights } from "@/lib/fria-studio/annex3-taxonomy";
import type { EvidenceState } from "@/lib/fria-studio/evidence-schema";

interface StepRightsHeatmapProps {
  domainCode: string | null;
  evidenceState: EvidenceState;
}

const SEVERITY_COLORS = { critical: "#ef4444", high: "#e8b84b", medium: "#4f7cff", low: "#34d399" };

function ExposureBar({ exposure }: { exposure: RightExposure }) {
  const [open, setOpen] = useState(false);
  const rawBand = exposureBand(exposure.rawExposure);
  const residualBand = exposureBand(exposure.residualExposure);
  const mitigationDelta = exposure.rawExposure - exposure.residualExposure;

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.06)",
      borderRadius: 10,
      overflow: "hidden",
      marginBottom: 8,
    }}>
      <div
        onClick={() => exposure.riskCount > 0 && setOpen((v) => !v)}
        style={{
          padding: "14px 16px",
          cursor: exposure.riskCount > 0 ? "pointer" : "default",
          background: open ? "rgba(255,255,255,0.025)" : "transparent",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 10 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{exposure.right.label}</span>
            {exposure.right.charter && (
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.35)" }}>
                Charter {exposure.right.charter}
              </span>
            )}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {exposure.riskCount > 0 ? (
              <span style={{
                fontSize: 10,
                fontFamily: "var(--font-mono), monospace",
                fontWeight: 700,
                color: residualBand.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}>
                {residualBand.label}
              </span>
            ) : (
              <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.25)" }}>
                Not engaged
              </span>
            )}
            {exposure.riskCount > 0 && (open
              ? <ChevronDown size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
              : <ChevronRight size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
            )}
          </div>
        </div>

        {exposure.riskCount > 0 && (
          <div style={{ position: "relative" }}>
            {/* Raw exposure track (faded) */}
            <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden", position: "relative" }}>
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: `${exposure.rawExposure * 100}%`,
                background: `${rawBand.color}33`,
                borderRadius: 4,
              }} />
              {/* Residual exposure (solid, on top) */}
              <div style={{
                position: "absolute",
                left: 0, top: 0, bottom: 0,
                width: `${exposure.residualExposure * 100}%`,
                background: residualBand.color,
                borderRadius: 4,
                transition: "width 0.4s ease",
              }} />
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
              <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono), monospace" }}>
                {exposure.riskCount} risk{exposure.riskCount > 1 ? "s" : ""} touch this right
              </span>
              {mitigationDelta > 0.05 && (
                <span style={{ fontSize: 10, color: "#34d399", fontFamily: "var(--font-mono), monospace" }}>
                  −{Math.round(mitigationDelta * 100)}% mitigated
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {open && exposure.riskCount > 0 && (
        <div style={{ padding: "0 16px 14px", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, margin: "12px 0 10px" }}>
            {exposure.right.description}
          </p>
          <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 8 }}>
            Contributing risks
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {exposure.contributingRisks.map((r) => (
              <div key={r.code} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 12 }}>
                <span style={{
                  fontSize: 8,
                  fontFamily: "var(--font-mono), monospace",
                  fontWeight: 700,
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  padding: "2px 6px",
                  borderRadius: 3,
                  background: `${SEVERITY_COLORS[r.severity]}18`,
                  color: SEVERITY_COLORS[r.severity],
                  flexShrink: 0,
                }}>
                  {r.severity}
                </span>
                <span style={{ color: "rgba(255,255,255,0.6)", flex: 1 }}>{r.label}</span>
                <span style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", fontFamily: "var(--font-mono), monospace" }}>{r.phase}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function StepRightsHeatmap({ domainCode, evidenceState }: StepRightsHeatmapProps) {
  const exposures = useMemo(() => {
    if (!domainCode) return [];
    const rightCodes = getDomainRights(domainCode).map((r) => r.code);
    return buildRightsHeatmap(rightCodes, evidenceState);
  }, [domainCode, evidenceState]);

  const summary = useMemo(() => heatmapSummary(exposures), [exposures]);

  if (!domainCode) {
    return (
      <div style={{ padding: "40px 0", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13 }}>
        Select a domain and assess lifecycle risks first — the heatmap is built from that assessment.
      </div>
    );
  }

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Fundamental rights heatmap
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          Exposure per fundamental right, aggregated from your lifecycle risk assessment.
          The faded bar is raw exposure; the solid bar is residual exposure after the mitigation
          evidence you recorded. The more evidenced your controls, the more the solid bar shrinks.
        </p>
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Rights at severe", value: String(summary.rightsAtSevere), color: "#ef4444" },
          { label: "Rights mitigated", value: String(summary.rightsMitigated), color: "#34d399" },
          { label: "Avg residual", value: `${Math.round(summary.averageResidual * 100)}%`, color: "#4f7cff" },
        ].map((s) => (
          <div key={s.label} style={{
            padding: "12px 18px",
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10,
            background: "rgba(255,255,255,0.02)",
            flex: 1,
            minWidth: 120,
          }}>
            <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>
              {s.value}
            </p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              {s.label}
            </p>
          </div>
        ))}
      </div>

      {summary.topRight && summary.topRight.residualExposure >= 0.7 && (
        <div style={{
          marginBottom: 20,
          padding: "12px 16px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 10,
          display: "flex",
          alignItems: "center",
          gap: 10,
          fontSize: 13,
          color: "#ef4444",
        }}>
          <AlertTriangle size={15} />
          Highest residual exposure: <strong>{summary.topRight.right.label}</strong> — prioritise mitigation evidence here.
        </div>
      )}

      <div>
        {exposures.map((exp) => (
          <ExposureBar key={exp.right.code} exposure={exp} />
        ))}
      </div>

      {summary.rightsAtSevere === 0 && exposures.some((e) => e.riskCount > 0) && (
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
          No right sits at severe residual exposure — mitigation evidence is bringing exposure down.
        </div>
      )}
    </div>
  );
}
