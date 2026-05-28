"use client";

import { useState } from "react";
import Link from "next/link";
import {
  runScenarioEngine, ANNEX_III_AREAS, SOURCES,
  type ScenarioInput, type ScenarioResult, type DeployerRole, type SystemNature,
} from "@/lib/scenario/omnibus-engine";

const ROLES: { v: DeployerRole; l: string }[] = [
  { v: "deployer", l: "We deploy / use an AI system" },
  { v: "provider", l: "We provide / develop it" },
  { v: "both", l: "Both" },
];
const NATURES: { v: SystemNature; l: string }[] = [
  { v: "standalone", l: "Stand-alone AI system" },
  { v: "embedded_product", l: "Embedded in a regulated product (safety component)" },
  { v: "gpai", l: "General-purpose AI model" },
  { v: "transparency_only", l: "Generates content (text/image/audio/video)" },
  { v: "unsure", l: "Not sure" },
];

const WEIGHT_COLOR: Record<string, string> = {
  majority: "#34d399", minority: "#e8b84b", contested: "#ff5c5c", emerging: "#4f7cff",
};
const LIKELIHOOD_LABEL: Record<string, string> = {
  baseline: "Baseline", "agreed-but-pending": "Agreed · pending adoption", contingent: "Contingent risk", interpretive: "Interpretive",
};

export default function ScenarioPage() {
  const [role, setRole] = useState<DeployerRole>("deployer");
  const [nature, setNature] = useState<SystemNature>("standalone");
  const [annexArea, setAnnexArea] = useState("employment");
  const [country, setCountry] = useState("FR");
  const [description, setDescription] = useState("");
  const [result, setResult] = useState<ScenarioResult | null>(null);

  function run() {
    const input: ScenarioInput = { role, nature, annexArea, country, description };
    setResult(runScenarioEngine(input));
    setTimeout(() => document.getElementById("scenario-result")?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 980, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <Link href="/roadmap" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Roadmap</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 980, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Regulatory Scenario Engine · Beta</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          Don&apos;t just track the AI Act. Model how it could play out for <em>your</em> system.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 36 }}>
          The Digital Omnibus left every deployer with the same question: prepare for August 2026 or December 2027 — and what happens if you bet wrong? Describe your system and Aegis projects the plausible regulatory futures, your real deadline, your exposure, and where even the experts disagree. Every output is sourced. None of it is legal advice.
        </p>

        {/* INPUT */}
        <div style={{ border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, padding: 24, background: "rgba(255,255,255,0.02)", marginBottom: 32 }}>
          <Field label="Your role">
            <Select value={role} onChange={(v) => setRole(v as DeployerRole)} options={ROLES.map((r) => ({ v: r.v, l: r.l }))} />
          </Field>
          <Field label="Nature of the system">
            <Select value={nature} onChange={(v) => setNature(v as SystemNature)} options={NATURES.map((n) => ({ v: n.v, l: n.l }))} />
          </Field>
          <Field label="High-risk area (Annex III)">
            <Select value={annexArea} onChange={setAnnexArea} options={ANNEX_III_AREAS.map((a) => ({ v: a.code, l: `${a.label} · ${a.note}` }))} />
          </Field>
          <Field label="Primary country of deployment">
            <input value={country} onChange={(e) => setCountry(e.target.value.toUpperCase().slice(0, 2))} placeholder="FR" style={inputStyle} />
          </Field>
          <Field label="Short description (optional)">
            <input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="e.g. CV-screening model used in hiring" style={inputStyle} />
          </Field>
          <button onClick={run} style={{ marginTop: 8, width: "100%", padding: 14, fontSize: 15, fontWeight: 600, background: "#4f7cff", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer" }}>
            Run scenario analysis
          </button>
        </div>

        {result && (
          <div id="scenario-result">
            {/* Personal deadline */}
            <div style={{ border: "1px solid rgba(79,124,255,0.3)", borderRadius: 14, padding: 22, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))", marginBottom: 28 }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#4f7cff", marginBottom: 8 }}>Your deadline</p>
              <p style={{ fontSize: 22, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{result.personalDeadline}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>{result.deadlineConfidence}</p>
            </div>

            {/* Scenarios */}
            <h2 style={sectionTitle}>Plausible regulatory futures</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {result.scenarios.map((sc) => (
                <div key={sc.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 8, flexWrap: "wrap" }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{sc.label}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 9px", borderRadius: 5, background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.6)", whiteSpace: "nowrap" }}>{LIKELIHOOD_LABEL[sc.likelihood]}</span>
                  </div>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Trigger · </strong>{sc.trigger}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)", marginBottom: 8 }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Deadline · </strong>{sc.deadline} — {sc.deadlineNote}</p>
                  <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.6)" }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Exposure · </strong>{sc.exposure}</p>
                </div>
              ))}
            </div>

            {/* Divergences — the differentiator */}
            <h2 style={sectionTitle}>Where the experts diverge</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16, maxWidth: 720 }}>
              The most useful thing isn&apos;t the rule — it&apos;s where interpretations split. These are real, sourced tensions, not generated probabilities.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 32 }}>
              {result.divergences.map((d, i) => (
                <div key={i} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                  <p style={{ fontSize: 14, fontWeight: 600, color: "#fff", marginBottom: 12 }}>{d.question}</p>
                  {d.positions.map((p, j) => (
                    <div key={j} style={{ display: "flex", gap: 10, marginBottom: 8, alignItems: "flex-start" }}>
                      <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 7px", borderRadius: 4, background: `${WEIGHT_COLOR[p.weight]}22`, color: WEIGHT_COLOR[p.weight], whiteSpace: "nowrap", marginTop: 2 }}>{p.weight}</span>
                      <div>
                        <span style={{ fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.85)" }}>{p.stance}</span>
                        <span style={{ fontSize: 12, lineHeight: 1.5, color: "rgba(255,255,255,0.55)", display: "block" }}>{p.basis}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Robust actions */}
            <h2 style={sectionTitle}>Actions robust to every scenario</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16, maxWidth: 720 }}>
              These are worth doing whether the deadline lands in 2026 or 2027 — so you don&apos;t have to bet.
            </p>
            <div style={{ border: "1px solid rgba(52,211,153,0.25)", borderRadius: 12, padding: 18, background: "rgba(52,211,153,0.04)", marginBottom: 32 }}>
              {result.robustActions.map((a, i) => (
                <div key={i} style={{ display: "flex", gap: 10, marginBottom: i === result.robustActions.length - 1 ? 0 : 10 }}>
                  <span style={{ color: "#34d399", fontWeight: 700 }}>✓</span>
                  <span style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.7)" }}>{a}</span>
                </div>
              ))}
            </div>

            {/* Caveat + sources */}
            <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
              <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", marginBottom: 12 }}>{result.caveat}</p>
              <p style={{ fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.4)", marginBottom: 8 }}>Sources</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                {SOURCES.map((s) => (
                  <a key={s.id} href={s.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "#4f7cff", textDecoration: "none", border: "1px solid rgba(79,124,255,0.25)", borderRadius: 6, padding: "3px 8px" }}>{s.label} ↗</a>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 28, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)" }}>
                Want this analysis for a specific system, with an exportable plan?{" "}
                <Link href="/" style={{ color: "#4f7cff", textDecoration: "none" }}>Request contributor access →</Link>
              </p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%", padding: "11px 13px", fontSize: 14, background: "rgba(7,21,37,0.6)",
  border: "1px solid rgba(255,255,255,0.12)", borderRadius: 9, color: "#fff", outline: "none",
};
const sectionTitle: React.CSSProperties = { fontSize: 18, fontWeight: 700, color: "#fff", marginBottom: 12 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <label style={{ display: "block", fontSize: 11, fontWeight: 600, letterSpacing: 1, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}

function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: { v: string; l: string }[] }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} style={{ ...inputStyle, appearance: "none", cursor: "pointer" }}>
      {options.map((o) => <option key={o.v} value={o.v} style={{ background: "#0d1b35" }}>{o.l}</option>)}
    </select>
  );
}
