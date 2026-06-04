"use client";

import { useMemo } from "react";
import { type RegimeScore } from "@/lib/compliance-dna/scoring";

const FORCE_META: Record<string, { label: string; color: string }> = {
  obligation: { label: "Legal obligation", color: "#ff5c5c" },
  harmonised_standard: { label: "Harmonised standard", color: "#4f7cff" },
  best_practice: { label: "Best practice", color: "#34d399" },
};

function coverageColor(pct: number): string {
  if (pct >= 80) return "#34d399";
  if (pct >= 50) return "#4f7cff";
  if (pct >= 25) return "#e8b84b";
  return "#ff5c5c";
}

interface Rung {
  force: "obligation" | "harmonised_standard" | "best_practice";
  met: boolean;
  partial: boolean;
}

/**
 * Builds the ladder of rungs for one regime from its score breakdown.
 * Each rung is a base pair; missing rungs (unmet) leave a visible gap in the helix.
 */
function buildRungs(score: RegimeScore): Rung[] {
  const rungs: Rung[] = [];
  (["obligation", "harmonised_standard", "best_practice"] as const).forEach((force) => {
    const bucket = score.byForce[force];
    const metCount = Math.round(bucket.met);
    for (let i = 0; i < bucket.total; i++) {
      rungs.push({ force, met: i < metCount, partial: false });
    }
  });
  return rungs;
}

function HelixStrand({ score }: { score: RegimeScore }) {
  const rungs = useMemo(() => buildRungs(score), [score]);
  const n = Math.max(rungs.length, 1);
  const rowH = 26;
  const height = n * rowH + 40;
  const width = 220;
  const cx = width / 2;
  const amp = 64; // helix amplitude
  const turns = Math.max(1.5, n / 6);

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`back-${score.regime.code}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(255,255,255,0.06)" />
            <stop offset="50%" stopColor="rgba(255,255,255,0.16)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.06)" />
          </linearGradient>
        </defs>

        {/* Two sugar-phosphate backbones as sine waves */}
        {[0, Math.PI].map((phase, si) => {
          let d = "";
          for (let i = 0; i <= n; i++) {
            const y = 20 + i * rowH;
            const x = cx + amp * Math.sin((i / n) * turns * Math.PI * 2 + phase);
            d += i === 0 ? `M ${x} ${y}` : ` L ${x} ${y}`;
          }
          return (
            <path
              key={si}
              d={d}
              fill="none"
              stroke={`url(#back-${score.regime.code})`}
              strokeWidth={3}
              strokeLinecap="round"
            />
          );
        })}

        {/* Base-pair rungs */}
        {rungs.map((rung, i) => {
          const y = 20 + i * rowH;
          const t = (i / n) * turns * Math.PI * 2;
          const x1 = cx + amp * Math.sin(t);
          const x2 = cx + amp * Math.sin(t + Math.PI);
          const meta = FORCE_META[rung.force];
          const depth = (Math.cos(t) + 1) / 2; // 0..1 front/back for size + opacity
          const r = 3 + depth * 2.5;

          if (!rung.met) {
            // Missing base pair: faint broken rung — the visible non-conformity
            return (
              <line
                key={i}
                x1={x1} y1={y} x2={x2} y2={y}
                stroke="rgba(255,92,92,0.25)"
                strokeWidth={1}
                strokeDasharray="2 4"
              />
            );
          }

          return (
            <g key={i} opacity={0.45 + depth * 0.55}>
              <line x1={x1} y1={y} x2={x2} y2={y} stroke={meta.color} strokeWidth={1.5 + depth} strokeOpacity={0.5} />
              <circle cx={x1} cy={y} r={r} fill={meta.color} />
              <circle cx={x2} cy={y} r={r} fill={meta.color} />
            </g>
          );
        })}
      </svg>

      <div style={{ marginTop: 8, textAlign: "center" }}>
        <p style={{ fontSize: 13, fontWeight: 700, color: "#e8eaf0", margin: 0 }}>{score.regime.name}</p>
        <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: coverageColor(score.coveragePct), margin: "2px 0 0", lineHeight: 1 }}>
          {score.coveragePct}%
        </p>
        <p style={{ fontSize: 9, color: "rgba(255,255,255,0.35)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>
          {score.met}/{score.applicable} expressed
        </p>
      </div>
    </div>
  );
}

export function ComplianceGenome({ scores }: { scores: RegimeScore[] }) {
  if (scores.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
        No regime assessed yet. Add obligation assessments to express the genome.
      </div>
    );
  }

  return (
    <div>
      <style>{`
        @keyframes helixFloat {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .helix-cell { animation: helixFloat 4s ease-in-out infinite; }
      `}</style>

      {/* Legend */}
      <div style={{ display: "flex", gap: 18, marginBottom: 20, flexWrap: "wrap" }}>
        {Object.values(FORCE_META).map((m) => (
          <div key={m.label} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 9, height: 9, borderRadius: "50%", background: m.color, display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono), monospace" }}>{m.label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
          <span style={{ width: 14, borderTop: "1px dashed rgba(255,92,92,0.5)", display: "inline-block" }} />
          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono), monospace" }}>Missing — gap in helix</span>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: 8,
        padding: "20px 0",
        background: "radial-gradient(ellipse at center, rgba(79,124,255,0.04) 0%, transparent 70%)",
      }}>
        {scores.map((s, i) => (
          <div key={s.regime.code} className="helix-cell" style={{ animationDelay: `${i * 0.3}s` }}>
            <HelixStrand score={s} />
          </div>
        ))}
      </div>
    </div>
  );
}
