"use client";

import { Link2, AlertTriangle } from "lucide-react";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

export function StepDpiaBridge({ state, onUpdate }: Props) {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          DPIA Bridge
        </h2>
        <p className="text-sm text-text-muted">
          Article 27(4) allows you to build on an existing Data Protection Impact
          Assessment (GDPR Art. 35). If you have already conducted a DPIA for this
          AI system, link it here to avoid duplication.
        </p>
      </div>

      <div className="bg-accent-soft/30 border border-accent/20 rounded-lg p-5 flex items-start gap-4">
        <Link2 className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="text-sm text-text-muted">
          <p>
            <strong className="text-text">Art. 27(4):</strong> Where obligations under paragraph 1
            are already met through a DPIA under GDPR Art. 35, the FRIA shall complement
            that assessment. You do not need to duplicate work already covered by the DPIA,
            but you must address fundamental rights concerns beyond data protection.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
          DPIA Reference
        </label>
        <input
          type="text"
          value={state.dpiaReference}
          onChange={(e) => onUpdate({ dpiaReference: e.target.value })}
          className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors"
          placeholder="E.g.: DPIA-2025-042 — HR AI Screening System (completed March 2025)"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
          DPIA Overlap — What is already covered?
        </label>
        <textarea
          rows={4}
          value={state.dpiaOverlapNotes}
          onChange={(e) => onUpdate({ dpiaOverlapNotes: e.target.value })}
          className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Describe which FRIA requirements are already addressed in your DPIA. E.g.: 'The DPIA covers: data protection risks (Art. 8 Charter), privacy impact on candidates (Art. 7), data minimization measures, consent mechanisms, and data retention policies. The FRIA additionally addresses: non-discrimination (Art. 21), equal access to employment (Art. 15), and specific risks to vulnerable populations not covered in the DPIA.'"
        />
      </div>

      <div className="bg-gold-soft/50 border border-gold/20 rounded-lg p-4 flex items-start gap-3">
        <AlertTriangle className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
        <div className="text-xs text-text-muted">
          <strong className="text-gold">Important:</strong> Even if you have a comprehensive DPIA,
          the FRIA must address fundamental rights beyond data protection — including
          non-discrimination, human dignity, equality, access to justice, and other
          Charter rights relevant to your AI system. A DPIA alone is not sufficient.
        </div>
      </div>
    </div>
  );
}
