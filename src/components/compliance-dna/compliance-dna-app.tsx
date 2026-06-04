"use client";

import { useState, useMemo } from "react";
import { Dna, Euro, LayoutDashboard, Plus, Trash2 } from "lucide-react";
import { ComplianceGenome } from "@/components/compliance-dna/compliance-genome";
import { RiskToFine } from "@/components/compliance-dna/risk-to-fine";
import { BoardMode } from "@/components/compliance-dna/board-mode";
import { COMPLIANCE_REGIMES } from "@/lib/compliance-dna/regimes";
import {
  scoreRegime,
  computeFineExposure,
  buildBoardSummary,
  type ObligationAssessment,
  type ObligationForce,
  type ObligationStatus,
} from "@/lib/compliance-dna/scoring";

type Tab = "genome" | "fine" | "board";

let idCounter = 0;
function genId(): string {
  idCounter += 1;
  return `ob_${Date.now().toString(36)}_${idCounter}`;
}

const FORCE_OPTIONS: { value: ObligationForce; label: string }[] = [
  { value: "obligation", label: "Legal obligation" },
  { value: "harmonised_standard", label: "Harmonised standard" },
  { value: "best_practice", label: "Best practice" },
];

const STATUS_OPTIONS: { value: ObligationStatus; label: string }[] = [
  { value: "met", label: "Met" },
  { value: "partial", label: "Partial" },
  { value: "unmet", label: "Unmet" },
  { value: "not_applicable", label: "N/A" },
];

export function ComplianceDnaApp() {
  const [tab, setTab] = useState<Tab>("genome");
  const [assessments, setAssessments] = useState<ObligationAssessment[]>([]);
  const [turnoverM, setTurnoverM] = useState<string>("");
  const [isSme, setIsSme] = useState(false);

  const opts = useMemo(() => ({
    worldwideTurnoverEur: turnoverM ? Number(turnoverM) * 1_000_000 : undefined,
    isSme,
  }), [turnoverM, isSme]);

  const assessedRegimeCodes = useMemo(
    () => [...new Set(assessments.map((a) => a.regimeCode))],
    [assessments],
  );

  const scores = useMemo(
    () => assessedRegimeCodes.map((c) => scoreRegime(c, assessments)).filter((s): s is NonNullable<typeof s> => s !== null),
    [assessedRegimeCodes, assessments],
  );

  const exposures = useMemo(
    () => assessedRegimeCodes.map((c) => computeFineExposure(c, assessments, opts)).filter((e): e is NonNullable<typeof e> => e !== null),
    [assessedRegimeCodes, assessments, opts],
  );

  const board = useMemo(() => buildBoardSummary(assessments, opts), [assessments, opts]);

  function addObligation() {
    setAssessments((prev) => [
      ...prev,
      { regimeCode: "ai_act", obligationId: genId(), label: "", force: "obligation", status: "unmet", tierCode: COMPLIANCE_REGIMES[0].tiers[0]?.code },
    ]);
  }

  function updateObligation(id: string, patch: Partial<ObligationAssessment>) {
    setAssessments((prev) => prev.map((a) => (a.obligationId === id ? { ...a, ...patch } : a)));
  }

  function removeObligation(id: string) {
    setAssessments((prev) => prev.filter((a) => a.obligationId !== id));
  }

  const TABS: { id: Tab; label: string; icon: typeof Dna }[] = [
    { id: "genome", label: "Compliance Genome", icon: Dna },
    { id: "fine", label: "Risk-to-Fine", icon: Euro },
    { id: "board", label: "Board Mode", icon: LayoutDashboard },
  ];

  return (
    <div>
      {/* Controls */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24, flexWrap: "wrap", alignItems: "flex-end" }}>
        <div>
          <label style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", color: "rgba(255,255,255,0.4)", display: "block", marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Worldwide turnover (€M)
          </label>
          <input
            value={turnoverM}
            onChange={(e) => setTurnoverM(e.target.value.replace(/[^0-9.]/g, ""))}
            placeholder="e.g. 250"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 8, padding: "9px 12px", color: "#e8eaf0", fontSize: 13, width: 140 }}
          />
        </div>
        <button
          onClick={() => setIsSme((v) => !v)}
          style={{
            padding: "9px 14px", borderRadius: 8, fontSize: 12, cursor: "pointer",
            border: `1px solid ${isSme ? "#4f7cff" : "rgba(255,255,255,0.1)"}`,
            background: isSme ? "rgba(79,124,255,0.12)" : "transparent",
            color: isSme ? "#4f7cff" : "rgba(255,255,255,0.5)",
            fontFamily: "var(--font-mono), monospace",
          }}
        >
          {isSme ? "✓ " : ""}SME / start-up
        </button>
        <button
          onClick={addObligation}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8, padding: "9px 16px", fontSize: 13, fontWeight: 600, color: "#fff", background: "#4f7cff", border: "none", borderRadius: 8, cursor: "pointer" }}
        >
          <Plus size={15} /> Add obligation
        </button>
      </div>

      {/* Obligation editor */}
      {assessments.length > 0 && (
        <div style={{ marginBottom: 24, display: "flex", flexDirection: "column", gap: 8 }}>
          {assessments.map((a) => {
            const regime = COMPLIANCE_REGIMES.find((r) => r.code === a.regimeCode);
            return (
              <div key={a.obligationId} style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                <select
                  value={a.regimeCode}
                  onChange={(e) => {
                    const reg = COMPLIANCE_REGIMES.find((r) => r.code === e.target.value);
                    updateObligation(a.obligationId, { regimeCode: e.target.value, tierCode: reg?.tiers[0]?.code });
                  }}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e8eaf0", fontSize: 12, width: 150 }}
                >
                  {COMPLIANCE_REGIMES.map((r) => <option key={r.code} value={r.code} style={{ background: "#0d1b35" }}>{r.name}</option>)}
                </select>
                <input
                  value={a.label}
                  onChange={(e) => updateObligation(a.obligationId, { label: e.target.value })}
                  placeholder="Obligation (e.g. Art. 9 risk management)"
                  style={{ flex: 1, minWidth: 180, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e8eaf0", fontSize: 12 }}
                />
                {regime && regime.tiers.length > 0 && (
                  <select
                    value={a.tierCode ?? ""}
                    onChange={(e) => updateObligation(a.obligationId, { tierCode: e.target.value })}
                    style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e8eaf0", fontSize: 12, width: 160 }}
                  >
                    {regime.tiers.map((t) => <option key={t.code} value={t.code} style={{ background: "#0d1b35" }}>{t.label}</option>)}
                  </select>
                )}
                <select
                  value={a.force}
                  onChange={(e) => updateObligation(a.obligationId, { force: e.target.value as ObligationForce })}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e8eaf0", fontSize: 12, width: 150 }}
                >
                  {FORCE_OPTIONS.map((f) => <option key={f.value} value={f.value} style={{ background: "#0d1b35" }}>{f.label}</option>)}
                </select>
                <select
                  value={a.status}
                  onChange={(e) => updateObligation(a.obligationId, { status: e.target.value as ObligationStatus })}
                  style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 6, padding: "8px 10px", color: "#e8eaf0", fontSize: 12, width: 110 }}
                >
                  {STATUS_OPTIONS.map((st) => <option key={st.value} value={st.value} style={{ background: "#0d1b35" }}>{st.label}</option>)}
                </select>
                <button onClick={() => removeObligation(a.obligationId)} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.3)", cursor: "pointer", padding: 6 }}>
                  <Trash2 size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 6, marginBottom: 20, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                fontSize: 13, fontWeight: 600, cursor: "pointer",
                background: "none", border: "none",
                borderBottom: `2px solid ${active ? "#4f7cff" : "transparent"}`,
                color: active ? "#e8eaf0" : "rgba(255,255,255,0.4)",
                marginBottom: -1,
              }}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {assessments.length === 0 ? (
        <div style={{ padding: "48px 32px", textAlign: "center", color: "rgba(255,255,255,0.4)", fontSize: 13, border: "1px dashed rgba(255,255,255,0.1)", borderRadius: 12 }}>
          Add obligations across AI Act, GDPR, NIS2, DORA, CRA or ISO 42001 to build the compliance genome.
        </div>
      ) : (
        <>
          {tab === "genome" && <ComplianceGenome scores={scores} />}
          {tab === "fine" && <RiskToFine exposures={exposures} />}
          {tab === "board" && <BoardMode summary={board} scores={scores} />}
        </>
      )}
    </div>
  );
}
