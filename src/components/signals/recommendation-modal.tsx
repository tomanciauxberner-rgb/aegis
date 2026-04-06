"use client";

import { useState, useEffect } from "react";
import { X, FileText, Download, Loader2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ConvergenceAlert } from "@/types/alerts";
import type { RecommendationDraft } from "@/types/recommendations";

const GROUP_LABELS: Record<string, string> = {
  african_descent: "People of African descent",
  roma: "Roma",
  muslims: "Muslims",
  lgbtiq: "LGBTIQ people",
  women: "Women",
  disabilities: "Persons with disabilities",
  migrants: "Migrants",
  jews: "Jews",
  general: "General population",
};

const SECTOR_LABELS: Record<string, string> = {
  employment: "Employment",
  education: "Education",
  housing: "Housing",
  healthcare: "Healthcare",
  law_enforcement: "Law enforcement",
  essential_services: "Essential services",
  online: "Online",
  justice: "Justice",
};

const SEVERITY_COLORS: Record<string, string> = {
  critical: "text-danger border-danger/40 bg-danger-soft",
  elevated: "text-gold border-gold/40 bg-gold-soft",
  watch: "text-accent border-accent/40 bg-accent-soft",
};

interface Props {
  alert: ConvergenceAlert;
  onClose: () => void;
}

type Step = "generating" | "editing" | "saving" | "done";

export function RecommendationModal({ alert, onClose }: Props) {
  const [step, setStep] = useState<Step>("generating");

  useEffect(() => { generate(); }, []);
  const [error, setError] = useState("");
  const [draft, setDraft] = useState<RecommendationDraft | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  const groupLabel = GROUP_LABELS[alert.group_id] ?? alert.group_id;
  const sectorLabel = SECTOR_LABELS[alert.sector] ?? alert.sector;

  async function generate() {
    setStep("generating");
    setError("");
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "generate",
          alertId: alert.id,
          country: alert.country,
          groupId: alert.group_id,
          sector: alert.sector,
          convergenceScore: alert.convergence_score,
          severity: alert.severity,
          signalDetails: alert.signal_details ?? [],
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setDraft({
        alertId: alert.id,
        country: alert.country,
        groupId: alert.group_id,
        sector: alert.sector,
        convergenceScore: alert.convergence_score,
        severity: alert.severity,
        situation: data.situation,
        evidenceBase: data.evidenceBase,
        euContext: data.euContext,
        refNumber: data.refNumber,
        addressee: "",
        legalBasis: "",
        actionRequested: "",
        deadline: "",
      });
      setStep("editing");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStep("editing");
    }
  }

  async function save() {
    if (!draft) return;
    if (!draft.addressee || !draft.legalBasis || !draft.actionRequested || !draft.deadline) {
      setError("All four fields are required before saving.");
      return;
    }
    setStep("saving");
    setError("");
    try {
      const res = await fetch("/api/recommendations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "save", ...draft }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const saved = await res.json();
      setSavedId(saved.id);
      setStep("done");
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Save failed");
      setStep("editing");
    }
  }

  async function exportPdf() {
    if (!draft) return;
    const { pdf } = await import("@react-pdf/renderer");
    const { RecommendationDocument } = await import("./recommendation-document");
    const blob = await pdf(<RecommendationDocument draft={draft} />).toBlob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${draft.refNumber}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const canExport =
    draft &&
    draft.addressee.trim() &&
    draft.legalBasis.trim() &&
    draft.actionRequested.trim() &&
    draft.deadline.trim();

  if (step === "generating" && !draft) {
    return (
      <ModalShell onClose={onClose}>
        <div className="flex flex-col items-center justify-center py-16 gap-4">
          <Loader2 className="w-8 h-8 text-accent animate-spin" />
          <p className="text-text-muted">Generating intelligence brief…</p>
        </div>
      </ModalShell>
    );
  }

  return (
    <ModalShell onClose={onClose}>
      <div className="flex items-start justify-between mb-6">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <FileText className="w-5 h-5 text-accent" />
            <h2 className="text-lg font-semibold">Intelligence Brief</h2>
          </div>
          <p className="text-sm text-text-muted font-mono">{draft?.refNumber ?? "—"}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className={cn(
            "px-2 py-0.5 rounded text-xs font-bold border uppercase",
            SEVERITY_COLORS[alert.severity]
          )}>
            {alert.severity}
          </span>
          <span className="text-sm font-bold text-text font-mono">{alert.country}</span>
        </div>
      </div>

      <div className="space-y-6">
        <Section label="Context">
          <div className="flex gap-2 flex-wrap mb-3">
            <Tag>{groupLabel}</Tag>
            <Tag>{sectorLabel}</Tag>
            <Tag>{alert.convergence_score}/3 signals</Tag>
          </div>
        </Section>

        <Section label="Situation">
          <p className="text-sm text-text leading-relaxed">
            {draft?.situation ?? <span className="text-text-muted italic">Generating…</span>}
          </p>
        </Section>

        <Section label="Evidence Base">
          <div className="space-y-2">
            {(draft?.evidenceBase ?? []).map((s, i) => (
              <div key={i} className="flex gap-3 p-3 bg-surface-2 rounded-lg">
                <span className="text-base flex-shrink-0">
                  {s.signal_type === "statistical" ? "📊" : s.signal_type === "legislative" ? "⚖️" : "🚨"}
                </span>
                <div>
                  <p className="text-sm font-medium text-text">{s.title}</p>
                  {s.summary && <p className="text-sm text-text-muted mt-0.5">{s.summary}</p>}
                  <div className="flex gap-3 mt-1">
                    {s.delta_pp !== null && (
                      <span className={cn("text-xs font-mono font-bold", s.delta_pp > 0 ? "text-danger" : "text-success")}>
                        {s.delta_pp > 0 ? "+" : ""}{s.delta_pp}pp
                      </span>
                    )}
                    {s.source && <span className="text-xs text-text-dim font-mono">{s.source}{s.year ? ` · ${s.year}` : ""}</span>}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section label="EU Context">
          <p className="text-sm text-text leading-relaxed">
            {draft?.euContext ?? <span className="text-text-muted italic">Generating…</span>}
          </p>
        </Section>

        <div className="border-t border-border pt-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="w-4 h-4 text-gold" />
            <span className="text-sm font-semibold text-text">Recommended Action</span>
            <span className="text-xs text-text-muted">— completed by analyst</span>
          </div>

          <div className="grid grid-cols-1 gap-4">
            <Field
              label="Addressee"
              placeholder="e.g. Ministry of Digital Affairs, Netherlands / European Commission DG Justice"
              value={draft?.addressee ?? ""}
              onChange={(v) => setDraft((d) => d ? { ...d, addressee: v } : d)}
            />
            <Field
              label="Legal basis"
              placeholder="e.g. EU AI Act Art. 27 / ECHR Art. 8 / Charter Art. 21"
              value={draft?.legalBasis ?? ""}
              onChange={(v) => setDraft((d) => d ? { ...d, legalBasis: v } : d)}
            />
            <Field
              label="Action requested"
              placeholder="e.g. Suspend deployment of scoring system pending independent audit"
              value={draft?.actionRequested ?? ""}
              onChange={(v) => setDraft((d) => d ? { ...d, actionRequested: v } : d)}
              multiline
            />
            <Field
              label="Deadline"
              placeholder="e.g. 90 days / Before August 2, 2026 / Immediate"
              value={draft?.deadline ?? ""}
              onChange={(v) => setDraft((d) => d ? { ...d, deadline: v } : d)}
            />
          </div>
        </div>

        {error && (
          <div className="bg-danger-soft border border-danger/30 rounded-lg p-3">
            <p className="text-sm text-danger">{error}</p>
          </div>
        )}

        {step === "done" && (
          <div className="bg-success-soft border border-success/30 rounded-lg p-3">
            <p className="text-sm text-success">Saved — ref {draft?.refNumber}</p>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-text-muted hover:text-text border border-border rounded-lg transition-colors"
          >
            Close
          </button>
          <div className="flex gap-3">
            {step !== "done" && (
              <button
                onClick={save}
                disabled={step === "saving" || !draft}
                className="px-4 py-2 text-sm bg-surface-2 border border-border text-text rounded-lg hover:border-accent/50 transition-colors disabled:opacity-40"
              >
                {step === "saving" ? "Saving…" : "Save"}
              </button>
            )}
            <button
              onClick={exportPdf}
              disabled={!canExport}
              className="flex items-center gap-2 px-5 py-2 text-sm bg-accent text-white rounded-lg hover:bg-accent/90 transition-colors disabled:opacity-40 disabled:cursor-not-allowed font-medium"
            >
              <Download className="w-4 h-4" />
              Export PDF
            </button>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}

function ModalShell({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-surface border border-border rounded-xl shadow-2xl">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-text-muted hover:text-text transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono mb-2">{label}</p>
      {children}
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="px-2 py-0.5 bg-surface-2 border border-border rounded text-xs text-text-muted font-mono">
      {children}
    </span>
  );
}

function Field({
  label, placeholder, value, onChange, multiline,
}: {
  label: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
}) {
  const base = "w-full px-3 py-2 bg-bg border border-border rounded-lg text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors";
  return (
    <div>
      <label className="block text-xs font-medium text-text-muted mb-1.5">{label}</label>
      {multiline ? (
        <textarea
          className={cn(base, "resize-none h-20")}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          type="text"
          className={base}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}
