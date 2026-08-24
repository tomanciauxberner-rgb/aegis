import { Shield, Cpu, FileCheck, AlertTriangle, Radio, Zap, ArrowRight, Scale, Network, Upload, Settings } from "lucide-react";
import Link from "next/link";
import { sql } from "drizzle-orm";
import { createClient } from "@/lib/supabase/server";
import { db } from "@/db/client";

async function getAlertStats() {
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("convergence_alerts")
      .select("severity")
      .eq("is_active", true);
    if (!data) return { critical: 0, elevated: 0, watch: 0, total: 0 };
    return {
      critical: data.filter((a) => a.severity === "critical").length,
      elevated: data.filter((a) => a.severity === "elevated").length,
      watch: data.filter((a) => a.severity === "watch").length,
      total: data.length,
    };
  } catch {
    return { critical: 0, elevated: 0, watch: 0, total: 0 };
  }
}

type GraphStats = {
  highRisk: number;
  withFria: number;
  gap: number;
  coverageRate: number | null;
  divergingTopics: number;
  positions: number;
  countries: number;
  ok: boolean;
};

async function getGraphStats(): Promise<GraphStats> {
  const empty: GraphStats = {
    highRisk: 0, withFria: 0, gap: 0, coverageRate: null,
    divergingTopics: 0, positions: 0, countries: 0, ok: false,
  };
  try {
    const coverageRows = await db.execute(sql`
      SELECT
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited'))::int AS high_risk,
        COUNT(*) FILTER (WHERE risk_tier IN ('high_risk','prohibited') AND fria_known = TRUE)::int AS with_fria
      FROM rg_systems
    `);
    const c = (coverageRows as unknown as Array<Record<string, unknown>>)[0] ?? {};
    const highRisk = Number(c.high_risk ?? 0);
    const withFria = Number(c.with_fria ?? 0);

    const countryRows = await db.execute(sql`
      SELECT COUNT(DISTINCT c.country)::int AS n
      FROM rg_systems s
      CROSS JOIN LATERAL jsonb_array_elements_text(s.countries) AS c(country)
      WHERE s.risk_tier IN ('high_risk','prohibited')
    `);
    const countries = Number(
      ((countryRows as unknown as Array<Record<string, unknown>>)[0] ?? {}).n ?? 0,
    );

    const positionRows = await db.execute(sql`
      SELECT topic, COUNT(DISTINCT authority)::int AS authorities, COUNT(*)::int AS positions
      FROM rg_positions
      GROUP BY topic
    `);
    const topics = positionRows as unknown as Array<Record<string, unknown>>;
    const divergingTopics = topics.filter((t) => Number(t.authorities ?? 0) >= 2).length;
    const positions = topics.reduce((acc, t) => acc + Number(t.positions ?? 0), 0);

    return {
      highRisk,
      withFria,
      gap: highRisk - withFria,
      coverageRate: highRisk > 0 ? Math.round((withFria / highRisk) * 100) : null,
      divergingTopics,
      positions,
      countries,
      ok: true,
    };
  } catch (e) {
    console.error("[overview/graph-stats]", e);
    return empty;
  }
}

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

const PANEL = { background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 14 } as const;
const LABEL = {
  fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#4a7fa5",
  textTransform: "uppercase" as const, marginBottom: 16, fontFamily: "var(--font-mono)",
};

export default async function OverviewPage() {
  const [alerts, graph] = await Promise.all([getAlertStats(), getGraphStats()]);
  const daysLeft = daysUntil("2027-12-02");

  return (
    <div className="space-y-8">

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#e8eaf0", marginBottom: 6 }}>
          Overview
        </h1>
        <p style={{ fontSize: 15, color: "#8ba8c8" }}>
          The evidence layer for European AI governance
        </p>
      </div>

      {graph.ok && graph.highRisk > 0 && (
        <div>
          <p style={LABEL}>What the Rights Graph measures</p>

          <Link href="/rights-graph/fria-gap" className="block group" style={{ textDecoration: "none" }}>
            <div style={{ ...PANEL, padding: "28px 28px", marginBottom: 16 }} className="hover:border-border-accent transition-colors">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,92,92,0.12)", border: "1px solid rgba(255,92,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Network className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", letterSpacing: "0.05em" }}>FRIA COVERAGE GAP</p>
                    <p style={{ fontSize: 12, color: "#4a7fa5" }}>
                      Verified high-risk systems across {graph.countries} {graph.countries === 1 ? "jurisdiction" : "jurisdictions"}
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-danger transition-colors" />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <GraphStat value={graph.highRisk} label="High-risk / prohibited systems mapped" color="#e8eaf0" />
                <GraphStat value={graph.withFria} label="With a FRIA known to exist" color="#5ce8a0" />
                <GraphStat value={graph.gap} label="No publicly known FRIA" color="#ff5c5c" />
                <GraphStat
                  value={graph.coverageRate === null ? "—" : `${graph.coverageRate}%`}
                  label="Known coverage rate"
                  color={graph.coverageRate === 0 ? "#ff5c5c" : "#e8b84b"}
                />
              </div>

              <p style={{ fontSize: 13, color: "#4a7fa5", lineHeight: 1.6, marginTop: 18 }}>
                Measured across the systems currently verified in the graph, each one sourced.
                &ldquo;No publicly known FRIA&rdquo; means none was found in the public record, not that none exists.
              </p>
            </div>
          </Link>

          <Link href="/rights-graph/divergence" className="block group" style={{ textDecoration: "none" }}>
            <div style={{ ...PANEL, padding: "24px 28px" }} className="hover:border-border-accent transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(160,124,255,0.12)", border: "1px solid rgba(160,124,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Scale className="w-5 h-5" style={{ color: "#a07cff" }} />
                  </div>
                  <div>
                    <p style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", marginBottom: 4 }}>
                      {graph.divergingTopics} {graph.divergingTopics === 1 ? "question" : "questions"} where Europe&apos;s regulators diverge
                    </p>
                    <p style={{ fontSize: 14, color: "#4a7fa5" }}>
                      {graph.positions} sourced positions — Commission, EDPB, EDPS, AI Office, national authorities
                    </p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-accent transition-colors flex-shrink-0" />
              </div>
            </div>
          </Link>
        </div>
      )}

      <div>
        <p style={LABEL}>Regulatory watch</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

          <Link href="/signals" className="block group" style={{ textDecoration: "none" }}>
            <div style={{ ...PANEL, padding: "24px 28px", transition: "border-color 0.2s" }} className="hover:border-danger/60">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,92,92,0.12)", border: "1px solid rgba(255,92,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <Zap className="w-5 h-5 text-danger" />
                  </div>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", letterSpacing: "0.05em" }}>EARLY WARNING</p>
                    <p style={{ fontSize: 12, color: "#4a7fa5" }}>Signal intelligence · EU27</p>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-text-dim group-hover:text-danger transition-colors" />
              </div>

              <div className="flex items-end gap-3 mb-4">
                <span style={{ fontSize: 52, fontWeight: 700, color: alerts.total > 0 ? "#e8eaf0" : "#4a7fa5", lineHeight: 1 }}>{alerts.total}</span>
                <span style={{ fontSize: 15, color: "#8ba8c8", marginBottom: 8 }}>active signals</span>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                <span style={{ padding: "4px 10px", background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#ff5c5c" }}>
                  {alerts.critical} critical
                </span>
                <span style={{ padding: "4px 10px", background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#e8b84b" }}>
                  {alerts.elevated} elevated
                </span>
                <span style={{ padding: "4px 10px", background: "rgba(79,124,255,0.1)", border: "1px solid rgba(79,124,255,0.3)", borderRadius: 6, fontSize: 12, fontWeight: 700, color: "#4f7cff" }}>
                  {alerts.watch} watch
                </span>
              </div>
            </div>
          </Link>

          <div style={{ ...PANEL, padding: "24px 28px" }}>
            <div className="flex items-center gap-3 mb-5">
              <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <AlertTriangle className="w-5 h-5" style={{ color: "#e8b84b" }} />
              </div>
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", letterSpacing: "0.05em" }}>FRIA DEADLINE</p>
                <p style={{ fontSize: 12, color: "#4a7fa5" }}>EU AI Act Article 27</p>
              </div>
            </div>

            <div className="flex items-end gap-3 mb-4">
              <span style={{ fontSize: 52, fontWeight: 700, color: daysLeft < 60 ? "#ff5c5c" : "#e8b84b", lineHeight: 1 }}>{daysLeft}</span>
              <span style={{ fontSize: 15, color: "#8ba8c8", marginBottom: 8 }}>days remaining</span>
            </div>

            <p style={{ fontSize: 13, color: "#4a7fa5", lineHeight: 1.6 }}>
              2 December 2027 — Annex III deployer obligations apply, including the Article 27 FRIA
              for public bodies, private providers of public services, and deployers of credit and
              insurance systems under Annex III(5)(b)–(c). Deferred by Regulation (EU) 2026/1744.
              Pre-existing systems used by public authorities: 2 August 2030.
              Non-compliance: up to €15M or 3% global turnover.
            </p>
          </div>
        </div>
      </div>

      <div>
        <p style={LABEL}>Your workspace</p>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { label: "AI Systems", value: "0", icon: Cpu, color: "#4f7cff", bg: "rgba(79,124,255,0.1)", border: "rgba(79,124,255,0.2)", href: "/systems" },
            { label: "FRIA Required", value: "0", icon: AlertTriangle, color: "#e8b84b", bg: "rgba(232,184,75,0.1)", border: "rgba(232,184,75,0.2)", href: "/systems" },
            { label: "Assessments", value: "0", icon: FileCheck, color: "#5ce8a0", bg: "rgba(92,232,160,0.1)", border: "rgba(92,232,160,0.2)", href: "/assessments" },
            { label: "Compliance Score", value: "—", icon: Shield, color: "#a07cff", bg: "rgba(160,124,255,0.1)", border: "rgba(160,124,255,0.2)", href: "/assessments" },
            { label: "Data Ingestion", value: "→", icon: Settings, color: "#8ba8c8", bg: "rgba(139,168,200,0.1)", border: "rgba(139,168,200,0.2)", href: "/settings" },
          ].map((stat) => (
            <Link key={stat.label} href={stat.href} style={{ textDecoration: "none" }}>
              <div style={{ background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 12, padding: "20px 20px" }} className="hover:border-border-accent transition-colors">
                <div className="flex items-center justify-between mb-4">
                  <span style={{ fontSize: 11, fontWeight: 600, color: "#4a7fa5", letterSpacing: "0.12em", textTransform: "uppercase", fontFamily: "var(--font-mono)" }}>
                    {stat.label}
                  </span>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: stat.bg, border: `1px solid ${stat.border}`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <stat.icon style={{ width: 15, height: 15, color: stat.color }} />
                  </div>
                </div>
                <div style={{ fontSize: 32, fontWeight: 700, color: "#e8eaf0" }}>{stat.value}</div>
              </div>
            </Link>
          ))}
        </div>
        <p style={{ fontSize: 12, color: "#4a7fa5", marginTop: 12, lineHeight: 1.6 }}>
          Your own registered systems and assessments — separate from the public Rights Graph above.
        </p>
      </div>

      <div
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-5"
        style={{ ...PANEL, padding: "32px 28px" }}
      >
        <div className="flex items-center gap-4">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(79,124,255,0.12)", border: "1px solid rgba(79,124,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Radio className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", marginBottom: 4 }}>Add a system to the graph</p>
            <p style={{ fontSize: 14, color: "#4a7fa5" }}>
              Every sourced system sharpens the only public measurement of Europe&apos;s FRIA gap.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Link href="/settings" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", background: "transparent", border: "1px solid #1e3a5f", borderRadius: 8, color: "#8ba8c8", fontSize: 14, fontWeight: 500 }}>
              <Upload style={{ width: 15, height: 15 }} /> Ingest a document
            </div>
          </Link>
          <Link href="/systems" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 18px", background: "transparent", border: "1px solid #1e3a5f", borderRadius: 8, color: "#8ba8c8", fontSize: 14, fontWeight: 500 }}>
              Register a system
            </div>
          </Link>
          <Link href="/rights-graph/fria-gap" style={{ textDecoration: "none" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 20px", background: "#4f7cff", borderRadius: 8, color: "#ffffff", fontSize: 14, fontWeight: 500 }}>
              See the gap <ArrowRight style={{ width: 16, height: 16 }} />
            </div>
          </Link>
        </div>
      </div>

    </div>
  );
}

function GraphStat({ value, label, color }: { value: number | string; label: string; color: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
