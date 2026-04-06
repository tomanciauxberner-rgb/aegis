"use client";

import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface Step {
  id: number;
  label: string;
  description: string;
}

const STEPS: Step[] = [
  { id: 1, label: "Context", description: "System & deployment" },
  { id: 2, label: "Populations", description: "Affected groups" },
  { id: 3, label: "Risks", description: "Rights impact" },
  { id: 4, label: "Mitigation", description: "Measures" },
  { id: 5, label: "Oversight", description: "Human control" },
  { id: 6, label: "DPIA Bridge", description: "Overlap check" },
  { id: 7, label: "Export", description: "Generate report" },
];

export function FriaStepIndicator({ currentStep }: { currentStep: number }) {
  return (
    <div className="flex items-center gap-1 mb-8 overflow-x-auto pb-2">
      {STEPS.map((step, i) => {
        const isComplete = currentStep > step.id;
        const isCurrent = currentStep === step.id;
        const isFuture = currentStep < step.id;

        return (
          <div key={step.id} className="flex items-center">
            <div className="flex flex-col items-center min-w-[80px]">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all",
                  isComplete && "bg-success text-bg",
                  isCurrent && "bg-accent text-white ring-2 ring-accent/30",
                  isFuture && "bg-surface-2 text-text-dim border border-border"
                )}
              >
                {isComplete ? (
                  <Check className="w-4 h-4" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={cn(
                  "mt-1.5 text-[10px] font-medium uppercase tracking-wider whitespace-nowrap",
                  isCurrent ? "text-accent" : "text-text-dim"
                )}
              >
                {step.label}
              </span>
              <span className="text-[9px] text-text-dim/60 whitespace-nowrap">
                {step.description}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 mx-1 mt-[-18px]",
                  isComplete ? "bg-success" : "bg-border"
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { STEPS };
