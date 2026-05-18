"use client";

import { Plus, Trash2, Scale } from "lucide-react";
import { cn } from "@/lib/utils";
import { riskScore } from "@/lib/utils";
import type { FriaWizardState, RiskLevel } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const RIGHTS_OPTIONS = [
  { code: "non_discrimination", name: "Non-Discrimination (Art. 21)" },
  { code: "gender_equality", name: "Equality Between Women and Men (Art. 23)" },
  { code: "data_protection", name: "Protection of Personal Data (Art. 8)" },
  { code: "private_life", name: "Respect for Private Life (Art. 7)" },
  { code: "dignity", name: "Human Dignity (Art. 1)" },
  { code: "work", name: "Freedom to Choose Occupation (Art. 15)" },
  { code: "education", name: "Right to Education (Art. 14)" },
  { code: "effective_remedy", name: "Right to Effective Remedy (Art. 47)" },
  { code: "equality", name: "Equality Before the Law (Art. 20)" },
  { code: "disability", name: "Integration of Persons with Disabilities (Art. 26)" },
  { code: "child_rights", name: "Rights of the Child (Art. 24)" },
  { code: "expression", name: "Freedom of Expression (Art. 11)" },
];

const RISK_LEVELS: { value: RiskLevel; label: string; color: string }[] = [
  { value: "minimal", label: "Minimal", color: "text-text-muted bg-surface-2" },
  { value: "low", label: "Low", color: "text-success bg-success-soft" },
  { value: "medium", label: "Medium", color: "text-gold bg-gold-soft" },
  { value: "high", label: "High", color: "text-danger bg-danger-soft" },
  { value: "critical", label: "Critical", color: "text-danger bg-danger-soft" },
];

function RiskBadge({ level }: { level: string }) {
  const config = RISK_LEVELS.find((r) => r.value === level) || RISK_LEVELS[0];
  return (
    <span
      className={cn(
        "inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
        config.color
      )}
    >
      {config.label}
    </span>
  );
}

export function StepRisks({ state, onUpdate }: Props) {
  function addRisk() {
    onUpdate({
      risks: [
        ...state.risks,
        {
          id: crypto.randomUUID(),
          rightsCategoryCode: "",
          title: "",
          description: "",
          likelihood: "medium" as RiskLevel,
          severity: "medium" as RiskLevel,
          dataEvidence: [],
        },
      ],
    });
  }

  function removeRisk(index: number) {
    onUpdate({
      risks: state.risks.filter((_, i) => i !== index),
    });
  }

  function updateRisk(index: number, field: string, value: string) {
    const updated = [...state.risks];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ risks: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Fundamental Rights Risks
        </h2>
        <p className="text-sm text-text-muted">
          Identify specific risks of harm to the fundamental rights of affected
          groups. Aegis pre-scores risks based on FRA survey data for your
          deployment country.
        </p>
      </div>

      {state.risks.length === 0 && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <Scale className="w-8 h-8 text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted mb-2">
            No risks identified yet.
          </p>
          <p className="text-xs text-text-dim">
            Add risks to fundamental rights that your AI system may impact.
            Consider discrimination, privacy, access to justice, and dignity.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {state.risks.map((risk, index) => {
          const overall = riskScore(risk.likelihood, risk.severity);
          return (
            <div
              key={risk.id}
              className="bg-surface border border-border rounded-lg p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-text-dim uppercase tracking-wider">
                    Risk {index + 1}
                  </span>
                  <RiskBadge level={overall} />
                </div>
                <button
                  onClick={() => removeRisk(index)}
                  className="text-text-dim hover:text-danger transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                    Fundamental Right
                  </label>
                  <select
                    value={risk.rightsCategoryCode}
                    onChange={(e) =>
                      updateRisk(index, "rightsCategoryCode", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  >
                    <option value="">Select right</option>
                    {RIGHTS_OPTIONS.map((r) => (
                      <option key={r.code} value={r.code}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                    Risk Title
                  </label>
                  <input
                    type="text"
                    value={risk.title}
                    onChange={(e) => updateRisk(index, "title", e.target.value)}
                    className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                    placeholder="E.g.: Algorithmic bias in candidate scoring"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={risk.description}
                  onChange={(e) =>
                    updateRisk(index, "description", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
                  placeholder="Describe how this risk could materialize and affect the identified populations."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                    Likelihood
                  </label>
                  <select
                    value={risk.likelihood}
                    onChange={(e) =>
                      updateRisk(index, "likelihood", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  >
                    {RISK_LEVELS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                    Severity
                  </label>
                  <select
                    value={risk.severity}
                    onChange={(e) =>
                      updateRisk(index, "severity", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                  >
                    {RISK_LEVELS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={addRisk}
        className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-text-muted hover:text-accent hover:border-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add risk
      </button>
    </div>
  );
}
