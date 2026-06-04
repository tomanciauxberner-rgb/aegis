"use client";

import { useEffect, useState } from "react";
import { ShieldCheck, AlertTriangle, ArrowRight } from "lucide-react";
import { reverseCoverageIsoToAiAct } from "@/lib/compliance-bridge/bridge-engine";
import { COVERAGE_DISCLAIMER } from "@/lib/compliance-bridge/mappings";

function useCountUp(target: number, durationMs = 900): number {
  const [v, setV] = useState(0);
  useEffect(() => {
    let raf = 0;
    let start: number | null = null;
    function tick(ts: number) {
      if (start === null) start = ts;
      const p = Math.min((ts - start) / durationMs, 1);
      setV(Math.round(target * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, durationMs]);
  return v;
}

export function ReverseCompliance() {
  const result = reverseCoverageIsoToAiAct();
  const pct = useCountUp(result.coveragePct);

  const circumference = 2 * Math.PI * 70;
  const dash = (pct / 100) * circumference;

  return (
    <div>
      <div style={{ display: "flex", gap: 28, alignItems: "center", flexWrap: "wrap", marginBottom: 28 }}>
        {/* Radial gauge */}
        <div style={{ position: "relative", width: 180, height: 180, flexShrink: 0 }}>
          <svg width={180} height={180} viewBox="0 0 180 180">
            <circle cx={90} cy={90} r={70} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={12} />
            <circle
              cx={90} cy={90} r={70} fill="none"
              stroke="url(#rev-grad)" strokeWidth={12} strokeLinecap="round"
              strokeDasharray={`${dash} ${circumference}`}
              transform="rotate(-90 90 90)"
              style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.16,1,0.3,1)" }}
            />
            <defs>
              <linearGradient id="rev-grad" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#4f7cff" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: 38, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#e8eaf0", lineHeight: 1 }}>{pct}%</span>
            <span style={{ fontSize: 9, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace", marginTop: 4 }}>covered</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 260 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10, fontSize: 14, fontFamily: "var(--font-mono), monospace" }}>
            <span style={{ color: "#4f7cff", fontWeight: 700 }}>{result.fromFramework}</span>
            <ArrowRight size={15} style={{ color: "rgba(255,255,255,0.3)" }} />
            <span style={{ color: "#e8eaf0", fontWeight: 700 }}>{result.toFramework}</span>
          </div>
          <p style={{ fontSize: 13, color: "rgba(255,255,255,0.6)", lineHeight: 1.6, margin: "0 0 14px" }}>
            Holding ISO/IEC 42001 covers an estimated <strong style={{ color: "#34d399" }}>{result.coveragePct}%</strong> of
            the mapped EU AI Act obligations. {result.highCount} map strongly, {result.partialCount} partially,
            and <strong style={{ color: "#ff5c5c" }}>{result.gapCount} have no ISO 42001 equivalent</strong>.
          </p>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            {[
              { label: "High", value: result.highCount, color: "#34d399" },
              { label: "Partial", value: result.partialCount, color: "#e8b84b" },
              { label: "Gaps", value: result.gapCount, color: "#ff5c5c" },
            ].map((s) => (
              <div key={s.label} style={{ padding: "8px 14px", borderRadius: 8, background: `${s.color}12`, border: `1px solid ${s.color}33` }}>
                <span style={{ fontSize: 18, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: s.color }}>{s.value}</span>
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)", marginLeft: 6 }}>{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Gaps — what's missing */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <AlertTriangle size={15} style={{ color: "#ff5c5c" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>What ISO 42001 does not cover</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {result.gaps.map((m) => (
          <div key={m.id} style={{ padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,92,92,0.2)", background: "rgba(255,92,92,0.05)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
              <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#ff5c5c" }}>{m.aiAct.ref}</span>
              <span style={{ fontSize: 13, color: "#e8eaf0", fontWeight: 600 }}>{m.aiAct.title}</span>
            </div>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>{m.note}</p>
          </div>
        ))}
      </div>

      {/* Strong coverage — what carries over */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <ShieldCheck size={15} style={{ color: "#34d399" }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0" }}>What carries over strongly</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
        {result.highMappings.map((m) => (
          <div key={m.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 16px", borderRadius: 10, border: "1px solid rgba(52,211,153,0.18)", background: "rgba(52,211,153,0.04)" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "#4f7cff", fontWeight: 700, minWidth: 130 }}>{m.iso?.ref}</span>
            <ArrowRight size={13} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
            <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: "#34d399", fontWeight: 700, minWidth: 90 }}>{m.aiAct.ref}</span>
            <span style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", flex: 1 }}>{m.aiAct.title}</span>
          </div>
        ))}
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
        {COVERAGE_DISCLAIMER}
      </p>
    </div>
  );
}
