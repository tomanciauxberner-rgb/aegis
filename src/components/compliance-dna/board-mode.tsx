"use client";

import { TrendingUp, ShieldAlert, CheckCircle2, Target, Download } from "lucide-react";
import { type BoardSummary, type RegimeScore, formatEur } from "@/lib/compliance-dna/scoring";

interface BoardModeProps {
  summary: BoardSummary;
  scores: RegimeScore[];
}

export function BoardMode({ summary, scores }: BoardModeProps) {
  const priorities = [...scores]
    .filter((s) => s.regime.hasFinancialPenalty)
    .sort((a, b) => a.coveragePct - b.coveragePct)
    .slice(0, 3);

  function printPage() {
    if (typeof window !== "undefined") window.print();
  }

  return (
    <div>
      <style>{`
        @keyframes boardReveal {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseGlow {
          0%, 100% { opacity: 0.5; }
          50% { opacity: 0.85; }
        }
        .board-reveal { animation: boardReveal 0.6s cubic-bezier(0.16,1,0.3,1) both; }
        @media print {
          .no-print { display: none !important; }
          body { background: #0d1b35 !important; }
        }
      `}</style>

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }} className="no-print">
        <button
          onClick={printPage}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.7)", background: "transparent", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer" }}
        >
          <Download size={14} /> Export one-pager
        </button>
      </div>

      {/* Cinematic hero */}
      <div className="board-reveal" style={{
        position: "relative",
        borderRadius: 20,
        padding: "44px 40px",
        overflow: "hidden",
        marginBottom: 16,
        background: "radial-gradient(ellipse at top left, rgba(232,184,75,0.12), transparent 55%), radial-gradient(ellipse at bottom right, rgba(255,92,92,0.10), transparent 55%), linear-gradient(135deg, rgba(13,27,53,0.6), rgba(7,21,37,0.9))",
        border: "1px solid rgba(232,184,75,0.18)",
      }}>
        {/* grain / glow accents */}
        <div style={{
          position: "absolute", top: -120, right: -80, width: 360, height: 360,
          background: "radial-gradient(circle, rgba(232,184,75,0.10), transparent 70%)",
          animation: "pulseGlow 5s ease-in-out infinite", pointerEvents: "none",
        }} />

        <div style={{ position: "relative" }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.25em", textTransform: "uppercase", color: "rgba(255,255,255,0.45)", margin: 0 }}>
            Regulatory exposure · upper-bound
          </p>
          <p style={{
            fontSize: 64, fontWeight: 700, fontFamily: "var(--font-mono), monospace",
            color: "#fff", margin: "12px 0 0", lineHeight: 1, letterSpacing: "-0.02em",
            textShadow: "0 0 50px rgba(232,184,75,0.35)",
          }}>
            {summary.totalMaxExposureEur !== null ? formatEur(summary.totalMaxExposureEur) : "—"}
          </p>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", margin: "16px 0 0", maxWidth: 460, lineHeight: 1.6 }}>
            Aggregate upper-bound across {summary.regimesAssessed} regime{summary.regimesAssessed > 1 ? "s" : ""},
            bounded by real statutory ceilings and scaled by unevidenced obligations.
          </p>
        </div>
      </div>

      {/* Metric trio */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 16 }}>
        {[
          { icon: CheckCircle2, label: "Avg coverage", value: `${summary.averageCoveragePct}%`, color: "#4f7cff", delay: 0.1 },
          { icon: TrendingUp, label: "Regimes at risk", value: String(summary.regimesAtRisk), color: "#ff5c5c", delay: 0.18 },
          { icon: ShieldAlert, label: "Largest single", value: summary.worstRegime ? formatEur(summary.worstRegime.exposureEur) : "—", color: "#e8b84b", delay: 0.26 },
        ].map((m) => {
          const Icon = m.icon;
          return (
            <div key={m.label} className="board-reveal" style={{
              animationDelay: `${m.delay}s`,
              padding: "22px", borderRadius: 16,
              background: "rgba(255,255,255,0.025)", border: "1px solid rgba(255,255,255,0.08)",
            }}>
              <Icon size={18} style={{ color: m.color, marginBottom: 12 }} />
              <p style={{ fontSize: 30, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: m.color, margin: 0, lineHeight: 1 }}>{m.value}</p>
              <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "8px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>{m.label}</p>
            </div>
          );
        })}
      </div>

      {/* Priorities */}
      {priorities.length > 0 && (
        <div className="board-reveal" style={{ animationDelay: "0.34s", padding: "24px", borderRadius: 16, background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
            <Target size={15} style={{ color: "#4f7cff" }} />
            <span style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}>Action priorities</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {priorities.map((p, i) => (
              <div key={p.regime.code} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span style={{ fontSize: 24, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "rgba(255,255,255,0.15)", width: 32, flexShrink: 0 }}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{p.regime.name}</p>
                  <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", margin: "2px 0 0" }}>
                    {p.unmet} unmet · {p.partial} partial of {p.applicable} obligations
                  </p>
                </div>
                <div style={{ width: 120, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.06)", overflow: "hidden", flexShrink: 0 }}>
                  <div style={{ height: "100%", width: `${p.coveragePct}%`, background: p.coveragePct >= 50 ? "#e8b84b" : "#ff5c5c", borderRadius: 3 }} />
                </div>
                <span style={{ fontSize: 18, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: p.coveragePct >= 50 ? "#e8b84b" : "#ff5c5c", width: 50, textAlign: "right" }}>
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
