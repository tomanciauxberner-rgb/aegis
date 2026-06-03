"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldAlert, Info } from "lucide-react";
import { ANNEX3_DOMAINS, type Annex3Domain } from "@/lib/fria-studio/annex3-taxonomy";

interface StepDomainProps {
  selectedDomain: string | null;
  onSelect: (domain: Annex3Domain) => void;
}

const RISK_COLORS: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  unacceptable: { bg: "rgba(239,68,68,0.05)", border: "rgba(239,68,68,0.25)", text: "#ef4444", badge: "rgba(239,68,68,0.12)" },
  high:         { bg: "rgba(232,184,75,0.05)", border: "rgba(232,184,75,0.25)", text: "#e8b84b", badge: "rgba(232,184,75,0.12)" },
  limited:      { bg: "rgba(79,124,255,0.05)", border: "rgba(79,124,255,0.2)",  text: "#4f7cff", badge: "rgba(79,124,255,0.12)" },
  minimal:      { bg: "rgba(52,211,153,0.05)", border: "rgba(52,211,153,0.2)",  text: "#34d399", badge: "rgba(34,211,153,0.12)" },
};

const RISK_LABELS: Record<string, string> = {
  unacceptable: "Unacceptable risk",
  high: "High risk — Annex III",
  limited: "Limited risk",
  minimal: "Minimal risk",
};

export function StepDomain({ selectedDomain, onSelect }: StepDomainProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", marginBottom: 8 }}>
          Select your AI system domain
        </h2>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", lineHeight: 1.6 }}>
          All nine domains listed in Annex III of the EU AI Act. Selecting a domain loads the applicable
          fundamental rights, legal obligations and prohibited-use triggers for this assessment.
          Every reference is sourced to the primary instrument.
        </p>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
        gap: 12,
      }}>
        {ANNEX3_DOMAINS.map((domain) => {
          const isSelected = selectedDomain === domain.code;
          const isExpanded = expanded === domain.code;
          const colors = RISK_COLORS[domain.defaultRiskLevel] ?? RISK_COLORS.high;
          const prohibited = domain.prohibitedTriggers.length > 0;

          return (
            <div
              key={domain.code}
              style={{
                border: `1px solid ${isSelected ? colors.text : "rgba(255,255,255,0.08)"}`,
                borderRadius: 12,
                background: isSelected ? colors.bg : "rgba(255,255,255,0.02)",
                overflow: "hidden",
                transition: "border-color 0.2s, background 0.2s",
                cursor: "pointer",
              }}
            >
              <div
                onClick={() => onSelect(domain)}
                style={{ padding: "16px 18px" }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 8 }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 10, flex: 1 }}>
                    {isSelected
                      ? <CheckCircle2 size={16} style={{ color: colors.text, flexShrink: 0, marginTop: 2 }} />
                      : <div style={{ width: 16, height: 16, borderRadius: "50%", border: "1px solid rgba(255,255,255,0.2)", flexShrink: 0, marginTop: 2 }} />
                    }
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{
                          fontSize: 9,
                          fontFamily: "var(--font-mono), monospace",
                          fontWeight: 700,
                          letterSpacing: "0.15em",
                          textTransform: "uppercase",
                          padding: "2px 7px",
                          borderRadius: 4,
                          background: colors.badge,
                          color: colors.text,
                          border: `1px solid ${colors.border}`,
                        }}>
                          {domain.annexRef}
                        </span>
                        {prohibited && (
                          <span style={{
                            fontSize: 9,
                            fontFamily: "var(--font-mono), monospace",
                            fontWeight: 700,
                            letterSpacing: "0.12em",
                            textTransform: "uppercase",
                            padding: "2px 7px",
                            borderRadius: 4,
                            background: "rgba(239,68,68,0.1)",
                            color: "#ef4444",
                            border: "1px solid rgba(239,68,68,0.2)",
                            display: "flex",
                            alignItems: "center",
                            gap: 4,
                          }}>
                            <ShieldAlert size={9} /> Prohibited triggers
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", margin: 0, lineHeight: 1.3 }}>
                        {domain.label}
                      </p>
                    </div>
                  </div>
                </div>

                <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, marginLeft: 26, marginBottom: 0 }}>
                  {domain.description}
                </p>
              </div>

              <div style={{ padding: "0 18px 14px", marginLeft: 26 }}>
                <button
                  onClick={(e) => { e.stopPropagation(); setExpanded(isExpanded ? null : domain.code); }}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 11,
                    color: "rgba(255,255,255,0.4)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: 0,
                    fontFamily: "var(--font-mono), monospace",
                    letterSpacing: "0.05em",
                  }}
                >
                  <Info size={11} />
                  {isExpanded ? "Hide details" : `${domain.fundamentalRights.length} rights · ${domain.legalRefs.length} refs · ${domain.exampleSystems.length} examples`}
                </button>

                {isExpanded && (
                  <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 14 }}>
                    <div>
                      <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                        Fundamental rights
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {domain.fundamentalRights.map((r) => (
                          <span key={r.code} style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.04)",
                            border: "1px solid rgba(255,255,255,0.08)",
                            color: "rgba(255,255,255,0.6)",
                          }}>
                            {r.charter && <span style={{ color: colors.text, marginRight: 4 }}>{r.charter}</span>}
                            {r.label}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                        Binding obligations
                      </p>
                      <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                        {domain.legalRefs.filter((r) => r.force === "binding").slice(0, 4).map((ref) => (
                          <div key={ref.article} style={{ display: "flex", alignItems: "flex-start", gap: 8, fontSize: 11, color: "rgba(255,255,255,0.5)" }}>
                            <span style={{ color: colors.text, fontFamily: "var(--font-mono), monospace", fontWeight: 600, flexShrink: 0 }}>
                              {ref.instrument} {ref.article}
                            </span>
                            <span>{ref.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {prohibited && (
                      <div style={{
                        padding: "10px 12px",
                        background: "rgba(239,68,68,0.06)",
                        border: "1px solid rgba(239,68,68,0.2)",
                        borderRadius: 8,
                      }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                          <AlertTriangle size={12} style={{ color: "#ef4444" }} />
                          <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#ef4444" }}>
                            Prohibited use triggers
                          </span>
                        </div>
                        {domain.prohibitedTriggers.map((t) => (
                          <div key={t.code} style={{ fontSize: 11, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, marginBottom: 4 }}>
                            <span style={{ color: "#ef4444", fontFamily: "var(--font-mono), monospace", marginRight: 6 }}>{t.article}</span>
                            {t.label}
                          </div>
                        ))}
                      </div>
                    )}

                    <div>
                      <p style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 6 }}>
                        Example systems
                      </p>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {domain.exampleSystems.map((s) => (
                          <span key={s} style={{
                            fontSize: 11,
                            padding: "3px 8px",
                            borderRadius: 4,
                            background: "rgba(255,255,255,0.03)",
                            border: "1px solid rgba(255,255,255,0.07)",
                            color: "rgba(255,255,255,0.45)",
                          }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {selectedDomain && (
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
          <CheckCircle2 size={15} />
          Domain selected — the applicable rights, obligations and risk taxonomy are now loaded for this assessment.
        </div>
      )}
    </div>
  );
}
