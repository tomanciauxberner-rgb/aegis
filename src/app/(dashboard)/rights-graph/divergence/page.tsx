"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Position {
  authority: string; authorityCode: string | null; authorityLabel: string | null;
  authorityKind: string | null; inEea: boolean | null;
  stance: string; sourceUrl: string; sourceTier: string | null;
  statedAt: string | null; provenance: string;
  anchorQuote: string | null; anchorLocator: string | null;
}
interface Topic { topic: string; positions: Position[]; authorityCount: number; diverges: boolean; unmappedCount: number; }
interface Resp { topics: Topic[]; summary: { topics: number; diverging: number; positions: number; primary: number; secondary: number; anchored: number } | null; }

export default function DivergencePage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rights-graph/divergence")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: Resp) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.summary;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Regulatory Divergence Engine · Beta</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          Where Europe&apos;s regulators don&apos;t agree — on the record.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 780, marginBottom: 36 }}>
          The hardest question for anyone deploying AI isn&apos;t what the rule says — it&apos;s where the authorities interpreting it disagree. Aegis maps the documented positions of the Commission, the EDPB, the EDPS, the AI Office and national regulators on the same question, and surfaces the tensions. Every position is sourced. No invented consensus, no invented conflict.
        </p>

        {s && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 40 }}>
            <Stat value={s.diverging} label="Topics where authorities diverge" color="#ff5c5c" />
            <Stat value={s.topics} label="Topics tracked" color="#fff" />
            <Stat value={s.positions} label="Positions mapped" color="#fff" />
            <Stat value={s.primary} label="Sourced to the regulator's own act" color={s.primary === s.positions ? "#34d399" : "#e8b84b"} />
            <Stat value={s.anchored} label="Anchored to a quoted passage" color={s.anchored === s.positions ? "#34d399" : "#e8b84b"} />
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading positions…</p>
        ) : !data || data.topics.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>The positions table is being seeded.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {data.topics.map((t, i) => (
              <section key={i} style={{ border: `1px solid ${t.diverges ? "rgba(255,92,92,0.3)" : "rgba(255,255,255,0.08)"}`, borderRadius: 14, padding: 20, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{t.topic}</h2>
                  {t.diverges
                    ? <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, background: "rgba(255,92,92,0.15)", color: "#ff5c5c" }}>Divergence · {t.authorityCount} authorities</span>
                    : <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, background: "rgba(52,211,153,0.15)", color: "#34d399" }}>Single position</span>}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {t.positions.map((p, j) => (
                    <div key={j} style={{ borderLeft: `2px solid ${p.authorityKind === "regulated_entity" ? "rgba(255,255,255,0.15)" : "rgba(79,124,255,0.4)"}`, paddingLeft: 14 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: p.authorityKind === "regulated_entity" ? "rgba(255,255,255,0.55)" : "#4f7cff" }}>
                            {p.authorityLabel ?? p.authority}
                          </span>
                          {p.authorityKind === "regulated_entity" && <Tag text="Regulated entity, not an authority" bg="rgba(255,255,255,0.08)" fg="rgba(255,255,255,0.55)" />}
                          {!p.authorityCode && <Tag text="Not an authority position" bg="rgba(255,255,255,0.08)" fg="rgba(255,255,255,0.55)" />}
                          {p.inEea === false && <Tag text="Outside the EEA" bg="rgba(232,184,75,0.12)" fg="#e8b84b" />}
                          {p.sourceTier === "primary"
                            ? <Tag text="Primary source" bg="rgba(52,211,153,0.15)" fg="#34d399" />
                            : <Tag text="Secondary source, re-sourcing pending" bg="rgba(232,184,75,0.12)" fg="#e8b84b" />}
                        </span>
                        {p.statedAt && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>{p.statedAt}</span>}
                      </div>
                      <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{p.stance}</p>
                      {p.anchorQuote && (
                        <blockquote style={{ margin: "8px 0", padding: "8px 12px", borderLeft: "2px solid rgba(52,211,153,0.5)", background: "rgba(52,211,153,0.05)", fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.75)", fontStyle: "italic" }}>
                          {p.anchorQuote}
                          {p.anchorLocator && <span style={{ display: "block", marginTop: 4, fontStyle: "normal", fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{p.anchorLocator}</span>}
                        </blockquote>
                      )}
                      <a href={p.sourceUrl} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", textDecoration: "none" }}>Source ↗</a>
                    </div>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        <div style={{ marginTop: 44, padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>Spot a divergence we&apos;re missing?</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
            Regulatory positions shift constantly across the Commission, the EDPB, the EDPS, the AI Office and 27 national authorities. No single team can track them all. If you follow a question where authorities have taken conflicting positions — with sources — help us map it.
          </p>
          <Link href="/register" style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}>
            Request contributor access →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label, color }: { value: number; label: string; color: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function Tag({ text, bg, fg }: { text: string; bg: string; fg: string }) {
  return (
    <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.4, textTransform: "uppercase", padding: "2px 7px", borderRadius: 4, background: bg, color: fg, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}
