"use client";

import { Info, AlertTriangle } from "lucide-react";
import { type RegimeFineExposure, formatEur } from "@/lib/compliance-dna/scoring";

export function RiskToFine({ exposures }: { exposures: RegimeFineExposure[] }) {
  const withPenalty = exposures.filter((e) => e.hasFinancialPenalty);

  return (
    <div>
      {/* Methodology banner — defensibility front and centre */}
      <div style={{
        padding: "12px 16px",
        background: "rgba(79,124,255,0.05)",
        border: "1px solid rgba(79,124,255,0.18)",
        borderRadius: 10,
        display: "flex",
        gap: 10,
        marginBottom: 20,
      }}>
        <Info size={15} style={{ color: "#4f7cff", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: "#e8eaf0" }}>Upper-bound exposure, not a predicted fine.</strong> Each figure is the
          statutory ceiling of the applicable regime, scaled by the share of obligations left unevidenced.
          It is bounded by the real Article-level caps — never an invented number. Actual fines depend on
          authority discretion, mitigation and intent.
        </p>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {withPenalty.map((exp) => (
          <div key={exp.regimeCode} style={{
            border: "1px solid rgba(255,255,255,0.07)",
            borderRadius: 12,
            padding: "18px 20px",
            background: "rgba(255,255,255,0.02)",
          }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{exp.regimeName}</span>
              {exp.nationalDiscretionOnly ? (
                <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)" }}>
                  National discretion
                </span>
              ) : exp.maxBoundedExposureEur !== null ? (
                <div style={{ textAlign: "right" }}>
                  <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: exp.maxBoundedExposureEur > 0 ? "#e8b84b" : "#34d399", margin: 0, lineHeight: 1 }}>
                    {formatEur(exp.maxBoundedExposureEur)}
                  </p>
                  <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}>
                    bounded exposure
                  </p>
                </div>
              ) : (
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>Not yet assessed</span>
              )}
            </div>

            {exp.nationalDiscretionOnly ? (
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", lineHeight: 1.55, margin: 0 }}>
                {exp.note}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {exp.tiers.map((t) => (
                  <div key={t.tier.code} style={{
                    display: "flex", alignItems: "center", gap: 12,
                    padding: "10px 12px", borderRadius: 8,
                    background: "rgba(255,255,255,0.015)", border: "1px solid rgba(255,255,255,0.05)",
                  }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{t.tier.label}</p>
                      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>
                        {t.tier.article} · ceiling {formatEur(t.fixedCeilingEur)}{t.tier.turnoverPct !== null ? ` / ${t.tier.turnoverPct}%` : ""}
                      </p>
                    </div>
                    {t.tier.rule === "national_discretion" ? (
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", fontFamily: "var(--font-mono), monospace" }}>n/a</span>
                    ) : (
                      <div style={{ textAlign: "right" }}>
                        <p style={{ fontSize: 13, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: t.boundedExposureEur && t.boundedExposureEur > 0 ? "#e8b84b" : "rgba(255,255,255,0.4)", margin: 0 }}>
                          {t.boundedExposureEur !== null ? formatEur(t.boundedExposureEur) : "—"}
                        </p>
                        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.3)", margin: "1px 0 0", fontFamily: "var(--font-mono), monospace" }}>
                          {Math.round(t.unevidencedShare * 100)}% unevidenced
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{
        marginTop: 16,
        padding: "10px 14px",
        display: "flex",
        gap: 8,
        fontSize: 11,
        color: "rgba(255,255,255,0.4)",
      }}>
        <AlertTriangle size={12} style={{ flexShrink: 0, marginTop: 2 }} />
        <span>
          SME note: under AI Act Art. 99(6) the fine for SMEs and start-ups is the lower of the fixed amount
          or the turnover percentage. Toggle the SME flag to apply it.
        </span>
      </div>
    </div>
  );
}
