"use client";

import { Plus, Trash2, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { FriaWizardState, RiskLevel } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const POPULATION_OPTIONS = [
  { code: "general", name: "General population", category: "General" },
  { code: "women", name: "Women", category: "Gender" },
  { code: "african_descent", name: "People of African descent", category: "Ethnic" },
  { code: "roma", name: "Roma and Travellers", category: "Ethnic" },
  { code: "muslim", name: "Muslim people", category: "Religion" },
  { code: "jewish", name: "Jewish people", category: "Religion" },
  { code: "lgbtiq", name: "LGBTIQ+ people", category: "Sexual orientation" },
  { code: "transgender", name: "Transgender people", category: "Gender identity" },
  { code: "disability_physical", name: "People with physical disabilities", category: "Disability" },
  { code: "disability_mental", name: "People with mental health conditions", category: "Disability" },
  { code: "elderly_65plus", name: "Elderly (65+)", category: "Age" },
  { code: "youth_16_24", name: "Youth (16-24)", category: "Age" },
  { code: "migrants_recent", name: "Recent migrants (< 5 years)", category: "Migration" },
  { code: "low_income", name: "Low-income individuals", category: "Socioeconomic" },
];

const VULNERABILITY_LEVELS: { value: RiskLevel; label: string; color: string }[] = [
  { value: "minimal", label: "Minimal", color: "text-text-muted" },
  { value: "low", label: "Low", color: "text-success" },
  { value: "medium", label: "Medium", color: "text-gold" },
  { value: "high", label: "High", color: "text-danger" },
  { value: "critical", label: "Critical", color: "text-danger" },
];

export function StepPopulations({ state, onUpdate }: Props) {
  function addGroup() {
    onUpdate({
      affectedGroups: [
        ...state.affectedGroups,
        {
          populationCode: "",
          estimatedSize: "",
          vulnerabilityLevel: "medium" as RiskLevel,
          specificConcerns: "",
        },
      ],
    });
  }

  function removeGroup(index: number) {
    onUpdate({
      affectedGroups: state.affectedGroups.filter((_, i) => i !== index),
    });
  }

  function updateGroup(index: number, field: string, value: string) {
    const updated = [...state.affectedGroups];
    updated[index] = { ...updated[index], [field]: value };
    onUpdate({ affectedGroups: updated });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Affected Populations
        </h2>
        <p className="text-sm text-text-muted">
          Identify the categories of persons and groups likely to be affected by
          this AI system. Aegis will enrich each group with FRA discrimination
          data for your deployment country.
        </p>
      </div>

      <div className="bg-gold-soft/50 border border-gold/20 rounded-lg px-4 py-3 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
        <p className="text-xs text-text-muted">
          <strong className="text-gold">Art. 27(1)(c):</strong> You must identify
          all categories of natural persons and groups likely to be affected,
          including vulnerable populations who may face disproportionate impact.
        </p>
      </div>

      {state.affectedGroups.length === 0 && (
        <div className="bg-surface border border-border rounded-lg p-8 text-center">
          <p className="text-sm text-text-muted mb-4">
            No affected groups added yet. Add the populations that your AI
            system will impact.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {state.affectedGroups.map((group, index) => (
          <div
            key={index}
            className="bg-surface border border-border rounded-lg p-4 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-text-dim uppercase tracking-wider">
                Group {index + 1}
              </span>
              <button
                onClick={() => removeGroup(index)}
                className="text-text-dim hover:text-danger transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                  Population
                </label>
                <select
                  value={group.populationCode}
                  onChange={(e) =>
                    updateGroup(index, "populationCode", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
                >
                  <option value="">Select</option>
                  {POPULATION_OPTIONS.map((p) => (
                    <option key={p.code} value={p.code}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                  Estimated size
                </label>
                <input
                  type="text"
                  value={group.estimatedSize}
                  onChange={(e) =>
                    updateGroup(index, "estimatedSize", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                  placeholder="E.g.: ~5,000/year"
                />
              </div>

              <div>
                <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                  Vulnerability level
                </label>
                <select
                  value={group.vulnerabilityLevel}
                  onChange={(e) =>
                    updateGroup(index, "vulnerabilityLevel", e.target.value)
                  }
                  className={cn(
                    "w-full px-3 py-2 bg-bg border border-border rounded text-sm focus:outline-none focus:border-accent transition-colors",
                    VULNERABILITY_LEVELS.find(
                      (v) => v.value === group.vulnerabilityLevel
                    )?.color || "text-text"
                  )}
                >
                  {VULNERABILITY_LEVELS.map((v) => (
                    <option key={v.value} value={v.value}>
                      {v.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-medium text-text-dim mb-1 uppercase tracking-wider">
                Specific concerns
              </label>
              <input
                type="text"
                value={group.specificConcerns}
                onChange={(e) =>
                  updateGroup(index, "specificConcerns", e.target.value)
                }
                className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
                placeholder="E.g.: Higher discrimination rates in hiring, potential algorithmic bias"
              />
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={addGroup}
        className="flex items-center gap-2 px-4 py-2 border border-dashed border-border rounded text-sm text-text-muted hover:text-accent hover:border-accent transition-colors"
      >
        <Plus className="w-4 h-4" />
        Add affected group
      </button>
    </div>
  );
}
