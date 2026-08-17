"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { RadarMap, type RadarCountryState } from "@/components/code-radar/radar-map";

interface SourceTotals {
  hosts: number;
  repositories: number;
  owners: number;
}
interface HostStat {
  name: string;
  kind: string | null;
  repositories: number;
  owners: number;
}
interface RadarSourceItem {
  id: string;
  country: string;
  label: string;
  kind: string;
  enabled: boolean;
  note: string;
  latest: {
    captured_at: string;
    status: string;
    fetched_via: string | null;
    totals: SourceTotals | null;
  } | null;
  last_ok: {
    captured_at: string;
    totals: SourceTotals | null;
    hosts: HostStat[];
  } | null;
}
interface RadarResponse {
  sources: RadarSourceItem[];
  generated_at: string;
}

const EU27 = new Set([
  "AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR",
  "DE","GR","HU","IE","IT","LV","LT","LU","MT","NL",
  "PL","PT","RO","SK","SI","ES","SE",
]);

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}
function fmtDate(iso: string): string {
  return new Date(iso).toISOString().slice(0, 10);
}

export default function CodeRadarPage() {
  const [data, setData] = useState<RadarResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/code-radar")
      .then((r) => (r.ok ? r.json() : Promise.reject(r)))
      .then((d: RadarResponse) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  const sources = data?.sources ?? [];
  const live = sources.filter((s) => s.enabled && s.last_ok);
  const declared = sources.filter((s) => !s.enabled);
  const liveEu = live.filter((s) => EU27.has(s.country));
  const ch = sources.find((s) => s.id === "ch_github_swiss");

  const totalRepos = live.reduce((sum, s) => sum + (s.last_ok?.totals?.repositories ?? 0), 0);
  const totalOwners = live.reduce((sum, s) => sum + (s.last_ok?.totals?.owners ?? 0), 0);

  const states: Record<string, RadarCountryState> = {};
  for (const s of sources) {
    if (!EU27.has(s.country)) continue;
    if (s.enabled && s.last_ok) {
      states[s.country] = {
        country: s.country,
        mode: "live",
        label: s.label,
        repositories: s.last_ok.totals?.repositories ?? 0,
        owners: s.last_ok.totals?.owners ?? 0,
        capturedAt: s.last_ok.captured_at,
      };
    } else {
      states[s.country] = { country: s.country, mode: "declared", label: s.label, note: s.note };
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 1040, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <Link href="/rights-graph" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Rights Graph</Link>
            <Link href="/ai-act-scenarios" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Scenario Engine</Link>
            <Link href="/roadmap" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Roadmap</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 1040, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 14 }}>Public Code Radar · Beta</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          Who actually publishes public-sector code in Europe — measured, sourced, over time.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 780, marginBottom: 36 }}>
          Open-sourcing government code is no longer a virtue signal — it&apos;s becoming law. Switzerland&apos;s EMBAG makes source-code
          disclosure a statutory obligation for federal software; the EU&apos;s Interoperable Europe Act, applicable since July 2024,
          gives binding priority to open-source solutions across public administrations. This radar tracks who follows through:
          national catalogues polled on a schedule, aggregates snapshotted, every source verified before it lights up. No scraping,
          no estimates — if a number is here, its endpoint answered.
        </p>

        {/* Stats */}
        {!loading && live.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 12, marginBottom: 40 }}>
            <Stat value={fmt(totalRepos)} label="Public repositories tracked" color="#fff" />
            <Stat value={fmt(totalOwners)} label="Public-sector organisations" color="#fff" />
            <Stat value={String(liveEu.length)} label="Live EU27 sources" color="#34d399" />
            <Stat value={ch?.last_ok ? "1" : "0"} label="Non-EU anchor (CH)" color="#34d399" />
            <Stat value={String(declared.length)} label="Declared, pending verification" color="#e8b84b" />
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Polling the radar…</p>
        ) : !data ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>The radar API is unreachable right now. Try again shortly.</p>
          </div>
        ) : (
          <>
            <RadarMap states={states} />

            {/* CH anchor — off-map */}
            {ch && ch.last_ok && (
              <div style={{ marginTop: 14, border: "1px solid rgba(52,211,153,0.25)", borderRadius: 12, padding: "14px 18px", background: "rgba(52,211,153,0.04)", display: "flex", flexWrap: "wrap", alignItems: "baseline", gap: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: "#34d399" }}>🇨🇭 Off-map anchor</span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.7)" }}>
                  Switzerland — {fmt(ch.last_ok.totals?.repositories ?? 0)} public repositories under the Federal Chancellery&apos;s GitHub organisation.
                  Not EU27, but the legal template: EMBAG Art. 9, &quot;public money, public code&quot;, in force since 2024.
                </span>
              </div>
            )}

            {/* Source cards */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "40px 0 12px" }}>Sources, one by one</h2>
            <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 16, maxWidth: 760 }}>
              A source only goes live after its endpoint has been verified — shape-checked, dated, snapshotted. Declared sources are
              the target coverage: identified, not yet trusted.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {sources.map((s) => {
                const isLive = s.enabled && s.last_ok;
                return (
                  <div key={s.id} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 8 }}>
                      <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{s.country} · {s.label}</span>
                      <Tag
                        text={isLive ? "live" : "pending verification"}
                        bg={isLive ? "rgba(52,211,153,0.13)" : "rgba(232,184,75,0.13)"}
                        color={isLive ? "#34d399" : "#e8b84b"}
                      />
                    </div>
                    {isLive && s.last_ok ? (
                      <div style={{ display: "flex", gap: 16, flexWrap: "wrap", fontSize: 12, color: "rgba(255,255,255,0.55)" }}>
                        <span><span style={{ color: "#fff", fontWeight: 700 }}>{fmt(s.last_ok.totals?.repositories ?? 0)}</span> repositories</span>
                        <span><span style={{ color: "#fff", fontWeight: 700 }}>{fmt(s.last_ok.totals?.owners ?? 0)}</span> organisations</span>
                        <span>{s.last_ok.totals?.hosts ?? 0} forge{(s.last_ok.totals?.hosts ?? 0) !== 1 ? "s" : ""}</span>
                        <span>snapshot {fmtDate(s.last_ok.captured_at)}</span>
                        {s.latest?.fetched_via && <span>via {s.latest.fetched_via}</span>}
                      </div>
                    ) : (
                      <p style={{ fontSize: 12, lineHeight: 1.55, color: "rgba(255,255,255,0.55)" }}>{s.note}</p>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Legal layer */}
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: "40px 0 12px" }}>Why this is a compliance story, not a culture story</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 12, marginBottom: 32 }}>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#4f7cff", marginBottom: 8 }}>Switzerland — EMBAG Art. 9</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
                  Federal authorities are legally obliged to disclose the source code of software developed by or for them, unless
                  third-party rights or security reasons prevent it. Public money, public code — as statute, not slogan.{" "}
                  <a href="https://github.com/swiss" target="_blank" rel="noopener noreferrer" style={{ color: "#4f7cff", textDecoration: "none" }}>The result ↗</a>
                </p>
              </div>
              <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
                <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", color: "#4f7cff", marginBottom: 8 }}>EU — Interoperable Europe Act</p>
                <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
                  Regulation (EU) 2024/903, applicable since July 2024, turns public-sector interoperability from voluntary
                  cooperation into binding law — with explicit priority for open-source solutions and shared reuse.{" "}
                  <a href="https://eur-lex.europa.eu/eli/reg/2024/903/oj" target="_blank" rel="noopener noreferrer" style={{ color: "#4f7cff", textDecoration: "none" }}>EUR-Lex ↗</a>
                </p>
              </div>
            </div>

            {/* CTA — the reference layer */}
            <div style={{ padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))" }}>
              <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>The open reference layer</p>
              <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
                Once everyone is required to open their code, the question shifts: who maintains the references everyone else builds
                on? AEGIS publishes its own reference layers in the open — starting with the ISO/IEC 42001 × EU AI Act crosswalk:
                machine-readable, schema-validated, CC BY 4.0, corrections welcome with primary sources.
              </p>
              <a
                href="https://github.com/Thinklanceai/ai-act-iso42001-crosswalk"
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}
              >
                Open the crosswalk dataset →
              </a>
            </div>

            <p style={{ marginTop: 24, fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.6 }}>
              Snapshots refresh weekly. Aggregates come straight from each national catalogue&apos;s own API — the radar stores
              counts and provenance, never mirrors of the code. Not legal advice.
            </p>
          </>
        )}
      </main>
    </div>
  );
}

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
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
