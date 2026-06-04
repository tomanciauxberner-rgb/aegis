"use client";

import { TrendingUp, ShieldAlert, CheckCircle2, Target } from "lucide-react";
import { type BoardSummary, type RegimeScore, formatEur } from "@/lib/compliance-dna/scoring";

interface BoardModeProps {
  summary: BoardSummary;
  scores: RegimeScore[];
}

export function BoardMode({ summary, scores }: BoardModeProps) {
  // Priorities: lowest-coverage binding regimes first
  const priorities = [...scores]
    .filter((s) => s.regime.hasFinancialPenalty)
    .sort((a, b) => a.coveragePct - b.coveragePct)
    .slice(0, 3);

  return (
    <div>
      {/* Headline metrics */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginBottom: 24 }}>
        <div style={{ padding: "20px", borderRadius: 14, background: "rgba(232,184,75,0.06)", border: "1px solid rgba(232,184,75,0.2)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <ShieldAlert size={16} style={{ color: "#e8b84b" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              Total exposure
            </span>
          </div>
          <p style={{ fontSize: 32, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#e8b84b", margin: 0, lineHeight: 1 }}>
            {summary.totalMaxExposureEur !== null ? formatEur(summary.totalMaxExposureEur) : "—"}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0", lineHeight: 1.4 }}>
            Upper-bound across all assessed regimes
          </p>
        </div>

        <div style={{ padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <CheckCircle2 size={16} style={{ color: "#4f7cff" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              Avg coverage
            </span>
          </div>
          <p style={{ fontSize: 32, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#4f7cff", margin: 0, lineHeight: 1 }}>
            {summary.averageCoveragePct}%
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0", lineHeight: 1.4 }}>
            Across {summary.regimesAssessed} regime{summary.regimesAssessed > 1 ? "s" : ""}
          </p>
        </div>

        <div style={{ padding: "20px", borderRadius: 14, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <TrendingUp size={16} style={{ color: "#ef4444" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
              Regimes at risk
            </span>
          </div>
          <p style={{ fontSize: 32, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#ef4444", margin: 0, lineHeight: 1 }}>
            {summary.regimesAtRisk}
          </p>
          <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0", lineHeight: 1.4 }}>
            With unevidenced obligations
          </p>
        </div>
      </div>

      {summary.worstRegime && (
        <div style={{
          padding: "14px 18px",
          background: "rgba(239,68,68,0.06)",
          border: "1px solid rgba(239,68,68,0.2)",
          borderRadius: 12,
          marginBottom: 24,
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}>
          <ShieldAlert size={18} style={{ color: "#ef4444", flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: 13, color: "#e8eaf0", margin: 0, fontWeight: 600 }}>
              Largest single exposure: {summary.worstRegime.name}
            </p>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", margin: "2px 0 0" }}>
              {formatEur(summary.worstRegime.exposureEur)} upper-bound — prioritise evidencing here.
            </p>
          </div>
        </div>
      )}

      {/* Priorities */}
      {priorities.length > 0 && (
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
            <Target size={15} style={{ color: "#4f7cff" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>Top priorities</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {priorities.map((p, i) => (
              <div key={p.regime.code} style={{
                display: "flex", alignItems: "center", gap: 14,
                padding: "14px 16px", borderRadius: 10,
                border: "1px solid rgba(255,255,255,0.07)", background: "rgba(255,255,255,0.02)",
              }}>
                <span style={{
                  width: 26, height: 26, borderRadius: "50%", flexShrink: 0,
                  background: "rgba(79,124,255,0.12)", color: "#4f7cff",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, fontWeight: 700, fontFamily: "var(--font-mono), monospace",
                }}>
                  {i + 1}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{p.regime.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>
                    {p.unmet} unmet · {p.partial} partial of {p.applicable} applicable obligations
                  </p>
                </div>
                <span style={{ fontSize: 18, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: p.coveragePct >= 50 ? "#e8b84b" : "#ef4444" }}>
                  {p.coveragePct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
