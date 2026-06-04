"use client";

import { useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { type RegimeFineExposure, formatEur } from "@/lib/compliance-dna/scoring";

/** Animated number that tweens to its target whenever it changes. */
function useCountUp(target: number, durationMs = 700): number {
  const [value, setValue] = useState(target);
  const fromRef = useRef(target);
  const startRef = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    fromRef.current = value;
    startRef.current = null;
    const from = fromRef.current;
    const delta = target - from;
    if (delta === 0) return;

    function tick(ts: number) {
      if (startRef.current === null) startRef.current = ts;
      const elapsed = ts - startRef.current;
      const p = Math.min(elapsed / durationMs, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setValue(Math.round(from + delta * eased));
      if (p < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [target]);

  return value;
}

function ExposureCounter({ total, ceiling }: { total: number; ceiling: number }) {
  const animated = useCountUp(total);
  const fillPct = ceiling > 0 ? Math.min((total / ceiling) * 100, 100) : 0;

  return (
    <div style={{
      position: "relative",
      padding: "32px 28px",
      borderRadius: 18,
      background: "linear-gradient(135deg, rgba(232,184,75,0.08), rgba(255,92,92,0.05))",
      border: "1px solid rgba(232,184,75,0.22)",
      overflow: "hidden",
      marginBottom: 24,
    }}>
      {/* animated fill bar behind */}
      <div style={{
        position: "absolute", left: 0, top: 0, bottom: 0,
        width: `${fillPct}%`,
        background: "linear-gradient(90deg, rgba(232,184,75,0.06), rgba(255,92,92,0.10))",
        transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative" }}>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(255,255,255,0.5)", margin: 0 }}>
          Aggregate upper-bound exposure
        </p>
        <p style={{
          fontSize: 52, fontFamily: "var(--font-mono), monospace", fontWeight: 700,
          color: "#e8b84b", margin: "8px 0 0", lineHeight: 1,
          textShadow: "0 0 30px rgba(232,184,75,0.3)",
          fontVariantNumeric: "tabular-nums",
        }}>
          {formatEur(animated)}
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14 }}>
          <div style={{ flex: 1, height: 5, borderRadius: 3, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${fillPct}%`,
              background: "linear-gradient(90deg, #e8b84b, #ff5c5c)",
              borderRadius: 3,
              transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
            }} />
          </div>
          <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)" }}>
            {Math.round(fillPct)}% of theoretical max
          </span>
        </div>
      </div>
    </div>
  );
}

function RegimeBar({ exp }: { exp: RegimeFineExposure }) {
  const max = exp.maxBoundedExposureEur ?? 0;
  const animated = useCountUp(max);

  return (
    <div style={{
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12,
      padding: "16px 18px",
      background: "rgba(255,255,255,0.02)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{exp.regimeName}</span>
        {exp.nationalDiscretionOnly ? (
          <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)" }}>National discretion</span>
        ) : (
          <span style={{ fontSize: 18, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: max > 0 ? "#e8b84b" : "#34d399", fontVariantNumeric: "tabular-nums" }}>
            {formatEur(animated)}
          </span>
        )}
      </div>

      {!exp.nationalDiscretionOnly && (
        <div style={{ display: "flex", gap: 4 }}>
          {exp.tiers.map((t) => {
            const tierMax = t.applicableCeilingEur ?? 0;
            const fill = tierMax > 0 ? (t.boundedExposureEur ?? 0) / tierMax : 0;
            return (
              <div key={t.tier.code} style={{ flex: 1 }} title={`${t.tier.label} · ${t.tier.article}`}>
                <div style={{ height: 8, borderRadius: 4, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                  <div style={{
                    height: "100%", width: `${fill * 100}%`,
                    background: fill > 0.5 ? "#ff5c5c" : fill > 0 ? "#e8b84b" : "transparent",
                    borderRadius: 4,
                    transition: "width 0.7s cubic-bezier(0.16,1,0.3,1)",
                  }} />
                </div>
                <p style={{ fontSize: 8, color: "rgba(255,255,255,0.3)", margin: "3px 0 0", textAlign: "center", fontFamily: "var(--font-mono), monospace" }}>
                  {t.tier.article}
                </p>
              </div>
            );
          })}
        </div>
      )}

      {exp.nationalDiscretionOnly && (
        <p style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", lineHeight: 1.5, margin: 0 }}>{exp.note}</p>
      )}
    </div>
  );
}

export function RiskToFine({ exposures }: { exposures: RegimeFineExposure[] }) {
  const withPenalty = exposures.filter((e) => e.hasFinancialPenalty);
  const totalExposure = withPenalty.reduce((s, e) => s + (e.maxBoundedExposureEur ?? 0), 0);
  const totalCeiling = withPenalty.reduce((s, e) => {
    const maxCeil = Math.max(0, ...e.tiers.map((t) => t.applicableCeilingEur ?? 0));
    return s + maxCeil;
  }, 0);

  return (
    <div>
      <ExposureCounter total={totalExposure} ceiling={totalCeiling} />

      <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
        {withPenalty.map((exp) => <RegimeBar key={exp.regimeCode} exp={exp} />)}
      </div>

      <div style={{ padding: "12px 16px", background: "rgba(79,124,255,0.05)", border: "1px solid rgba(79,124,255,0.18)", borderRadius: 10, display: "flex", gap: 10 }}>
        <Info size={15} style={{ color: "#4f7cff", flexShrink: 0, marginTop: 1 }} />
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, margin: 0 }}>
          <strong style={{ color: "#e8eaf0" }}>Live upper-bound, not a predicted fine.</strong> Every figure is the
          statutory ceiling of the applicable regime scaled by unevidenced obligations — it moves as you change
          the assessment. Bounded by real Article-level caps (AI Act Art. 99, GDPR Art. 83, NIS2 Art. 34, CRA Art. 64).
        </p>
      </div>
    </div>
  );
}
