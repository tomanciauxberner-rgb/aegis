"use client";

import { useState } from "react";
import { Plus, Minus, GitCommitHorizontal, ArrowRight, Clock } from "lucide-react";
import {
  AI_ACT_VERSIONS,
  AI_ACT_CHANGES,
  VERSION_DIFF_DISCLAIMER,
  type ChangeKind,
  type ChangeStatus,
  type RegulatoryChange,
} from "@/lib/compliance-bridge/version-diff-data";

const KIND_META: Record<ChangeKind, { color: string; symbol: string; label: string }> = {
  added:    { color: "#34d399", symbol: "+", label: "Added" },
  removed:  { color: "#ff5c5c", symbol: "−", label: "Removed" },
  modified: { color: "#e8b84b", symbol: "~", label: "Modified" },
};

const STATUS_META: Record<ChangeStatus, { color: string; label: string }> = {
  in_force:              { color: "#34d399", label: "In force" },
  provisional_agreement: { color: "#e8b84b", label: "Provisional agreement" },
  proposed:              { color: "rgba(255,255,255,0.4)", label: "Proposed" },
};

function fmtDate(iso: string): string {
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
}

function ChangeRow({ change }: { change: RegulatoryChange }) {
  const [open, setOpen] = useState(false);
  const km = KIND_META[change.kind];
  const sm = STATUS_META[change.status];

  return (
    <div style={{ borderLeft: `3px solid ${km.color}`, background: `${km.color}08`, borderRadius: "0 10px 10px 0", overflow: "hidden", marginBottom: 8 }}>
      <div onClick={() => setOpen((v) => !v)} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", cursor: "pointer" }}>
        <span style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 700, fontSize: 18, color: km.color, width: 16, textAlign: "center", flexShrink: 0 }}>
          {km.symbol}
        </span>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color: km.color }}>{change.article}</span>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0" }}>{change.title}</span>
          </div>
        </div>
        <span style={{ fontSize: 9, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", padding: "3px 8px", borderRadius: 4, background: `${sm.color}18`, color: sm.color, border: `1px solid ${sm.color}33`, flexShrink: 0, display: "flex", alignItems: "center", gap: 4 }}>
          {change.status === "provisional_agreement" && <Clock size={9} />}
          {sm.label}
        </span>
      </div>

      {open && (
        <div style={{ padding: "0 16px 14px 44px" }}>
          {change.before !== null && (
            <div style={{ display: "flex", gap: 8, marginBottom: 6, fontSize: 12, lineHeight: 1.5 }}>
              <Minus size={13} style={{ color: "#ff5c5c", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "rgba(255,255,255,0.5)", textDecoration: change.kind === "modified" ? "line-through" : "none", textDecorationColor: "rgba(255,92,92,0.4)" }}>{change.before}</span>
            </div>
          )}
          {change.after !== null && (
            <div style={{ display: "flex", gap: 8, marginBottom: 10, fontSize: 12, lineHeight: 1.5 }}>
              <Plus size={13} style={{ color: "#34d399", flexShrink: 0, marginTop: 2 }} />
              <span style={{ color: "#e8eaf0" }}>{change.after}</span>
            </div>
          )}
          <div style={{ padding: "8px 12px", background: "rgba(79,124,255,0.06)", border: "1px solid rgba(79,124,255,0.15)", borderRadius: 8 }}>
            <span style={{ fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#4f7cff" }}>Impact</span>
            <p style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.5, margin: "4px 0 0" }}>{change.impact}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export function VersionDiff() {
  const counts = {
    added: AI_ACT_CHANGES.filter((c) => c.kind === "added").length,
    removed: AI_ACT_CHANGES.filter((c) => c.kind === "removed").length,
    modified: AI_ACT_CHANGES.filter((c) => c.kind === "modified").length,
  };

  return (
    <div>
      {/* Version header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 20 }}>
        <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{AI_ACT_VERSIONS.from.label}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>{fmtDate(AI_ACT_VERSIONS.from.date)}</p>
        </div>
        <ArrowRight size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "12px 16px", borderRadius: 10, border: "1px solid rgba(232,184,75,0.3)", background: "rgba(232,184,75,0.05)" }}>
          <p style={{ fontSize: 13, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{AI_ACT_VERSIONS.to.label}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>{fmtDate(AI_ACT_VERSIONS.to.date)}</p>
        </div>
      </div>

      {/* Change counts — git-style */}
      <div style={{ display: "flex", gap: 16, marginBottom: 20, alignItems: "center" }}>
        <GitCommitHorizontal size={16} style={{ color: "rgba(255,255,255,0.4)" }} />
        {(["added", "modified", "removed"] as ChangeKind[]).map((k) => (
          <div key={k} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ fontFamily: "var(--font-mono), monospace", fontWeight: 700, fontSize: 15, color: KIND_META[k].color }}>
              {KIND_META[k].symbol}{counts[k]}
            </span>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", fontFamily: "var(--font-mono), monospace" }}>{KIND_META[k].label.toLowerCase()}</span>
          </div>
        ))}
      </div>

      {/* Changes */}
      <div style={{ marginBottom: 20 }}>
        {AI_ACT_CHANGES.map((c) => <ChangeRow key={c.id} change={c} />)}
      </div>

      <p style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", lineHeight: 1.55, fontStyle: "italic", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: 14 }}>
        {VERSION_DIFF_DISCLAIMER}
      </p>
    </div>
  );
}
