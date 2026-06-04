"use client";

import { ArrowRight, TrendingDown, TrendingUp, Minus, FileText, ShieldCheck } from "lucide-react";
import { diffFriaSnapshots, type FriaStudioSnapshot, type FriaDiff } from "@/lib/fria-studio/diff-engine";
import { getAllRisks } from "@/lib/fria-studio/lifecycle-risks";

interface FriaDiffViewProps {
  from: FriaStudioSnapshot;
  to: FriaStudioSnapshot;
}

const riskLabelMap: Record<string, string> = Object.fromEntries(
  getAllRisks().map((r) => [r.code, r.label]),
);

function directionIcon(direction: "improved" | "regressed" | "unchanged", size = 13) {
  if (direction === "improved") return <TrendingDown size={size} style={{ color: "#34d399" }} />;
  if (direction === "regressed") return <TrendingUp size={size} style={{ color: "#ef4444" }} />;
  return <Minus size={size} style={{ color: "rgba(255,255,255,0.3)" }} />;
}

function fmtDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch {
    return iso;
  }
}

function StatCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{
      padding: "12px 16px",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 10,
      background: "rgba(255,255,255,0.02)",
      flex: 1,
      minWidth: 110,
    }}>
      <p style={{ fontSize: 20, fontFamily: "var(--font-mono), monospace", fontWeight: 700, color, margin: 0, lineHeight: 1 }}>
        {value}
      </p>
      <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "4px 0 0", textTransform: "uppercase", letterSpacing: "0.1em", fontFamily: "var(--font-mono), monospace" }}>
        {label}
      </p>
    </div>
  );
}

export function FriaDiffView({ from, to }: FriaDiffViewProps) {
  const diff: FriaDiff = diffFriaSnapshots(from, to);
  const netImproved = diff.summary.netExposureDelta < 0;

  const statusChanges = diff.riskChanges.filter((c) => c.field === "controlStatus");
  const confidenceChanges = diff.riskChanges.filter((c) => c.field === "confidence");

  return (
    <div>
      {/* Version header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <div style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{diff.fromLabel}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>{fmtDate(diff.fromDate)}</p>
        </div>
        <ArrowRight size={16} style={{ color: "rgba(255,255,255,0.3)", flexShrink: 0 }} />
        <div style={{ flex: 1, padding: "10px 14px", border: "1px solid rgba(79,124,255,0.3)", borderRadius: 8, background: "rgba(79,124,255,0.05)" }}>
          <p style={{ fontSize: 12, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>{diff.toLabel}</p>
          <p style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", margin: "2px 0 0", fontFamily: "var(--font-mono), monospace" }}>{fmtDate(diff.toDate)}</p>
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap" }}>
        <StatCard label="Controls improved" value={String(diff.summary.risksImproved)} color="#34d399" />
        <StatCard label="Controls regressed" value={String(diff.summary.risksRegressed)} color="#ef4444" />
        <StatCard label="Evidence added" value={`+${diff.summary.evidenceAdded}`} color="#4f7cff" />
        <StatCard
          label="Net exposure"
          value={`${diff.summary.netExposureDelta > 0 ? "+" : ""}${Math.round(diff.summary.netExposureDelta * 100)}%`}
          color={netImproved ? "#34d399" : diff.summary.netExposureDelta === 0 ? "rgba(255,255,255,0.5)" : "#ef4444"}
        />
      </div>

      {netImproved && diff.summary.netExposureDelta <= -0.05 && (
        <div style={{
          marginBottom: 20, padding: "12px 16px",
          background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.2)",
          borderRadius: 10, display: "flex", alignItems: "center", gap: 10,
          fontSize: 13, color: "#34d399",
        }}>
          <ShieldCheck size={15} />
          Residual rights exposure decreased overall between these versions.
        </div>
      )}

      {/* Control status changes */}
      {statusChanges.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Control status changes
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {statusChanges.map((c, i) => (
              <div key={`${c.riskCode}-${i}`} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
              }}>
                {directionIcon(c.direction)}
                <span style={{ flex: 1, fontSize: 13, color: "#e8eaf0" }}>{riskLabelMap[c.riskCode] ?? c.riskCode}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)" }}>{String(c.before)}</span>
                <ArrowRight size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: c.direction === "improved" ? "#34d399" : c.direction === "regressed" ? "#ef4444" : "rgba(255,255,255,0.6)" }}>
                  {String(c.after)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Exposure movement per right */}
      {diff.exposureChanges.length > 0 && (
        <section style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Rights exposure movement
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
            {diff.exposureChanges.map((e) => (
              <div key={e.rightCode} style={{
                display: "flex", alignItems: "center", gap: 12,
                padding: "10px 14px", border: "1px solid rgba(255,255,255,0.06)", borderRadius: 8,
              }}>
                {directionIcon(e.direction)}
                <span style={{ flex: 1, fontSize: 13, color: "#e8eaf0" }}>{e.rightLabel}</span>
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)" }}>
                  {Math.round(e.beforeResidual * 100)}%
                </span>
                <ArrowRight size={11} style={{ color: "rgba(255,255,255,0.25)" }} />
                <span style={{ fontSize: 12, fontFamily: "var(--font-mono), monospace", color: e.direction === "improved" ? "#34d399" : "#ef4444" }}>
                  {Math.round(e.afterResidual * 100)}%
                </span>
                <span style={{
                  fontSize: 10, fontFamily: "var(--font-mono), monospace", fontWeight: 700,
                  color: e.direction === "improved" ? "#34d399" : "#ef4444",
                  minWidth: 44, textAlign: "right",
                }}>
                  {e.delta > 0 ? "+" : ""}{Math.round(e.delta * 100)}pp
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Confidence changes (compact) */}
      {confidenceChanges.length > 0 && (
        <section>
          <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", fontWeight: 700, letterSpacing: "0.15em", textTransform: "uppercase", color: "rgba(255,255,255,0.3)", marginBottom: 10 }}>
            Confidence shifts
          </p>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {confidenceChanges.map((c, i) => (
              <span key={`${c.riskCode}-c-${i}`} style={{
                display: "inline-flex", alignItems: "center", gap: 6,
                fontSize: 11, padding: "5px 10px", borderRadius: 6,
                border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.02)",
                color: "rgba(255,255,255,0.6)",
              }}>
                {riskLabelMap[c.riskCode] ?? c.riskCode}
                <span style={{ color: c.direction === "improved" ? "#34d399" : "#ef4444", fontFamily: "var(--font-mono), monospace" }}>
                  {c.before}% → {c.after}%
                </span>
              </span>
            ))}
          </div>
        </section>
      )}

      {statusChanges.length === 0 && diff.exposureChanges.length === 0 && confidenceChanges.length === 0 && (
        <div style={{
          padding: "24px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13,
          border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 10,
          display: "flex", flexDirection: "column", alignItems: "center", gap: 8,
        }}>
          <FileText size={18} style={{ opacity: 0.5 }} />
          No material differences between these two versions.
        </div>
      )}
    </div>
  );
}
