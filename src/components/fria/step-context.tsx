"use client";

import { useState } from "react";
import { Info } from "lucide-react";
import { RiskDataPanel } from "@/components/fria/risk-data-panel";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const COUNTRIES = [
  { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" },
  { code: "BG", name: "Bulgaria" }, { code: "HR", name: "Croatia" },
  { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" },
  { code: "FI", name: "Finland" }, { code: "FR", name: "France" },
  { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" }, { code: "LV", name: "Latvia" },
  { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" },
  { code: "PL", name: "Poland" }, { code: "PT", name: "Portugal" },
  { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" },
  { code: "SE", name: "Sweden" },
];

const RISK_CATEGORIES = [
  { value: "employment", label: "Employment & worker management", example: "CV screening, performance evaluation, workforce planning" },
  { value: "education", label: "Education & vocational training", example: "Student assessment, admission decisions, learning analytics" },
  { value: "essential_services", label: "Essential services (credit, insurance)", example: "Credit scoring, insurance pricing, loan approval" },
  { value: "biometrics", label: "Biometrics", example: "Facial recognition, fingerprint analysis, voice identification" },
  { value: "law_enforcement", label: "Law enforcement", example: "Predictive policing, evidence analysis, risk assessment" },
  { value: "migration", label: "Migration, asylum & border control", example: "Visa processing, asylum claim assessment, border checks" },
  { value: "justice", label: "Administration of justice", example: "Sentencing support, case management, legal research" },
];

export function StepContext({ state, onUpdate }: Props) {
  const ctx = state.context;
  const [selectedCountry, setSelectedCountry] = useState("");

  function updateContext(field: string, value: string) {
    onUpdate({ context: { ...ctx, [field]: value } });
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-2">
          Step 1: Describe your AI system
        </h2>
        <p className="text-base text-text-muted leading-relaxed">
          Start by telling us what your AI system does and where it will be used.
          Aegis will then load real discrimination and rights data for that country
          to help you assess risks.
        </p>
      </div>

      {/* Category + Country */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            What does your AI system do?
          </label>
          <select
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            defaultValue=""
          >
            <option value="" disabled>Choose a category...</option>
            {RISK_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
          <p className="text-sm text-text-dim mt-2">
            This determines which EU AI Act rules apply (Annex III).
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            In which country will it be deployed?
          </label>
          <select
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
          >
            <option value="">Choose a country...</option>
            {COUNTRIES.map((c) => (
              <option key={c.code} value={c.code}>
                {c.name}
              </option>
            ))}
          </select>
          <p className="text-sm text-text-dim mt-2">
            Aegis loads FRA data specific to this country.
          </p>
        </div>
      </div>

      {/* FRA Risk Data Panel */}
      {selectedCountry && (
        <RiskDataPanel countryCode={selectedCountry} />
      )}

      {/* Deployment description */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Describe what the AI system does in plain language
        </label>
        <textarea
          rows={4}
          value={ctx.deploymentDescription}
          onChange={(e) => updateContext("deploymentDescription", e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
          placeholder="Example: Our AI system screens job applications by analyzing CVs and ranking candidates based on qualification matching. It produces a shortlist of top 10 candidates that HR managers then review before scheduling interviews."
        />
        <div className="flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-dim">
            Be specific about what decisions the AI makes or supports.
            Who sees the output? Can humans override it?
          </p>
        </div>
      </div>

      {/* Frequency + Duration */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            How often is it used?
          </label>
          <input
            type="text"
            value={ctx.operationalFrequency}
            onChange={(e) => updateContext("operationalFrequency", e.target.value)}
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            placeholder="Example: Daily, ~200 applications per week"
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-text mb-2">
            How long has it been in use (or when will it start)?
          </label>
          <input
            type="text"
            value={ctx.duration}
            onChange={(e) => updateContext("duration", e.target.value)}
            className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all"
            placeholder="Example: Deployed since January 2025, ongoing"
          />
        </div>
      </div>

      {/* Oversight */}
      <div>
        <label className="block text-sm font-semibold text-text mb-2">
          Who supervises the AI system?
        </label>
        <textarea
          rows={3}
          value={ctx.humanOversightMeasures}
          onChange={(e) => updateContext("humanOversightMeasures", e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded-lg text-base text-text placeholder:text-text-dim focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent/30 transition-all resize-none"
          placeholder="Example: HR manager reviews all AI shortlists before contacting candidates. They can override any AI decision. The DPO conducts quarterly bias audits."
        />
        <div className="flex items-start gap-2 mt-2">
          <Info className="w-4 h-4 text-accent mt-0.5 flex-shrink-0" />
          <p className="text-sm text-text-dim">
            Name the people or roles who can override AI decisions.
          </p>
        </div>
      </div>
    </div>
  );
}
