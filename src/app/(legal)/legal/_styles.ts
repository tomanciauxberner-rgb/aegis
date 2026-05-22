import type { CSSProperties } from "react";

export const legalStyles: Record<string, CSSProperties> = {
  h1: { fontSize: 30, fontWeight: 800, marginBottom: 8, color: "#fff" },
  updated: { fontSize: 12, color: "rgba(255,255,255,0.4)", marginBottom: 32, textTransform: "uppercase", letterSpacing: 1 },
  h2: { fontSize: 18, fontWeight: 700, margin: "32px 0 10px", color: "#fff" },
  p: { fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 12 },
  li: { fontSize: 14, lineHeight: 1.7, color: "rgba(255,255,255,0.7)", marginBottom: 6 },
  note: { fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: 16, margin: "16px 0" },
  a: { color: "#4f7cff", textDecoration: "none" },
};
