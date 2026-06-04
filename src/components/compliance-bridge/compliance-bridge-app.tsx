"use client";

import { useState } from "react";
import { Network, GitCompareArrows, History } from "lucide-react";
import { BridgeGraph } from "@/components/compliance-bridge/bridge-graph";
import { ReverseCompliance } from "@/components/compliance-bridge/reverse-compliance";
import { VersionDiff } from "@/components/compliance-bridge/version-diff";
import { alignmentSummary } from "@/lib/compliance-bridge/bridge-engine";

type Tab = "bridge" | "reverse" | "version";

export function ComplianceBridgeApp() {
  const [tab, setTab] = useState<Tab>("bridge");
  const summary = alignmentSummary();

  const TABS: { id: Tab; label: string; icon: typeof Network }[] = [
    { id: "bridge", label: "Smart Bridge", icon: Network },
    { id: "reverse", label: "Reverse Compliance", icon: GitCompareArrows },
    { id: "version", label: "Version Diff", icon: History },
  ];

  return (
    <div>
      {/* Summary strip */}
      <div style={{ display: "flex", gap: 14, marginBottom: 24, flexWrap: "wrap" }}>
        {[
          { label: "Mapped obligations", value: String(summary.total), color: "#4f7cff" },
          { label: "Weighted coverage", value: `${summary.weightedCoveragePct}%`, color: "#34d399" },
          { label: "Gaps", value: String(summary.gap), color: "#ff5c5c" },
        ].map((s) => (
          <div key={s.label} style={{ padding: "12px 18px", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 10, background: "rgba(255,255,255,0.02)", flex: 1, minWidth: 130 }}>
            <p style={{ fontSize: 22, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: s.color, margin: 0, lineHeight: 1 }}>{s.value}</p>
            <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button key={t.id} onClick={() => setTab(t.id)} style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
              fontSize: 13, fontWeight: 600, cursor: "pointer", background: "none", border: "none",
              borderBottom: `2px solid ${active ? "#4f7cff" : "transparent"}`,
              color: active ? "#e8eaf0" : "rgba(255,255,255,0.4)", marginBottom: -1,
            }}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "bridge" && <BridgeGraph />}
      {tab === "reverse" && <ReverseCompliance />}
      {tab === "version" && <VersionDiff />}
    </div>
  );
}
