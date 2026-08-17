"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface AreaGap { area: string; label: string; highRisk: number; withFria: number; gap: number; }
interface CountryGap { country: string; highRisk: number; withFria: number; gap: number; }
interface Resp {
  sample: { totalSystems: number; highRiskSystems: number };
  coverage: { highRisk: number; withFria: number; gap: number; coverageRate: number | null };
  byArea: AreaGap[];
  byCountry: CountryGap[];
}

export default function FriaGapPage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rights-graph/fria-gap")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: Resp) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const c = data?.coverage;
  const sample = data?.sample;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Fundamental Rights Assessment Gap · Beta</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          How many high-risk AI systems have a publicly identifiable Fundamental Rights Impact Assessment — and how many don&apos;t?
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 800, marginBottom: 12 }}>
          The AI Act requires many high-risk deployers to carry out a FRIA. But no one tracks whether they actually exist. This is a first measurement of that gap — built only from the systems currently in the Aegis Rights Graph, each one sourced.
        </p>
        <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", maxWidth: 800, marginBottom: 12 }}>
          FRA&apos;s own empirical work points the same way: its December 2025 report{" "}
          <a href="https://fra.europa.eu/en/publication/2025/assessing-high-risk-ai" target="_blank" rel="noopener noreferrer" style={{ color: "rgba(255,255,255,0.75)", textDecoration: "underline" }}>
            Assessing High-Risk Artificial Intelligence
          </a>{" "}
          found providers generally aware of privacy and data-protection risks but often not of wider fundamental-rights implications, and called for more guidance and an evidence base for fundamental-rights assessments. This page is a contribution to that evidence base.
        </p>

        {/* Honesty banner — sample size always visible */}
        {sample && (
          <div style={{ display: "inline-block", fontSize: 12, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(232,184,75,0.3)", background: "rgba(232,184,75,0.06)", borderRadius: 8, padding: "8px 12px", marginBottom: 36 }}>
            Sample: {sample.highRiskSystems} high-risk / prohibited systems currently mapped (of {sample.totalSystems} total). This is not a claim about all of Europe — it is the measurable gap across what has been verified so far, and it grows with contribution.
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Computing the gap…</p>
        ) : !c || c.highRisk === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>No high-risk systems mapped yet. The gap appears once the graph holds high-risk systems.</p>
          </div>
        ) : (
          <>
            {/* Headline gap */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, marginBottom: 16 }}>
              <Stat value={c.highRisk} label="High-risk / prohibited systems mapped" color="#fff" />
              <Stat value={c.withFria} label="With a FRIA known to exist" color="#34d399" />
              <Stat value={c.gap} label="No publicly known FRIA" color="#ff5c5c" />
              <Stat value={c.coverageRate !== null ? `${c.coverageRate}%` : "—"} label="Known coverage rate" color="#e8b84b" />
            </div>

            {/* Visual bar */}
            <div style={{ marginBottom: 40 }}>
              <div style={{ display: "flex", height: 28, borderRadius: 8, overflow: "hidden", border: "1px solid rgba(255,255,255,0.1)" }}>
                <div style={{ width: `${c.highRisk > 0 ? (c.withFria / c.highRisk) * 100 : 0}%`, background: "#34d399", minWidth: c.withFria > 0 ? 2 : 0 }} />
                <div style={{ flex: 1, background: "rgba(255,92,92,0.5)" }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "rgba(255,255,255,0.5)", marginTop: 6 }}>
                <span>FRIA known</span>
                <span>No publicly known FRIA</span>
              </div>
            </div>

            {/* By area */}
            {data!.byArea.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>By Annex III domain</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                  {data!.byArea.map((a) => (
                    <Row key={a.area} label={a.label} total={a.highRisk} withFria={a.withFria} gap={a.gap} />
                  ))}
                </div>
              </>
            )}

            {/* By country */}
            {data!.byCountry.length > 0 && (
              <>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 }}>By country of deployment</h2>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 36 }}>
                  {data!.byCountry.map((cy) => (
                    <Row key={cy.country} label={cy.country} total={cy.highRisk} withFria={cy.withFria} gap={cy.gap} />
                  ))}
                </div>
              </>
            )}
          </>
        )}

        <div style={{ marginTop: 24, padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>Help close the measurement gap</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
            This number is only as complete as the graph behind it. Every high-risk system you add — with its source, and with whether a FRIA is known — sharpens the first real measurement of Europe&apos;s fundamental-rights assessment gap. That measurement doesn&apos;t exist anywhere else yet. It can, with you.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}>
            Request contributor access →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Stat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}

function Row({ label, total, withFria, gap }: { label: string; total: number; withFria: number; gap: number }) {
  const pct = total > 0 ? (withFria / total) * 100 : 0;
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 10, padding: "12px 16px", background: "rgba(255,255,255,0.02)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8, fontSize: 13 }}>
        <span style={{ fontWeight: 600, color: "#fff" }}>{label}</span>
        <span style={{ color: "rgba(255,255,255,0.6)" }}>
          <span style={{ color: "#34d399" }}>{withFria} with</span> · <span style={{ color: "#ff5c5c" }}>{gap} without</span> · {total} total
        </span>
      </div>
      <div style={{ display: "flex", height: 8, borderRadius: 4, overflow: "hidden", background: "rgba(255,92,92,0.4)" }}>
        <div style={{ width: `${pct}%`, background: "#34d399" }} />
      </div>
    </div>
  );
}
