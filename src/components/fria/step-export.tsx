"use client";

import { FileText, Download, Send, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { riskScore } from "@/lib/utils";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const RISK_COLORS: Record<string, string> = {
  critical: "text-danger",
  high: "text-danger/80",
  medium: "text-gold",
  low: "text-success",
  minimal: "text-text-muted",
};

export function StepExport({ state }: Props) {
  const completionChecks = [
    { label: "Deployment context described", done: !!state.context.deploymentDescription },
    { label: "Affected populations identified", done: state.affectedGroups.length > 0 },
    { label: "Risks assessed", done: state.risks.length > 0 },
    { label: "Mitigation measures defined", done: state.mitigations.length > 0 },
    { label: "Human oversight documented", done: !!state.context.humanOversightMeasures },
  ];

  const completionRate = Math.round(
    (completionChecks.filter((c) => c.done).length / completionChecks.length) * 100
  );

  const overallRisks = state.risks.map((r) => riskScore(r.likelihood, r.severity));
  const highestRisk = overallRisks.includes("critical")
    ? "critical"
    : overallRisks.includes("high")
    ? "high"
    : overallRisks.includes("medium")
    ? "medium"
    : "low";

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

      {/* Completion status */}
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

      {/* Summary stats */}
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

      {/* Export actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors">
          <FileText className="w-5 h-5" />
          <div className="text-left">
            <div className="text-sm font-semibold">Export PDF Report</div>
            <div className="text-xs text-white/70">Structured FRIA document — Art. 27 compliant</div>
          </div>
        </button>

        <button className="flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border text-text rounded-lg hover:border-accent transition-colors">
          <Download className="w-5 h-5 text-text-muted" />
          <div className="text-left">
            <div className="text-sm font-semibold">Export JSON</div>
            <div className="text-xs text-text-muted">Machine-readable format for integrations</div>
          </div>
        </button>
      </div>

      <button className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-surface border border-border text-text-muted rounded-lg hover:border-gold hover:text-gold transition-colors">
        <Send className="w-5 h-5" />
        <div className="text-left">
          <div className="text-sm font-semibold">Notify Market Surveillance Authority</div>
          <div className="text-xs">Art. 27(1) — Submit FRIA results to competent national authority</div>
        </div>
      </button>
    </div>
  );
}
