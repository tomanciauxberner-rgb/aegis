"use client";

import { useState } from "react";
import { ArrowLeft, ArrowRight, Save } from "lucide-react";
import { FriaStepIndicator } from "@/components/fria/step-indicator";
import { StepContext } from "@/components/fria/step-context";
import { StepPopulations } from "@/components/fria/step-populations";
import { StepRisks } from "@/components/fria/step-risks";
import { StepMitigation } from "@/components/fria/step-mitigation";
import { StepOversight } from "@/components/fria/step-oversight";
import { StepDpiaBridge } from "@/components/fria/step-dpia-bridge";
import { StepExport } from "@/components/fria/step-export";
import type { FriaWizardState } from "@/types";

const INITIAL_STATE: FriaWizardState = {
  step: 1,
  systemId: "",
  context: {
    deploymentDescription: "",
    operationalFrequency: "",
    duration: "",
    humanOversightMeasures: "",
  },
  affectedGroups: [],
  risks: [],
  mitigations: [],
  dpiaReference: "",
  dpiaOverlapNotes: "",
};

export function FriaWizard() {
  const [state, setState] = useState<FriaWizardState>(INITIAL_STATE);

  function updateState(updates: Partial<FriaWizardState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }

  function nextStep() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 7) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div>
      <FriaStepIndicator currentStep={state.step} />

      <div className="bg-surface border border-border rounded-lg p-6 min-h-[400px]">
        {state.step === 1 && <StepContext state={state} onUpdate={updateState} />}
        {state.step === 2 && <StepPopulations state={state} onUpdate={updateState} />}
        {state.step === 3 && <StepRisks state={state} onUpdate={updateState} />}
        {state.step === 4 && <StepMitigation state={state} onUpdate={updateState} />}
        {state.step === 5 && <StepOversight state={state} onUpdate={updateState} />}
        {state.step === 6 && <StepDpiaBridge state={state} onUpdate={updateState} />}
        {state.step === 7 && <StepExport state={state} onUpdate={updateState} />}
      </div>

      <div className="flex items-center justify-between mt-6">
        <button
          onClick={prevStep}
          disabled={state.step === 1}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-muted hover:text-text disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Previous
        </button>

        <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-dim hover:text-text border border-border rounded hover:border-border-accent transition-colors">
          <Save className="w-3.5 h-3.5" />
          Save draft
        </button>

        {state.step < 7 ? (
          <button
            onClick={nextStep}
            className="flex items-center gap-2 px-5 py-2.5 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 transition-colors"
          >
            Next
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <div className="w-20" />
        )}
      </div>
    </div>
  );
}
