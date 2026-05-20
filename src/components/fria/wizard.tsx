"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Check, Loader2 } from "lucide-react";
import { FriaStepIndicator } from "@/components/fria/step-indicator";
import { StepContext } from "@/components/fria/step-context";
import { StepPopulations } from "@/components/fria/step-populations";
import { StepRisks } from "@/components/fria/step-risks";
import { StepMitigation } from "@/components/fria/step-mitigation";
import { StepJurisprudence } from "@/components/fria/step-jurisprudence";
import { StepOversight } from "@/components/fria/step-oversight";
import { StepDpiaBridge } from "@/components/fria/step-dpia-bridge";
import { StepExport } from "@/components/fria/step-export";
import type { FriaWizardState } from "@/types";

const INITIAL_STATE: FriaWizardState = {
  step: 1,
  systemId: "",
  context: { deploymentDescription: "", operationalFrequency: "", duration: "", humanOversightMeasures: "" },
  affectedGroups: [],
  risks: [],
  mitigations: [],
  dpiaReference: "",
  dpiaOverlapNotes: "",
  selectedCases: [],
};

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function FriaWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<FriaWizardState>(INITIAL_STATE);
  const [friaId, setFriaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load existing draft (?id=) or seed from EdTech bridge (?system=&country=...)
  useEffect(() => {
    const id = searchParams.get("id");
    const systemName = searchParams.get("system");
    const country = searchParams.get("country");

    if (id) {
      fetch(`/api/fria/assessments/${id}`)
        .then((r) => r.ok ? r.json() : Promise.reject(r))
        .then((row) => {
          if (row.draftState) setState({ ...INITIAL_STATE, ...row.draftState });
          setFriaId(id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    if (systemName) {
      setState((prev) => ({
        ...prev,
        context: {
          ...prev.context,
          deploymentDescription: `${systemName}${country ? ` (deployed in ${country})` : ""} — `,
        },
      }));
    }
    setLoading(false);
  }, [searchParams]);

  const persist = useCallback(async (next: FriaWizardState, opts?: { explicit?: boolean }) => {
    setSaveStatus("saving");
    try {
      const title = next.context.deploymentDescription?.slice(0, 80) || "Untitled FRIA";
      if (!friaId) {
        const res = await fetch("/api/fria/assessments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, sourceRef: searchParams.get("edtechId") ?? undefined, draftState: next }),
        });
        if (!res.ok) throw new Error("create failed");
        const data = await res.json();
        setFriaId(data.id);
        const url = new URL(window.location.href);
        url.searchParams.set("id", data.id);
        router.replace(url.pathname + url.search);
      } else {
        const res = await fetch(`/api/fria/assessments/${friaId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title, draftState: next }),
        });
        if (!res.ok) throw new Error("patch failed");
      }
      setSaveStatus("saved");
      if (!opts?.explicit) setTimeout(() => setSaveStatus("idle"), 2000);
    } catch {
      setSaveStatus("error");
    }
  }, [friaId, router, searchParams]);

  // Debounced auto-save on state change (after initial load)
  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => { void persist(state); }, 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loading]);

  function updateState(updates: Partial<FriaWizardState>) {
    setState((prev) => ({ ...prev, ...updates }));
  }

  function nextStep() {
    setState((prev) => ({ ...prev, step: Math.min(prev.step + 1, 8) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function prevStep() {
    setState((prev) => ({ ...prev, step: Math.max(prev.step - 1, 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div>
      <FriaStepIndicator currentStep={state.step} />

      <div className="bg-surface border border-border rounded-lg p-6 min-h-[400px]">
        {state.step === 1 && <StepContext state={state} onUpdate={updateState} />}
        {state.step === 2 && <StepPopulations state={state} onUpdate={updateState} />}
        {state.step === 3 && <StepRisks state={state} onUpdate={updateState} />}
        {state.step === 4 && <StepMitigation state={state} onUpdate={updateState} />}
        {state.step === 5 && <StepJurisprudence state={state} onUpdate={updateState} />}
        {state.step === 6 && <StepOversight state={state} onUpdate={updateState} />}
        {state.step === 7 && <StepDpiaBridge state={state} onUpdate={updateState} />}
        {state.step === 8 && <StepExport state={state} onUpdate={updateState} />}
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

        <button
          onClick={() => void persist(state, { explicit: true })}
          className="flex items-center gap-2 px-4 py-2.5 text-sm text-text-dim hover:text-text border border-border rounded hover:border-border-accent transition-colors"
        >
          {saveStatus === "saving" ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
            : saveStatus === "saved" ? <Check className="w-3.5 h-3.5 text-success" />
            : <Save className="w-3.5 h-3.5" />}
          {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry save" : "Save draft"}
        </button>

        {state.step < 8 ? (
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
