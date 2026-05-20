"use client";

import { useState } from "react";
import { FileText, Download, Send, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { riskScore } from "@/lib/utils";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
  friaId?: string | null;
}

const RISK_COLORS: Record<string, string> = {
  critical: "text-danger",
  high:     "text-danger/80",
  medium:   "text-gold",
  low:      "text-success",
  minimal:  "text-text-muted",
};

export function StepExport({ state, friaId }: Props) {
  const [pdfLoading, setPdfLoading]   = useState(false);
  const [jsonLoading, setJsonLoading] = useState(false);
  const [error, setError]             = useState<string | null>(null);
  const [finalizing, setFinalizing]   = useState(false);
  const [friaStatus, setFriaStatus]   = useState<string | null>(null);

  async function finalize(targetStatus: "in_review" | "published") {
    if (!friaId) { setError("Save the draft first before finalising."); return; }
    setFinalizing(true);
    setError(null);
    try {
      const res = await fetch(`/api/fria/assessments/${friaId}/finalize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetStatus }),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.error ?? `Finalisation failed (${res.status})`);
      }
      const data = await res.json();
      setFriaStatus(data.status);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Finalisation failed");
    } finally {
      setFinalizing(false);
    }
  }

  const completionChecks = [
    { label: "Deployment context described",  done: !!state.context.deploymentDescription },
    { label: "Affected populations identified", done: state.affectedGroups.length > 0 },
    { label: "Risks assessed",                done: state.risks.length > 0 },
    { label: "Mitigation measures defined",   done: state.mitigations.length > 0 },
    { label: "Human oversight documented",    done: !!state.context.humanOversightMeasures },
  ];

  const completionRate = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
  );

  const overallRisks = state.risks.map((r) => riskScore(r.likelihood, r.severity));
  const highestRisk = overallRisks.includes("critical") ? "critical"
    : overallRisks.includes("high")   ? "high"
    : overallRisks.includes("medium") ? "medium"
    : "low";

  async function doExport(format: "pdf" | "json") {
    setError(null);
    format === "pdf" ? setPdfLoading(true) : setJsonLoading(true);

    try {
      const res = await fetch("/api/fria/export", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          state,
          systemName: "AI System",
          orgName:    "Organisation",
          format,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error ?? `Export failed (${res.status})`);
      }

      const blob = await res.blob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `fria-export-${Date.now()}.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      format === "pdf" ? setPdfLoading(false) : setJsonLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Assessment Summary & Export
        </h2>
        <p className="text-sm text-text-muted">
          Review your FRIA assessment before generating the final report.
          Exports are structured for Article 27 compliance and authority notification.
        </p>
      </div>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 bg-danger/10 border border-danger/30 rounded-lg text-sm text-danger">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="bg-surface border border-border rounded-lg p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">Completion Status</h3>
          <span className={cn(
            "text-sm font-bold",
            completionRate === 100 ? "text-success" : completionRate >= 60 ? "text-gold" : "text-danger"
          )}>
            {completionRate}%
          </span>
        </div>
        <div className="h-2 bg-surface-2 rounded-full overflow-hidden mb-4">
          <div
            className={cn(
              "h-full rounded-full transition-all duration-500",
              completionRate === 100 ? "bg-success" : completionRate >= 60 ? "bg-gold" : "bg-danger"
            )}
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <div className="space-y-2">
          {completionChecks.map((check) => (
            <div key={check.label} className="flex items-center gap-2">
              <CheckCircle className={cn("w-4 h-4", check.done ? "text-success" : "text-text-dim/30")} />
              <span className={cn("text-sm", check.done ? "text-text" : "text-text-dim")}>
                {check.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-display)]">
            {state.affectedGroups.length}
          </div>
          <div className="text-xs text-text-dim mt-1">Affected Groups</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-display)]">
            {state.risks.length}
          </div>
          <div className="text-xs text-text-dim mt-1">Risks Identified</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className="text-2xl font-bold font-[family-name:var(--font-display)]">
            {state.mitigations.length}
          </div>
          <div className="text-xs text-text-dim mt-1">Mitigations</div>
        </div>
        <div className="bg-surface border border-border rounded-lg p-4 text-center">
          <div className={cn("text-2xl font-bold font-[family-name:var(--font-display)] uppercase", RISK_COLORS[highestRisk])}>
            {highestRisk}
          </div>
          <div className="text-xs text-text-dim mt-1">Overall Risk</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => doExport("pdf")}
          disabled={pdfLoading}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {pdfLoading
            ? <Loader2 className="w-5 h-5 animate-spin" />
            : <FileText className="w-5 h-5" />
          }
          <div className="text-left">
            <div className="text-sm font-semibold">
              {pdfLoading ? "Generating PDF…" : "Export PDF Report"}
            </div>
            <div className="text-xs text-white/70">Structured FRIA document — Art. 27 compliant</div>
          </div>
        </button>

        <button
          onClick={() => doExport("json")}
          disabled={jsonLoading}
          className="flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border text-text rounded-lg hover:border-accent disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
        >
          {jsonLoading
            ? <Loader2 className="w-5 h-5 animate-spin text-text-muted" />
            : <Download className="w-5 h-5 text-text-muted" />
          }
          <div className="text-left">
            <div className="text-sm font-semibold">
              {jsonLoading ? "Exporting…" : "Export JSON"}
            </div>
            <div className="text-xs text-text-muted">Machine-readable format for integrations</div>
          </div>
        </button>
      </div>

      <div className="border border-border rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-text">Finalise assessment</div>
            <div className="text-xs text-text-muted">Normalise risks &amp; mitigations into the record and lock the version</div>
          </div>
          {friaStatus && (
            <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-accent/10 text-accent">
              {friaStatus.replace(/_/g, " ")}
            </span>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            onClick={() => finalize("in_review")}
            disabled={finalizing || !friaId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-surface border border-border text-text rounded-lg hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            {finalizing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
            Submit for review
          </button>
          <button
            onClick={() => finalize("published")}
            disabled={finalizing || !friaId}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-accent text-white rounded-lg hover:bg-accent/90 disabled:opacity-40 disabled:cursor-not-allowed transition-colors text-sm font-medium"
          >
            <Send className="w-4 h-4" />
            Publish FRIA
          </button>
        </div>
        {!friaId && <p className="text-[11px] text-text-dim">Draft must be saved before it can be finalised.</p>}
      </div>
    </div>
  );
}
