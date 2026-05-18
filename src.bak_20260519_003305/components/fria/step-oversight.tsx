"use client";

import { Users } from "lucide-react";
import type { FriaWizardState } from "@/types";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

export function StepOversight({ state, onUpdate }: Props) {
  const ctx = state.context;

  function updateContext(field: string, value: string) {
    onUpdate({ context: { ...ctx, [field]: value } });
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-xl font-bold mb-1">
          Human Oversight
        </h2>
        <p className="text-sm text-text-muted">
          Document the human oversight measures in place for this AI system.
          Art. 27(1)(e) requires a description of who monitors the system and how they can intervene.
        </p>
      </div>

      <div className="bg-accent-soft/30 border border-accent/20 rounded-lg p-5 flex items-start gap-4">
        <Users className="w-5 h-5 text-accent mt-0.5 flex-shrink-0" />
        <div className="text-sm text-text-muted space-y-2">
          <p>
            <strong className="text-text">Effective oversight means:</strong> Named individuals with authority
            to override, suspend, or modify AI decisions. Documented escalation paths.
            Regular review cycles. Training records for operators.
          </p>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
          Oversight Responsible Person(s)
        </label>
        <textarea
          rows={3}
          value={ctx.humanOversightMeasures}
          onChange={(e) => updateContext("humanOversightMeasures", e.target.value)}
          className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="Name the individual(s) or role(s) responsible for oversight. E.g.: 'Maria Schmidt, DPO — responsible for quarterly bias audits. Jean Dupont, HR Director — reviews all AI-generated shortlists before candidate notification.'"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
            Intervention Mechanisms
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="How can the oversight person intervene? E.g.: 'Override button in admin panel to manually promote/reject candidates. Emergency stop procedure to disable AI scoring. Weekly review meetings to assess AI decisions.'"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
            Escalation Procedure
          </label>
          <textarea
            rows={4}
            className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="What happens when a problem is detected? E.g.: 'Level 1: Operator flags issue → reviewed within 24h. Level 2: DPO investigation → system suspended if confirmed bias. Level 3: Board notification + regulatory authority report.'"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
          Training & Competency
        </label>
        <textarea
          rows={3}
          className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="What training have oversight personnel received? E.g.: 'All HR team members completed AI bias awareness training (March 2026). DPO certified in EU AI Act compliance (IAPP certification). Quarterly refresher sessions scheduled.'"
        />
      </div>

      <div>
        <label className="block text-xs font-medium text-text-muted mb-1.5 uppercase tracking-wider">
          Review Cycle
        </label>
        <textarea
          rows={2}
          className="w-full px-4 py-3 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
          placeholder="How often is the FRIA reviewed and updated? E.g.: 'Quarterly review of AI performance metrics. Annual full FRIA reassessment. Ad-hoc review triggered by material changes to the AI system.'"
        />
      </div>
    </div>
  );
}
