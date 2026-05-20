"use client";

import { Baby, Shield, AlertTriangle } from "lucide-react";
import type { FriaWizardState } from "@/types";
import {
  CHILD_AGE_BANDS,
  CHILD_RIGHTS_FRAMEWORKS,
  CHILD_VULNERABILITIES,
} from "@/lib/fria/child-rights";

interface Props {
  state: FriaWizardState;
  onUpdate: (updates: Partial<FriaWizardState>) => void;
}

const EMPTY = {
  ageBands: [] as string[],
  frameworks: [] as string[],
  vulnerabilities: [] as string[],
  bestInterestsNotes: "",
  ageAssuranceMethod: "",
};

export function StepChildRights({ state, onUpdate }: Props) {
  const ca = state.childAssessment ?? EMPTY;

  function update(patch: Partial<typeof EMPTY>) {
    onUpdate({ childAssessment: { ...EMPTY, ...ca, ...patch } });
  }

  function toggle(field: "ageBands" | "frameworks" | "vulnerabilities", code: string) {
    const current = ca[field];
    const next = current.includes(code) ? current.filter((c) => c !== code) : [...current, code];
    update({ [field]: next } as Partial<typeof EMPTY>);
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <Baby className="w-5 h-5 text-accent" />
          <h2 className="font-[family-name:var(--font-display)] text-xl font-bold">Child-specific rights</h2>
        </div>
        <p className="text-sm text-text-muted">
          When an AI system affects minors, the FRIA must assess developmental vulnerability and child-specific legal frameworks. This is the dimension generic impact assessments miss.
        </p>
      </div>

      <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 flex items-start gap-3">
        <Shield className="w-4 h-4 text-accent mt-0.5 shrink-0" />
        <p className="text-xs text-text-muted">
          <strong className="text-accent">Charter Art. 24 &amp; UN CRC Art. 3:</strong> the best interests of the child must be a primary consideration. AI systems in education fall under <strong>AI Act Annex III(3)</strong>.
        </p>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-dim mb-2 uppercase tracking-wider">Age bands affected</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CHILD_AGE_BANDS.map((b) => {
            const on = ca.ageBands.includes(b.code);
            return (
              <button
                key={b.code}
                onClick={() => toggle("ageBands", b.code)}
                className={`text-left rounded-lg border p-3 transition-colors ${on ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-border-accent"}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium text-text">{b.label}</span>
                  <span className="text-xs font-mono text-text-dim">{b.range}</span>
                </div>
                <p className="text-[11px] text-text-muted leading-snug">{b.cognitiveProfile}</p>
                {on && <p className="text-[10px] text-accent mt-1.5 leading-snug">{b.consentNote}</p>}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-dim mb-2 uppercase tracking-wider">Applicable legal frameworks</label>
        <div className="flex flex-wrap gap-2">
          {CHILD_RIGHTS_FRAMEWORKS.map((f) => {
            const on = ca.frameworks.includes(f.code);
            return (
              <button
                key={f.code}
                onClick={() => toggle("frameworks", f.code)}
                title={f.description}
                className={`text-left rounded-md border px-2.5 py-1.5 transition-colors ${on ? "border-accent bg-accent/10" : "border-border bg-surface hover:border-border-accent"}`}
              >
                <span className="text-[11px] font-medium text-text">{f.framework} {f.article}</span>
                <span className="block text-[10px] text-text-dim">{f.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <label className="block text-[11px] font-medium text-text-dim mb-2 uppercase tracking-wider">Developmental vulnerabilities at stake</label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {CHILD_VULNERABILITIES.map((v) => {
            const on = ca.vulnerabilities.includes(v.code);
            return (
              <button
                key={v.code}
                onClick={() => toggle("vulnerabilities", v.code)}
                className={`text-left rounded-lg border p-2.5 transition-colors flex items-start gap-2 ${on ? "border-danger bg-danger/10" : "border-border bg-surface hover:border-border-accent"}`}
              >
                <AlertTriangle className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${on ? "text-danger" : "text-text-dim"}`} />
                <div>
                  <span className="text-[12px] font-medium text-text">{v.label}</span>
                  <span className="block text-[10px] text-text-muted leading-snug">{v.description}</span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-[11px] font-medium text-text-dim mb-1 uppercase tracking-wider">Best interests assessment</label>
          <textarea
            value={ca.bestInterestsNotes}
            onChange={(e) => update({ bestInterestsNotes: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="How does the system serve — or risk undermining — the best interests of the child? (Charter Art. 24, UN CRC Art. 3)"
          />
        </div>
        <div>
          <label className="block text-[11px] font-medium text-text-dim mb-1 uppercase tracking-wider">Age-assurance method</label>
          <textarea
            value={ca.ageAssuranceMethod}
            onChange={(e) => update({ ageAssuranceMethod: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-bg border border-border rounded text-sm text-text placeholder:text-text-dim focus:outline-none focus:border-accent transition-colors resize-none"
            placeholder="How is age verified / assured? (self-declaration, parental consent flow, age estimation…) and how does it map to GDPR Art. 8 thresholds per country?"
          />
        </div>
      </div>
    </div>
  );
}
