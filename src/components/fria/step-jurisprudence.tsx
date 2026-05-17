"use client";

import { useEffect, useState } from "react";
import { Scale, ExternalLink, Check, ChevronDown, ChevronUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FriaWizardState } from "@/types";
import type { JurisprudenceCase, JurisprudenceResponse } from "@/types/jurisprudence";
import { COURT_LABELS, COURT_COLORS, RELEVANCE_LABELS } from "@/types/jurisprudence";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const RELEVANCE_BADGE: Record<string, string> = {
  binding:      "text-danger bg-danger-soft border border-danger/40",
  persuasive:   "text-gold bg-gold-soft border border-gold/40",
  illustrative: "text-accent bg-accent-soft border border-accent/40",
};

function CaseCard({
  c,
  selected,
  onToggle,
}: {
  c: JurisprudenceCase;
  selected: boolean;
  onToggle: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const courtColor = COURT_COLORS[c.court] ?? "#4f7cff";

  return (
    <div
      className={cn(
        "bg-surface border rounded-lg overflow-hidden transition-colors",
        selected ? "border-accent/60" : "border-border hover:border-border-accent"
      )}
    >
      <div className="h-0.5 w-full" style={{ backgroundColor: courtColor }} />

      <div className="px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <button
              onClick={onToggle}
              className={cn(
                "mt-0.5 w-5 h-5 rounded border flex-shrink-0 flex items-center justify-center transition-colors",
                selected
                  ? "bg-accent border-accent"
                  : "border-border hover:border-accent bg-surface-2"
              )}
            >
              {selected && <Check className="w-3 h-3 text-white" />}
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span
                  className="text-base font-mono font-bold px-2 py-0.5 rounded border"
                  style={{
                    color: courtColor,
                    backgroundColor: `${courtColor}18`,
                    borderColor: `${courtColor}40`,
                  }}
                >
                  {COURT_LABELS[c.court]}
                </span>
                <span className={cn("text-base px-2 py-0.5 rounded font-mono", RELEVANCE_BADGE[c.relevance])}>
                  {RELEVANCE_LABELS[c.relevance]}
                </span>
                <span className="text-base text-text-dim font-mono">{c.year}</span>
                {c.country && (
                  <span className="text-base text-text-dim font-mono">{c.country}</span>
                )}
              </div>

              <p className="text-sm font-semibold text-text leading-snug">{c.name}</p>
              <p className="text-base text-text-dim font-mono mt-0.5">{c.citation}</p>
            </div>
          </div>

          <button
            onClick={() => setExpanded(v => !v)}
            className="flex-shrink-0 text-text-muted hover:text-text transition-colors mt-1"
          >
            {expanded
              ? <ChevronUp className="w-4 h-4" />
              : <ChevronDown className="w-4 h-4" />
            }
          </button>
        </div>

        {!expanded && (
          <p className="text-base text-text-muted leading-relaxed mt-3 ml-8 line-clamp-2">
            {c.summary}
          </p>
        )}

        {expanded && (
          <div className="mt-4 ml-8 space-y-3">
            <div>
              <p className="text-base font-mono text-text-dim uppercase tracking-wider mb-1">Summary</p>
              <p className="text-base text-text-muted leading-relaxed">{c.summary}</p>
            </div>
            <div>
              <p className="text-base font-mono text-text-dim uppercase tracking-wider mb-1">Holding</p>
              <p className="text-base text-text leading-relaxed border-l-2 border-accent/40 pl-3">
                {c.holding}
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <div>
                <p className="text-base font-mono text-text-dim uppercase tracking-wider mb-1">AI Act</p>
                <div className="flex flex-wrap gap-1">
                  {c.ai_act_articles.map(a => (
                    <span key={a} className="text-base px-2 py-0.5 bg-surface-3 border border-border rounded font-mono text-text-muted">
                      {a}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {c.keywords.map(k => (
                <span key={k} className="text-[10px] px-2 py-0.5 bg-surface-2 border border-border rounded font-mono text-text-dim">
                  {k}
                </span>
              ))}
            </div>
            {c.url && (
              <a
                href={c.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-base text-accent hover:text-accent/80 transition-colors font-mono"
                onClick={e => e.stopPropagation()}
              >
                Full judgment <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export function StepJurisprudence({ state, onUpdate }: Props) {
  const [cases, setCases]     = useState<JurisprudenceCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  const selectedCases: string[] = (state as any).selectedCases ?? [];

  function toggleCase(id: string) {
    const next = selectedCases.includes(id)
      ? selectedCases.filter(c => c !== id)
      : [...selectedCases, id];
    onUpdate({ selectedCases: next } as any);
  }

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const categories = state.risks.map(r => r.rightsCategoryCode).filter(Boolean);
        const sectors: string[] = [];

        if (state.affectedGroups.some(g =>
          ["law_enforcement", "essential_services"].includes(g.populationCode)
        )) sectors.push("law_enforcement", "essential_services");

        const params = new URLSearchParams();
        if (categories.length > 0) params.set("categories", categories.join(","));
        if (sectors.length > 0) params.set("sectors", sectors.join(","));
        if (categories.length === 0 && sectors.length === 0) {
          params.set("categories", "data_protection,non_discrimination,private_life");
        }

        const res = await fetch(`/api/fria/jurisprudence?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: JurisprudenceResponse = await res.json();
        setCases(json.cases);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load case law");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Relevant Case Law
        </h2>
        <p className="text-sm text-text-muted">
          Case law from the CJEU, ECtHR and national courts relevant to your identified risks.
          Select cases to include as legal references in your FRIA export.
        </p>
      </div>

      {loading && (
        <div className="flex items-center gap-3 p-6 bg-surface border border-border rounded-lg">
          <Loader2 className="w-4 h-4 text-accent animate-spin" />
          <p className="text-base text-text-muted font-mono">Matching case law to your risk profile…</p>
        </div>
      )}

      {error && (
        <div className="bg-danger-soft border border-danger/30 rounded-lg p-4">
          <p className="text-base text-danger font-mono">{error}</p>
        </div>
      )}

      {!loading && !error && cases.length === 0 && (
        <div className="p-6 bg-surface border border-border rounded-lg text-center">
          <Scale className="w-8 h-8 text-text-dim mx-auto mb-3" />
          <p className="text-base text-text-muted">
            No cases matched. Add risks with rights categories in Step 3 to see relevant jurisprudence.
          </p>
        </div>
      )}

      {!loading && cases.length > 0 && (
        <>
          <div className="flex items-center justify-between">
            <p className="text-base text-text-muted font-mono">
              {cases.length} cases matched · {selectedCases.length} selected for export
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdate({ selectedCases: cases.map(c => c.id) } as any)}
                className="text-base text-text-muted hover:text-text border border-border hover:border-border-accent rounded px-3 py-1.5 transition-colors font-mono"
              >
                Select all
              </button>
              <button
                onClick={() => onUpdate({ selectedCases: [] } as any)}
                className="text-base text-text-muted hover:text-text border border-border hover:border-border-accent rounded px-3 py-1.5 transition-colors font-mono"
              >
                Clear
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {cases.map(c => (
              <CaseCard
                key={c.id}
                c={c}
                selected={selectedCases.includes(c.id)}
                onToggle={() => toggleCase(c.id)}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
