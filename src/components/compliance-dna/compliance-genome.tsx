"use client";

import { type RegimeScore } from "@/lib/compliance-dna/scoring";

const FORCE_META: Record<string, { label: string; color: string }> = {
  obligation: { label: "Legal obligation", color: "#ef4444" },
  harmonised_standard: { label: "Harmonised standard", color: "#4f7cff" },
  best_practice: { label: "Best practice", color: "#34d399" },
};

function coverageColor(pct: number): string {
  if (pct >= 80) return "#34d399";
  if (pct >= 50) return "#4f7cff";
  if (pct >= 25) return "#e8b84b";
  return "#ef4444";
}

export function ComplianceGenome({ scores }: { scores: RegimeScore[] }) {
  if (scores.length === 0) {
    return (
      <div style={{ padding: "32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10 }}>
        No regime assessed yet. Add obligation assessments to build the genome.
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
      {scores.map((s) => (
        <div key={s.regime.code} style={{
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: 12,
          padding: "18px 20px",
          background: "rgba(255,255,255,0.02)",
        }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#e8eaf0" }}>{s.regime.name}</span>
                {s.regime.legalForce === "voluntary_standard" && (
                  <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: "rgba(52,211,153,0.1)", color: "#34d399", border: "1px solid rgba(52,211,153,0.2)" }}>
                    Voluntary
                  </span>
                )}
              </div>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", fontFamily: "var(--font-mono), monospace" }}>{s.regime.instrument}</span>
            </div>
            <div style={{ textAlign: "right" }}>
              <p style={{ fontSize: 26, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: coverageColor(s.coveragePct), margin: 0, lineHeight: 1 }}>
                {s.coveragePct}%
              </p>
              <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "3px 0 0", textTransform: "uppercase", letterSpacing: "0.08em", fontFamily: "var(--font-mono), monospace" }}>
                weighted coverage
              </p>
            </div>
          </div>

          {/* Per-force breakdown — the differentiator vs a single opaque score */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {(["obligation", "harmonised_standard", "best_practice"] as const).map((force) => {
              const bucket = s.byForce[force];
              if (bucket.total === 0) return null;
              const pct = Math.round((bucket.met / bucket.total) * 100);
              const meta = FORCE_META[force];
              return (
                <div key={force}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                    <span style={{ fontSize: 11, color: meta.color, fontWeight: 600 }}>{meta.label}</span>
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.5)" }}>
                      {bucket.met}/{bucket.total}
                    </span>
                  </div>
                  <div style={{ height: 6, borderRadius: 3, background: "rgba(255,255,255,0.05)", overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${pct}%`, background: meta.color, borderRadius: 3, transition: "width 0.4s ease" }} />
                  </div>
                </div>
              );
            })}
          </div>

          {s.regime.note && (
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.5, margin: "12px 0 0", fontStyle: "italic" }}>
              {s.regime.note}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
