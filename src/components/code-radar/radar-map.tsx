"use client";

import { useState } from "react";
import { EU27_PATHS } from "@/components/signals/eu-map";

export interface RadarCountryState {
  country: string;
  mode: "live" | "declared" | "none";
  label?: string;
  repositories?: number;
  owners?: number;
  capturedAt?: string;
  note?: string;
}

interface RadarMapProps {
  states: Record<string, RadarCountryState>;
}

const MODE_META: Record<
  RadarCountryState["mode"],
  { fill: string; opacity: number; label: string }
> = {
  live: { fill: "#34d399", opacity: 0.9, label: "Live — verified source" },
  declared: { fill: "#e8b84b", opacity: 0.45, label: "Declared — pending verification" },
  none: { fill: "#16233f", opacity: 0.85, label: "No national source tracked yet" },
};

const LEGEND: { mode: RadarCountryState["mode"] }[] = [
  { mode: "live" },
  { mode: "declared" },
  { mode: "none" },
];

type Tooltip = {
  name: string;
  state: RadarCountryState;
  x: number;
  y: number;
} | null;

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

export function RadarMap({ states }: RadarMapProps) {
  const [tooltip, setTooltip] = useState<Tooltip>(null);

  const handleMouseEnter = (
    e: React.MouseEvent<SVGPathElement>,
    code: string,
    name: string
  ) => {
    const svg = (e.currentTarget as SVGElement).closest("svg") as SVGSVGElement;
    const rect = svg.getBoundingClientRect();
    const state: RadarCountryState = states[code] ?? { country: code, mode: "none" };
    setTooltip({ name, state, x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, overflow: "hidden", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ padding: "12px 20px", borderBottom: "1px solid rgba(255,255,255,0.08)", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>Public-sector code sources — EU27</span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 14 }}>
          {LEGEND.map(({ mode }) => (
            <span key={mode} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "rgba(255,255,255,0.55)" }}>
              <span style={{ width: 10, height: 10, borderRadius: 3, background: MODE_META[mode].fill, opacity: mode === "none" ? 1 : MODE_META[mode].opacity, border: mode === "none" ? "1px solid rgba(255,255,255,0.15)" : "none", flexShrink: 0 }} />
              {MODE_META[mode].label}
            </span>
          ))}
        </div>
      </div>

      <div style={{ position: "relative", userSelect: "none" }}>
        <svg viewBox="0 0 680 420" style={{ width: "100%", height: "auto", display: "block", maxHeight: 380 }}>
          {EU27_PATHS.map(({ code, name, d, lx, ly }) => {
            const state: RadarCountryState = states[code] ?? { country: code, mode: "none" };
            const meta = MODE_META[state.mode];
            const isSmall = ["LU", "SI", "MT", "CY", "DK", "EE", "LV", "LT", "SK", "HR", "BE", "NL", "IE"].includes(code);

            return (
              <g key={code}>
                <path
                  d={d}
                  fill={meta.fill}
                  fillOpacity={meta.opacity}
                  stroke="#080a14"
                  strokeWidth={0.6}
                  strokeLinejoin="round"
                  style={{ cursor: "default", transition: "fill-opacity 0.12s ease" }}
                  onMouseEnter={(e) => handleMouseEnter(e, code, name)}
                  onMouseLeave={() => setTooltip(null)}
                />
                {!isSmall && (
                  <text
                    x={lx}
                    y={ly}
                    fontSize={5.5}
                    fill="rgba(255,255,255,0.85)"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    style={{ fontFamily: "monospace", fontWeight: 800, pointerEvents: "none", letterSpacing: "0.04em" }}
                  >
                    {code}
                  </text>
                )}
              </g>
            );
          })}
        </svg>

        {tooltip && (
          <div style={{ position: "absolute", zIndex: 20, pointerEvents: "none", left: Math.min(tooltip.x + 12, 460), top: Math.max(tooltip.y - 80, 8) }}>
            <div style={{ background: "#0c0e1a", border: "0.6px solid rgba(255,255,255,0.1)", borderRadius: 10, overflow: "hidden", minWidth: 210, maxWidth: 260, boxShadow: "0 12px 32px rgba(0,0,0,0.5)" }}>
              <div style={{ height: 3, width: "100%", background: MODE_META[tooltip.state.mode].fill }} />
              <div style={{ padding: "10px 14px" }}>
                <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 6 }}>{tooltip.name}</p>
                {tooltip.state.mode === "live" ? (
                  <>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 22, fontWeight: 800, color: MODE_META.live.fill, lineHeight: 1 }}>
                        {fmt(tooltip.state.repositories ?? 0)}
                      </span>
                      <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>public repositories</span>
                    </div>
                    {typeof tooltip.state.owners === "number" && (
                      <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", marginBottom: 4 }}>
                        {fmt(tooltip.state.owners)} public-sector organisations
                      </p>
                    )}
                    {tooltip.state.label && (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>Source: {tooltip.state.label}</p>
                    )}
                  </>
                ) : tooltip.state.mode === "declared" ? (
                  <>
                    <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", marginBottom: 4 }}>
                      National source identified — endpoint pending verification before it goes live.
                    </p>
                    {tooltip.state.label && (
                      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{tooltip.state.label}</p>
                    )}
                  </>
                ) : (
                  <p style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.6)" }}>
                    No national catalogue tracked yet. Know one? It only enters the radar once verified.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
