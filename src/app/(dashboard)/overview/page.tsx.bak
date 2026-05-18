import { Shield, Cpu, FileCheck, AlertTriangle, Radio, Zap, ArrowRight } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

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

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default async function OverviewPage() {
  const alerts = await getAlertStats();
  const daysLeft = daysUntil("2026-08-02");

  return (
    <div className="space-y-8">

      <div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: "#e8eaf0", marginBottom: 6 }}>
          Overview
        </h1>
        <p style={{ fontSize: 15, color: "#8ba8c8" }}>
          Fundamental rights intelligence · EU AI Act compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        <Link href="/signals" className="block group" style={{ textDecoration: "none" }}>
          <div style={{
            background: "#0f2040",
            border: "1px solid #1e3a5f",
            borderRadius: 14,
            padding: "24px 28px",
            transition: "border-color 0.2s",
          }}
            className="hover:border-danger/60"
          >
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
              <span style={{ fontSize: 52, fontWeight: 700, color: "#ff5c5c", lineHeight: 1 }}>{alerts.critical}</span>
              <span style={{ fontSize: 15, color: "#8ba8c8", marginBottom: 8 }}>critical alerts</span>
            </div>

            <div className="flex items-center gap-3">
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

        <div style={{
          background: "#0f2040",
          border: "1px solid #1e3a5f",
          borderRadius: 14,
          padding: "24px 28px",
        }}>
          <div className="flex items-center gap-3 mb-5">
            <div style={{ width: 40, height: 40, borderRadius: 10, background: "rgba(255,92,92,0.12)", border: "1px solid rgba(255,92,92,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <AlertTriangle className="w-5 h-5 text-danger" />
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
            August 2, 2026 — All Annex III high-risk AI systems require a completed FRIA.
            Non-compliance: up to €15M or 3% global turnover.
          </p>
        </div>
      </div>

      <div>
        <p style={{ fontSize: 13, fontWeight: 600, letterSpacing: "0.1em", color: "#4a7fa5", textTransform: "uppercase", marginBottom: 16, fontFamily: "var(--font-mono)" }}>
          Compliance Dashboard
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "AI Systems", value: "0", icon: Cpu, color: "#4f7cff", bg: "rgba(79,124,255,0.1)", border: "rgba(79,124,255,0.2)", href: "/systems" },
            { label: "FRIA Required", value: "0", icon: AlertTriangle, color: "#e8b84b", bg: "rgba(232,184,75,0.1)", border: "rgba(232,184,75,0.2)", href: "/systems" },
            { label: "Assessments", value: "0", icon: FileCheck, color: "#5ce8a0", bg: "rgba(92,232,160,0.1)", border: "rgba(92,232,160,0.2)", href: "/assessments" },
            { label: "Compliance Score", value: "—", icon: Shield, color: "#a07cff", bg: "rgba(160,124,255,0.1)", border: "rgba(160,124,255,0.2)", href: "/assessments" },
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
      </div>

      <div style={{ background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 14, padding: "32px 36px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 24 }}>
        <div className="flex items-center gap-4">
          <div style={{ width: 48, height: 48, borderRadius: 12, background: "rgba(79,124,255,0.12)", border: "1px solid rgba(79,124,255,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Cpu className="w-6 h-6 text-accent" />
          </div>
          <div>
            <p style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", marginBottom: 4 }}>Register your AI systems</p>
            <p style={{ fontSize: 14, color: "#4a7fa5" }}>Aegis identifies which systems require a FRIA under EU AI Act Article 27.</p>
          </div>
        </div>
        <Link href="/systems" style={{ textDecoration: "none", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#4f7cff", borderRadius: 8, color: "#ffffff", fontSize: 14, fontWeight: 500, whiteSpace: "nowrap" }}>
            Get started <ArrowRight style={{ width: 16, height: 16 }} />
          </div>
        </Link>
      </div>

    </div>
  );
}
