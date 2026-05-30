"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface SystemItem {
  id: string; name: string; purpose: string; annexArea: string; riskTier: string;
  deploymentStatus: string; countries: string[]; legalBasis: string | null;
  friaKnown: boolean; affectsChildren: boolean; affectsMigrants: boolean;
  provenance: string; provider: string | null; sourceCount: number;
}
interface GraphResponse {
  items: SystemItem[];
  summary: { total: number; highRisk: number; withoutFria: number; affectingChildren: number; affectingMigrants: number; verified: number } | null;
}

const AREA_LABEL: Record<string, string> = {
  biometrics: "Biometrics", critical_infra: "Critical infrastructure", education: "Education",
  employment: "Employment", essential: "Essential services", law_enforcement: "Law enforcement",
  migration: "Migration & asylum", justice: "Justice & democracy", none: "Outside Annex III",
};
const TIER_COLOR: Record<string, string> = {
  prohibited: "#ff5c5c", high_risk: "#e8b84b", limited_risk: "#4f7cff", minimal_risk: "#34d399", undetermined: "rgba(255,255,255,0.5)",
};
const PROV_META: Record<string, { label: string; color: string }> = {
  verified: { label: "Verified", color: "#34d399" },
  expert_validated: { label: "Expert-validated", color: "#4f7cff" },
  community: { label: "Community — unverified", color: "#e8b84b" },
};

export default function RightsGraphPage() {
  const [data, setData] = useState<GraphResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rights-graph/systems")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: GraphResponse) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const s = data?.summary;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <Link href="/ai-act-scenarios" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Scenario Engine</Link>
            <Link href="/roadmap" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Roadmap</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Unified Rights Graph · Beta</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          The AI systems shaping fundamental rights in Europe — mapped, sourced, in one place.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 780, marginBottom: 36 }}>
          A living map of real AI systems deployed across the EU: what they do, who runs them, which fundamental rights they touch, and whether a Fundamental Rights Impact Assessment is known to exist. Every entry carries its primary source. The map is deliberately small and rigorous — it grows through verified expert contribution, not scraping.
        </p>

        {/* The 30-second demo */}
        {s && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
            <Stat value={s.total} label="Systems mapped" color="#fff" />
            <Stat value={s.highRisk} label="High-risk or prohibited" color="#e8b84b" />
            <Stat value={s.withoutFria} label="High-risk, no known FRIA" color="#ff5c5c" />
            <Stat value={s.affectingChildren} label="Affecting children" color="#4f7cff" />
            <Stat value={s.affectingMigrants} label="Affecting migrants" color="#4f7cff" />
            <Stat value={s.verified} label="Source-verified" color="#34d399" />
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Loading the graph…</p>
        ) : !data || data.items.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>The graph is being seeded. Run the verified seed to populate it.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {data.items.map((it) => {
              const prov = PROV_META[it.provenance] ?? PROV_META.community;
              return (
                <div key={it.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{it.name}</span>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      <Tag text={AREA_LABEL[it.annexArea] ?? it.annexArea} bg="rgba(255,255,255,0.06)" color="rgba(255,255,255,0.7)" />
                      <Tag text={it.riskTier.replace(/_/g, " ")} bg={`${TIER_COLOR[it.riskTier]}22`} color={TIER_COLOR[it.riskTier]} />
                      <Tag text={prov.label} bg={`${prov.color}22`} color={prov.color} />
                    </div>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>{it.purpose}</p>
                  <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "rgba(255,255,255,0.5)" }}>
                    {it.provider && <span>Operator: <span style={{ color: "rgba(255,255,255,0.75)" }}>{it.provider}</span></span>}
                    {it.countries.length > 0 && <span>Deployment: {it.countries.join(", ")}</span>}
                    <span>{it.friaKnown ? "✓ FRIA known" : "⚠ No known FRIA"}</span>
                    {it.affectsChildren && <span style={{ color: "#4f7cff" }}>Affects children</span>}
                    {it.affectsMigrants && <span style={{ color: "#4f7cff" }}>Affects migrants</span>}
                    <span>{it.sourceCount} source{it.sourceCount !== 1 ? "s" : ""}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Palier 2 — invitation to contribute */}
        <div style={{ marginTop: 44, padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>This map is only as complete as its contributors</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
            Aegis provides the technology — a rigorous, sourced, living graph of AI systems and the rights they touch. What it can&apos;t do alone is see every system deployed on the ground across 27 Member States. That&apos;s where you come in. If you know of a real AI deployment that belongs here — with a primary source — you can add it. Every contribution is reviewed before it&apos;s marked verified.
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
