"use client";

import { useState } from "react";
import { HelpCircle, X, Clock, Zap, TrendingUp, Sparkles, Loader2 } from "lucide-react";
import {
  prioritiseRemediations,
  totalProjectedGain,
  buildNarrativePrompt,
  EFFORT_META,
  type Explanation,
} from "@/lib/explain/explain-engine";

interface ExplainWhyProps {
  explanation: Explanation;
  /** Optional: enable the Claude deep-dive button. Defaults to true. */
  allowDeepDive?: boolean;
}

export function ExplainWhy({ explanation, allowDeepDive = true }: ExplainWhyProps) {
  const [open, setOpen] = useState(false);
  const [narrative, setNarrative] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const remediations = prioritiseRemediations(explanation.remediations);
  const totalGain = totalProjectedGain(explanation.remediations);

  async function fetchNarrative() {
    setLoading(true);
    setError(false);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          messages: [{ role: "user", content: buildNarrativePrompt(explanation) }],
        }),
      });
      const data = await res.json();
      const text = (data.content ?? [])
        .filter((b: { type: string }) => b.type === "text")
        .map((b: { text: string }) => b.text)
        .join("\n")
        .trim();
      setNarrative(text || "No explanation returned.");
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        title="Explain why"
        style={{
          display: "inline-flex", alignItems: "center", gap: 5,
          fontSize: 11, fontFamily: "var(--font-mono), monospace",
          color: "#4f7cff", background: "rgba(79,124,255,0.08)",
          border: "1px solid rgba(79,124,255,0.22)", borderRadius: 6,
          padding: "3px 9px", cursor: "pointer",
        }}
      >
        <HelpCircle size={12} /> Why?
      </button>

      {open && (
        <div
          onClick={() => setOpen(false)}
          style={{
            position: "fixed", inset: 0, zIndex: 1000,
            background: "rgba(5,12,24,0.7)", backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center", padding: 20,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "100%", maxWidth: 560, maxHeight: "85vh", overflowY: "auto",
              background: "#0d1b35", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 16, padding: 28,
              boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
            }}
          >
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 20 }}>
              <div>
                <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.15em", textTransform: "uppercase", color: "#4f7cff", margin: 0 }}>
                  Explain why
                </p>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: "#e8eaf0", margin: "6px 0 0" }}>{explanation.subject}</h3>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 8 }}>
                  <span style={{ fontSize: 26, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "#e8eaf0" }}>{explanation.currentValue}</span>
                  {explanation.projectedValue && (
                    <span style={{ fontSize: 13, fontFamily: "var(--font-mono), monospace", color: "#34d399" }}>
                      → {explanation.projectedValue} achievable
                    </span>
                  )}
                </div>
              </div>
              <button onClick={() => setOpen(false)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.4)", cursor: "pointer", padding: 4 }}>
                <X size={18} />
              </button>
            </div>

            {/* Reasons */}
            <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
              Why this value
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
              {explanation.reasons.length === 0 ? (
                <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)" }}>No specific gaps recorded.</p>
              ) : explanation.reasons.map((r) => (
                <div key={r.code} style={{ padding: "10px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{r.label}</span>
                    {r.reference && <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", color: "#4f7cff" }}>{r.reference}</span>}
                  </div>
                  <p style={{ fontSize: 12, color: "rgba(255,255,255,0.55)", lineHeight: 1.5, margin: 0 }}>{r.detail}</p>
                </div>
              ))}
            </div>

            {/* Remediations */}
            {remediations.length > 0 && (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                  <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", margin: 0 }}>
                    How to improve · by return on effort
                  </p>
                  {totalGain > 0 && (
                    <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "#34d399" }}>+{totalGain} pts total</span>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 24 }}>
                  {remediations.map((r, i) => {
                    const em = EFFORT_META[r.effort];
                    return (
                      <div key={r.code} style={{ display: "flex", gap: 12, padding: "12px 14px", borderRadius: 8, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                        <span style={{ fontSize: 14, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>{i + 1}</span>
                        <div style={{ flex: 1 }}>
                          <p style={{ fontSize: 13, color: "#e8eaf0", margin: "0 0 8px", lineHeight: 1.45 }}>{r.action}</p>
                          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: em.color, fontFamily: "var(--font-mono), monospace" }}>
                              <Zap size={11} /> {em.label}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "rgba(255,255,255,0.5)", fontFamily: "var(--font-mono), monospace" }}>
                              <Clock size={11} /> {r.timeEstimate}
                            </span>
                            <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 11, color: "#34d399", fontFamily: "var(--font-mono), monospace" }}>
                              <TrendingUp size={11} /> +{r.scoreImpactPts} pts
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Optional Claude deep-dive */}
            {allowDeepDive && (
              <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 18 }}>
                {!narrative && !loading && (
                  <button
                    onClick={fetchNarrative}
                    style={{
                      display: "inline-flex", alignItems: "center", gap: 8,
                      fontSize: 12, fontWeight: 600, color: "#a06bff",
                      background: "rgba(160,107,255,0.08)", border: "1px solid rgba(160,107,255,0.25)",
                      borderRadius: 8, padding: "9px 16px", cursor: "pointer",
                    }}
                  >
                    <Sparkles size={14} /> Explain in plain language
                  </button>
                )}
                {loading && (
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    <Loader2 size={14} className="animate-spin" /> Generating explanation…
                  </div>
                )}
                {error && (
                  <p style={{ fontSize: 12, color: "#ff5c5c" }}>Could not generate the narrative. The figures above remain accurate.</p>
                )}
                {narrative && (
                  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(160,107,255,0.05)", border: "1px solid rgba(160,107,255,0.18)" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 8 }}>
                      <Sparkles size={12} style={{ color: "#a06bff" }} />
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#a06bff" }}>Plain-language summary</span>
                    </div>
                    {narrative.split("\n").filter(Boolean).map((para, i) => (
                      <p key={i} style={{ fontSize: 13, color: "rgba(255,255,255,0.7)", lineHeight: 1.6, margin: i === 0 ? 0 : "10px 0 0" }}>{para}</p>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
