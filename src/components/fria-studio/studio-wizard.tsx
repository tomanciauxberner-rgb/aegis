"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Save, Check, Loader2 } from "lucide-react";
import { StepDomain } from "@/components/fria-studio/step-domain";
import { StepLifecycle } from "@/components/fria-studio/step-lifecycle";
import { StepRightsHeatmap } from "@/components/fria-studio/step-rights-heatmap";
import { StepEvidence } from "@/components/fria-studio/step-evidence";
import type { Annex3Domain } from "@/lib/fria-studio/annex3-taxonomy";
import type { EvidenceState } from "@/lib/fria-studio/evidence-schema";

type RiskDisposition = "unaddressed" | "mitigated" | "accepted" | "na";

interface StudioState {
  step: number;
  source?: string;
  sourceSystemId?: string;
  domainCode: string | null;
  context: {
    deploymentDescription: string;
    operationalFrequency: string;
    duration: string;
    humanOversightMeasures: string;
  };
  lifecycleState: Record<string, Record<string, RiskDisposition>>;
  evidenceState: EvidenceState;
}

const INITIAL_STATE: StudioState = {
  step: 1,
  domainCode: null,
  context: { deploymentDescription: "", operationalFrequency: "", duration: "", humanOversightMeasures: "" },
  lifecycleState: {},
  evidenceState: {},
};

const STEPS = [
  { n: 1, label: "Domain" },
  { n: 2, label: "Lifecycle" },
  { n: 3, label: "Heatmap" },
  { n: 4, label: "Evidence" },
];

type SaveStatus = "idle" | "saving" | "saved" | "error";

export function StudioWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [state, setState] = useState<StudioState>(INITIAL_STATE);
  const [friaId, setFriaId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const id = searchParams.get("id");
    const systemId = searchParams.get("systemId");

    if (id) {
      fetch(`/api/fria/assessments/${id}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((row) => {
          if (row.draftState) setState({ ...INITIAL_STATE, ...row.draftState });
          setFriaId(id);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    if (systemId) {
      fetch(`/api/fria-studio/prefill?systemId=${encodeURIComponent(systemId)}`)
        .then((r) => (r.ok ? r.json() : Promise.reject(r)))
        .then((data) => {
          if (data.draftState) setState({ ...INITIAL_STATE, ...data.draftState });
        })
        .catch(() => {})
        .finally(() => setLoading(false));
      return;
    }

    setLoading(false);
  }, [searchParams]);

  const persist = useCallback(
    async (next: StudioState, opts?: { explicit?: boolean }) => {
      setSaveStatus("saving");
      try {
        const title = next.context.deploymentDescription?.slice(0, 80) || "Untitled FRIA Studio";
        if (!friaId) {
          const res = await fetch("/api/fria/assessments", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ title, sourceRef: searchParams.get("systemId") ?? undefined, draftState: next }),
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
    },
    [friaId, router, searchParams],
  );

  useEffect(() => {
    if (loading) return;
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void persist(state), 1200);
    return () => { if (saveTimer.current) clearTimeout(saveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, loading]);

  function nextStep() {
    setState((p) => ({ ...p, step: Math.min(p.step + 1, 4) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function prevStep() {
    setState((p) => ({ ...p, step: Math.max(p.step - 1, 1) }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "64px 0" }}>
        <Loader2 className="animate-spin" style={{ width: 24, height: 24, color: "#4f7cff" }} />
      </div>
    );
  }

  return (
    <div>
      {/* Step indicator */}
      <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
        {STEPS.map((st) => {
          const active = state.step === st.n;
          const done = state.step > st.n;
          return (
            <div key={st.n} style={{ flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
              <div style={{
                height: 3,
                borderRadius: 2,
                background: active ? "#4f7cff" : done ? "rgba(52,211,153,0.5)" : "rgba(255,255,255,0.1)",
              }} />
              <span style={{
                fontSize: 11,
                fontFamily: "var(--font-mono), monospace",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: active ? "#4f7cff" : done ? "#34d399" : "rgba(255,255,255,0.3)",
              }}>
                {st.n}. {st.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        background: "rgba(255,255,255,0.015)",
        border: "1px solid rgba(255,255,255,0.08)",
        borderRadius: 14,
        padding: 28,
        minHeight: 420,
      }}>
        {state.step === 1 && (
          <StepDomain
            selectedDomain={state.domainCode}
            onSelect={(d: Annex3Domain) => setState((p) => ({ ...p, domainCode: d.code }))}
          />
        )}
        {state.step === 2 && (
          <StepLifecycle
            domainCode={state.domainCode}
            lifecycleState={state.lifecycleState}
            onUpdate={(ls) => setState((p) => ({ ...p, lifecycleState: ls }))}
          />
        )}
        {state.step === 3 && (
          <StepRightsHeatmap domainCode={state.domainCode} evidenceState={state.evidenceState} />
        )}
        {state.step === 4 && (
          <StepEvidence
            lifecycleState={state.lifecycleState}
            evidenceState={state.evidenceState}
            onUpdate={(es) => setState((p) => ({ ...p, evidenceState: es }))}
          />
        )}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 24 }}>
        <button
          onClick={prevStep}
          disabled={state.step === 1}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
            fontSize: 13, color: "rgba(255,255,255,0.55)", background: "none", border: "none",
            cursor: state.step === 1 ? "not-allowed" : "pointer", opacity: state.step === 1 ? 0.3 : 1,
          }}
        >
          <ArrowLeft size={15} /> Previous
        </button>

        <button
          onClick={() => void persist(state, { explicit: true })}
          style={{
            display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
            fontSize: 13, color: "rgba(255,255,255,0.65)", background: "transparent",
            border: "1px solid rgba(255,255,255,0.12)", borderRadius: 8, cursor: "pointer",
          }}
        >
          {saveStatus === "saving" ? <Loader2 size={14} className="animate-spin" />
            : saveStatus === "saved" ? <Check size={14} style={{ color: "#34d399" }} />
            : <Save size={14} />}
          {saveStatus === "saving" ? "Saving…" : saveStatus === "saved" ? "Saved" : saveStatus === "error" ? "Retry save" : "Save draft"}
        </button>

        {state.step < 4 ? (
          <button
            onClick={nextStep}
            style={{
              display: "flex", alignItems: "center", gap: 8, padding: "10px 20px",
              fontSize: 13, fontWeight: 600, color: "#fff", background: "#4f7cff",
              border: "none", borderRadius: 8, cursor: "pointer",
            }}
          >
            Next <ArrowRight size={15} />
          </button>
        ) : (
          <div style={{ width: 90 }} />
        )}
      </div>
    </div>
  );
}
