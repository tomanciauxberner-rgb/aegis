"use client";

import { useState, useMemo } from "react";
import { ISO_42001_NODES, AI_ACT_NODES, BRIDGE_MAPPINGS, type Alignment } from "@/lib/compliance-bridge/mappings";

const ALIGN_COLOR: Record<Alignment, string> = {
  high: "#34d399",
  partial: "#e8b84b",
  gap: "#ff5c5c",
};

const ALIGN_LABEL: Record<Alignment, string> = {
  high: "High alignment",
  partial: "Partial",
  gap: "Gap — no equivalent",
};

export function BridgeGraph() {
  const [active, setActive] = useState<string | null>(null);

  // Left column: ISO nodes that appear in mappings (plus a virtual "no equivalent" slot for gaps)
  const isoNodes = useMemo(() => Object.values(ISO_42001_NODES), []);
  const aiNodes = useMemo(() => Object.values(AI_ACT_NODES), []);

  const W = 760;
  const colLeftX = 150;
  const colRightX = W - 150;
  const rowH = 58;
  const topPad = 30;
  const leftH = isoNodes.length * rowH;
  const rightH = aiNodes.length * rowH;
  const H = Math.max(leftH, rightH) + topPad * 2;

  const isoY = (code: string) => topPad + isoNodes.findIndex((n) => n.code === code) * rowH + rowH / 2;
  const aiY = (code: string) => topPad + aiNodes.findIndex((n) => n.code === code) * rowH + rowH / 2;
  // center the shorter column
  const leftOffset = (H - 2 * topPad - leftH) / 2;
  const rightOffset = (H - 2 * topPad - rightH) / 2;

  function isActiveMapping(m: typeof BRIDGE_MAPPINGS[number]): boolean {
    if (!active) return true;
    return m.iso?.code === active || m.aiAct.code === active;
  }

  return (
    <div>
      {/* Legend */}
      <div style={{ display: "flex", gap: 18, marginBottom: 16, flexWrap: "wrap" }}>
        {(["high", "partial", "gap"] as Alignment[]).map((a) => (
          <div key={a} style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span style={{ width: 18, height: 3, borderRadius: 2, background: ALIGN_COLOR[a], display: "inline-block" }} />
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", fontFamily: "var(--font-mono), monospace" }}>{ALIGN_LABEL[a]}</span>
          </div>
        ))}
      </div>

      <div style={{ overflowX: "auto", borderRadius: 14, background: "radial-gradient(ellipse at center, rgba(79,124,255,0.04), transparent 70%)", padding: "8px 0" }}>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ minWidth: W }}>
          <defs>
            <linearGradient id="bridge-iso" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="#4f7cff" />
              <stop offset="100%" stopColor="#a06bff" />
            </linearGradient>
          </defs>

          {/* Column headers */}
          <text x={colLeftX} y={16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="var(--font-mono), monospace" letterSpacing="2" style={{ textTransform: "uppercase" }}>ISO 42001</text>
          <text x={colRightX} y={16} textAnchor="middle" fill="rgba(255,255,255,0.5)" fontSize="11" fontFamily="var(--font-mono), monospace" letterSpacing="2" style={{ textTransform: "uppercase" }}>EU AI Act</text>

          {/* Connection curves */}
          {BRIDGE_MAPPINGS.map((m) => {
            const y2 = aiY(m.aiAct.code) + rightOffset;
            const color = ALIGN_COLOR[m.alignment];
            const on = isActiveMapping(m);

            if (!m.iso) {
              // Gap: stub coming from the left edge (no ISO source)
              const x1 = colLeftX + 60;
              const d = `M ${x1} ${y2} C ${(x1 + colRightX) / 2} ${y2}, ${(x1 + colRightX) / 2} ${y2}, ${colRightX - 60} ${y2}`;
              return (
                <path key={m.id} d={d} fill="none" stroke={color} strokeWidth={on ? 2 : 1}
                  strokeDasharray="3 5" opacity={on ? 0.7 : 0.12} />
              );
            }

            const y1 = isoY(m.iso.code) + leftOffset;
            const midX = (colLeftX + colRightX) / 2;
            const d = `M ${colLeftX + 60} ${y1} C ${midX} ${y1}, ${midX} ${y2}, ${colRightX - 60} ${y2}`;
            return (
              <path key={m.id} d={d} fill="none" stroke={color}
                strokeWidth={on ? 2.5 : 1} opacity={on ? 0.85 : 0.12}
                style={{ transition: "opacity 0.3s, stroke-width 0.3s" }} />
            );
          })}

          {/* ISO nodes */}
          {isoNodes.map((n) => {
            const y = isoY(n.code) + leftOffset;
            const on = active === n.code || active === null;
            return (
              <g key={n.code} style={{ cursor: "pointer" }} onClick={() => setActive(active === n.code ? null : n.code)} opacity={on ? 1 : 0.35}>
                <rect x={colLeftX - 60} y={y - 18} width={120} height={36} rx={8}
                  fill={active === n.code ? "rgba(79,124,255,0.18)" : "rgba(255,255,255,0.03)"}
                  stroke={active === n.code ? "#4f7cff" : "rgba(255,255,255,0.12)"} strokeWidth={1} />
                <text x={colLeftX} y={y - 2} textAnchor="middle" fill="#e8eaf0" fontSize="10" fontFamily="var(--font-mono), monospace" fontWeight="700">{n.ref}</text>
                <text x={colLeftX} y={y + 10} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8">{n.title.slice(0, 22)}</text>
              </g>
            );
          })}

          {/* AI Act nodes */}
          {aiNodes.map((n) => {
            const y = aiY(n.code) + rightOffset;
            const on = active === n.code || active === null;
            const hasGap = BRIDGE_MAPPINGS.some((m) => m.aiAct.code === n.code && m.alignment === "gap");
            return (
              <g key={n.code} style={{ cursor: "pointer" }} onClick={() => setActive(active === n.code ? null : n.code)} opacity={on ? 1 : 0.35}>
                <rect x={colRightX - 60} y={y - 18} width={120} height={36} rx={8}
                  fill={active === n.code ? "rgba(79,124,255,0.18)" : "rgba(255,255,255,0.03)"}
                  stroke={active === n.code ? "#4f7cff" : hasGap ? "rgba(255,92,92,0.35)" : "rgba(255,255,255,0.12)"} strokeWidth={1} />
                <text x={colRightX} y={y - 2} textAnchor="middle" fill="#e8eaf0" fontSize="10" fontFamily="var(--font-mono), monospace" fontWeight="700">{n.ref}</text>
                <text x={colRightX} y={y + 10} textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="8">{n.title.slice(0, 22)}</text>
              </g>
            );
          })}
        </svg>
      </div>

      {/* Detail panel for active node */}
      {active && (
        <div style={{ marginTop: 16, display: "flex", flexDirection: "column", gap: 8 }}>
          {BRIDGE_MAPPINGS.filter((m) => m.iso?.code === active || m.aiAct.code === active).map((m) => (
            <div key={m.id} style={{
              padding: "12px 16px", borderRadius: 10,
              border: `1px solid ${ALIGN_COLOR[m.alignment]}33`,
              background: `${ALIGN_COLOR[m.alignment]}0a`,
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: ALIGN_COLOR[m.alignment], padding: "2px 7px", borderRadius: 4, background: `${ALIGN_COLOR[m.alignment]}18` }}>
                  {ALIGN_LABEL[m.alignment]}
                </span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.6)" }}>
                  {m.iso ? `${m.iso.ref} → ` : "No ISO 42001 equivalent → "}{m.aiAct.ref}
                </span>
              </div>
              <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.55, margin: 0 }}>{m.note}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
