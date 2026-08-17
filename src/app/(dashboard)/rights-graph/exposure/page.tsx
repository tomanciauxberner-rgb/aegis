"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Sys {
  id: string; name: string; area: string; areaLabel: string; riskTier: string;
  countries: string[]; provider: string | null; affectsChildren: boolean; affectsMigrants: boolean; sources: number;
}
interface Div { topic: string; authorities: number; }
interface Resp {
  question: string; systems: Sys[]; divergences: Div[];
  summary: { systemsNoFria: number; affectingChildren: number; affectingMigrants: number; divergingTopics: number } | null;
}

const TIER_COLOR: Record<string, string> = { prohibited: "#ff5c5c", high_risk: "#e8b84b" };

export default function ExposurePage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rights-graph/exposure")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: Resp) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const sum = data?.summary;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Rights Exposure · the question that crosses all three layers</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.18, marginBottom: 16 }}>
          Show me the high-risk systems with no publicly known FRIA — and the questions regulators can&apos;t agree on.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 800, marginBottom: 36 }}>
          This is the question an expert actually asks. It can only be answered by crossing three layers at once: the systems in the Rights Graph, their FRIA coverage, and where the authorities themselves diverge. Below is that crossing — on the systems verified so far, each one sourced.
        </p>

        {sum && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
            <Stat value={sum.systemsNoFria} label="High-risk, no publicly known FRIA" color="#ff5c5c" />
            <Stat value={sum.affectingChildren} label="…affecting children" color="#4f7cff" />
            <Stat value={sum.affectingMigrants} label="…affecting migrants" color="#4f7cff" />
            <Stat value={sum.divergingTopics} label="Regulatory questions in dispute" color="#e8b84b" />
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Crossing the layers…</p>
        ) : !data ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>The graph is being seeded.</p>
          </div>
        ) : (
          <>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>High-risk systems without a publicly known FRIA</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>Each is a system the AI Act would likely require to be assessed — where no assessment is identifiable in the public record. This means none was found publicly, not that none exists.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 40 }}>
              {data.systems.map((s) => (
                <div key={s.id} style={{ border: "1px solid rgba(255,92,92,0.2)", borderRadius: 10, padding: "14px 16px", background: "rgba(255,92,92,0.03)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 4 }}>
                    <span style={{ fontSize: 14, fontWeight: 600, color: "#fff" }}>{s.name}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag text={s.areaLabel} bg="rgba(255,255,255,0.06)" color="rgba(255,255,255,0.7)" />
                      <Tag text={s.riskTier.replace(/_/g, " ")} bg={`${TIER_COLOR[s.riskTier] ?? "#999"}22`} color={TIER_COLOR[s.riskTier] ?? "#999"} />
                      {s.affectsChildren && <Tag text="children" bg="rgba(79,124,255,0.15)" color="#4f7cff" />}
                      {s.affectsMigrants && <Tag text="migrants" bg="rgba(79,124,255,0.15)" color="#4f7cff" />}
                    </div>
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", display: "flex", gap: 14, flexWrap: "wrap" }}>
                    {s.provider && <span>{s.provider}</span>}
                    {s.countries.length > 0 && <span>{s.countries.join(", ")}</span>}
                    <span style={{ color: "#ff7676" }}>No public FRIA</span>
                    <span>{s.sources} source{s.sources !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              ))}
            </div>

            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 6 }}>…while these regulatory questions remain in dispute</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", marginBottom: 16 }}>The uncertainty above doesn&apos;t resolve cleanly, because the authorities themselves diverge on the questions that would settle it.</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 32 }}>
              {data.divergences.map((d, i) => (
                <Link key={i} href="/rights-graph/divergence" style={{ textDecoration: "none" }}>
                  <div style={{ border: "1px solid rgba(232,184,75,0.25)", borderRadius: 10, padding: "12px 16px", background: "rgba(232,184,75,0.04)", display: "flex", justifyContent: "space-between", gap: 10 }}>
                    <span style={{ fontSize: 13, color: "rgba(255,255,255,0.85)" }}>{d.topic}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", color: "#e8b84b", whiteSpace: "nowrap" }}>{d.authorities} authorities ↗</span>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

        <div style={{ marginTop: 24, padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>This answer sharpens with every verified system</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
            The list above is exactly as complete as the graph behind it. Each high-risk system added — with its source and FRIA status — makes this the clearest available picture of where Europe is deploying AI into rights-sensitive contexts without a documented assessment, on questions its own regulators haven&apos;t resolved.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}>
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
function Tag({ text, bg, color }: { text: string; bg: string; color: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, background: bg, color, whiteSpace: "nowrap" }}>{text}</span>;
}
