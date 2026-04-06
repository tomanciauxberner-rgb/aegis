"use client";

import { useState } from "react";
import { Plus, Trash2, Sparkles, Loader2 } from "lucide-react";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

export function StepMitigation({ state, onUpdate }: Props) {
  const [aiLoading, setAiLoading] = useState<string | null>(null);

  function addMitigation(riskId?: string) {
    onUpdate({
      mitigations: [
        ...state.mitigations,
        {
          id: crypto.randomUUID(),
          riskId: riskId || "",
          title: "",
          description: "",
          responsible: "",
          deadline: "",
        },
      ],
    });
  }

  function removeMitigation(index: number) {
    onUpdate({
      mitigations: state.mitigations.filter((_, i) => i !== index),
    });
  }

  function updateMitigation(index: number, field: string, value: string) {
    const updated = [...state.mitigations];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ mitigations: updated });
  }

  async function suggestMitigations(riskId: string) {
    const risk = state.risks.find((r) => r.id === riskId);
    if (!risk) return;

    setAiLoading(riskId);
    try {
      const res = await fetch("/api/fria/suggest-mitigation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          riskTitle: risk.title,
          riskDescription: risk.description,
          rightCategory: risk.rightsCategoryCode,
          country: "",
          populations: "",
        }),
      });

      if (!res.ok) throw new Error("Failed");
      const data = await res.json();

      if (data.suggestions) {
        const newMitigations = data.suggestions.map((s: any) => ({
          id: crypto.randomUUID(),
          riskId,
          title: s.title,
          description: s.description,
          responsible: "",
          deadline: "",
        }));
        onUpdate({
          mitigations: [...state.mitigations, ...newMitigations],
        });
      }
    } catch {
      console.error("Failed to fetch suggestions");
    } finally {
      setAiLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Mitigation Measures
        </h2>
        <p className="text-sm text-text-muted">
          Define measures to mitigate identified risks. Use AI suggestions as a
          starting point, then customize for your specific context.
        </p>
      </div>

      {state.risks.length === 0 && (
        <div className="bg-gold-soft/50 border border-gold/20 rounded-lg p-6 text-center">
          <p className="text-sm text-text-muted">
            Go back to Step 3 and add risks first. Mitigation measures are linked to specific risks.
          </p>
        </div>
      )}

      {state.risks.map((risk) => {
        const riskMitigations = state.mitigations.filter(
          (m) => m.riskId === risk.id
        );
        const isLoading = aiLoading === risk.id;

        return (
          <div key={risk.id} className="border border-border rounded-lg overflow-hidden">
            {/* Risk header */}
            <div className="px-5 py-3 bg-surface-2/50 flex items-center justify-between">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                  Risk:
                </span>{" "}
                <span className="text-sm font-medium text-text">
                  {risk.title || "Untitled risk"}
                </span>
              </div>
              <button
                onClick={() => suggestMitigations(risk.id)}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-soft text-purple text-xs font-medium rounded hover:bg-purple-soft/80 disabled:opacity-50 transition-colors"
              >
                {isLoading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isLoading ? "Generating..." : "AI Suggest"}
              </button>
            </div>

            {/* Mitigations for this risk */}
            <div className="divide-y divide-border/50">
              {riskMitigations.length === 0 && !isLoading && (
                <div className="px-5 py-6 text-center">
                  <p className="text-sm text-text-dim">
                    No mitigations yet. Click &quot;AI Suggest&quot; or add manually.
                  </p>
                </div>
              )}

              {riskMitigations.map((mit) => {
                const mitIndex = state.mitigations.findIndex(
                  (m) => m.id === mit.id
                );
                return (
                  <div key={mit.id} className="px-5 py-4 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 space-y-3">
                        <div>
                          <label className="block text-xs font-medium text-text-dim mb-1 uppercase tracking-wider">
                            Measure
                          </label>
                          <input
                            type="text"
                            value={mit.title}
                            onChange={(e) =>
                              updateMitigation(mitIndex, "title", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                            placeholder="Mitigation measure title"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-text-dim mb-1 uppercase tracking-wider">
                            Description
                          </label>
                          <textarea
                            rows={2}
                            value={mit.description}
                            onChange={(e) =>
                              updateMitigation(mitIndex, "description", e.target.value)
                            }
                            className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
                            placeholder="Detailed description of the mitigation measure"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-xs font-medium text-text-dim mb-1 uppercase tracking-wider">
                              Responsible
                            </label>
                            <input
                              type="text"
                              value={mit.responsible}
                              onChange={(e) =>
                                updateMitigation(mitIndex, "responsible", e.target.value)
                              }
                              className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                              placeholder="E.g.: DPO, HR Manager"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-text-dim mb-1 uppercase tracking-wider">
                              Deadline
                            </label>
                            <input
                              type="date"
                              value={mit.deadline}
                              onChange={(e) =>
                                updateMitigation(mitIndex, "deadline", e.target.value)
                              }
                              className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => removeMitigation(mitIndex)}
                        className="text-text-dim hover:text-danger transition-colors mt-6"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Add manual */}
            <div className="px-5 py-3 border-t border-border/50">
              <button
                onClick={() => addMitigation(risk.id)}
                className="flex items-center gap-1.5 text-xs text-text-muted hover:text-accent transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                Add mitigation manually
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
