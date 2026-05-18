"use client";

import { useState, useEffect } from "react";
import { Plus, Cpu, Trash2, AlertTriangle, FileCheck, X, Loader2, ChevronRight, Shield, ChevronDown, ChevronUp } from "lucide-react";
import Link from "next/link";

const RISK_CATEGORIES = [
  { value: "biometrics",               label: "Biometrics" },
  { value: "critical_infrastructure",  label: "Critical Infrastructure" },
  { value: "education",                label: "Education" },
  { value: "employment",               label: "Employment & HR" },
  { value: "essential_services",       label: "Essential Services" },
  { value: "law_enforcement",          label: "Law Enforcement" },
  { value: "migration",                label: "Migration & Border" },
  { value: "justice",                  label: "Justice" },
];

const EU27 = ["AT","BE","BG","HR","CY","CZ","DK","EE","FI","FR","DE","GR","HU","IE","IT","LV","LT","LU","MT","NL","PL","PT","RO","SK","SI","ES","SE"];
const EU27_NAMES: Record<string, string> = {
  AT:"Austria",BE:"Belgium",BG:"Bulgaria",HR:"Croatia",CY:"Cyprus",CZ:"Czechia",
  DK:"Denmark",EE:"Estonia",FI:"Finland",FR:"France",DE:"Germany",GR:"Greece",
  HU:"Hungary",IE:"Ireland",IT:"Italy",LV:"Latvia",LT:"Lithuania",LU:"Luxembourg",
  MT:"Malta",NL:"Netherlands",PL:"Poland",PT:"Portugal",RO:"Romania",SK:"Slovakia",
  SI:"Slovenia",ES:"Spain",SE:"Sweden",
};

interface AiSystem {
  id: string;
  name: string;
  description: string | null;
  provider: string | null;
  version: string | null;
  riskCategory: string | null;
  deploymentCountries: string[];
  intendedPurpose: string | null;
  isHighRisk: boolean;
  requiresFria: boolean;
  createdAt: string;
}

const inputStyle = {
  width: "100%", padding: "12px 16px",
  background: "#071525", border: "1px solid #1e3a5f", borderRadius: 8,
  color: "#e8eaf0", fontSize: 14, fontFamily: "inherit", outline: "none",
  boxSizing: "border-box" as const,
};

const labelStyle = {
  display: "block", fontSize: 11, fontWeight: 600,
  letterSpacing: "0.12em", color: "#4a7fa5", marginBottom: 8,
  textTransform: "uppercase" as const, fontFamily: "var(--font-mono)",
};

const SEVERITY_STYLES: Record<string, { bg: string; border: string; text: string; label: string }> = {
  critical: { bg: "rgba(255,92,92,0.08)", border: "rgba(255,92,92,0.3)", text: "#ff5c5c", label: "CRITICAL" },
  elevated: { bg: "rgba(232,184,75,0.08)", border: "rgba(232,184,75,0.3)", text: "#e8b84b", label: "ELEVATED" },
  watch: { bg: "rgba(79,124,255,0.08)", border: "rgba(79,124,255,0.3)", text: "#4f7cff", label: "WATCH" },
};

const GROUP_LABELS_SHORT: Record<string, string> = {
  african_descent: "African descent", roma: "Roma", muslims: "Muslims",
  lgbtiq: "LGBTIQ", women: "Women", disabilities: "Disabilities",
  migrants: "Migrants", jews: "Jewish people", general: "General",
};

interface CrossRef {
  systemId: string;
  systemName: string;
  country: string;
  sector: string;
  signals: { group_id: string; title: string; severity: string; value_observed: number | null; value_eu_avg: number | null; year_observed: number | null; source_label: string | null }[];
  convergenceScore: number;
  maxSeverity: string;
  recommendation: string;
}

function CrossRefPanel({ systems }: { systems: AiSystem[] }) {
  const [crossRefs, setCrossRefs] = useState<CrossRef[]>([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});

  async function loadCrossRefs() {
    setLoading(true);
    try {
      const res = await fetch("/api/systems/cross-ref");
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCrossRefs(data.crossRefs ?? []);
    } catch { setCrossRefs([]); }
    finally { setLoading(false); setLoaded(true); }
  }

  useEffect(() => { if (systems.length > 0) loadCrossRefs(); }, [systems.length]);

  if (!loaded && !loading) return null;

  const criticalCount = crossRefs.filter((r) => r.maxSeverity === "critical").length;
  const elevatedCount = crossRefs.filter((r) => r.maxSeverity === "elevated").length;

  return (
    <div style={{ marginTop: 32 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div style={{ width: 36, height: 36, borderRadius: 10, background: "rgba(232,184,75,0.12)", border: "1px solid rgba(232,184,75,0.3)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Shield style={{ width: 18, height: 18, color: "#e8b84b" }} />
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0", margin: 0 }}>
              Discrimination Context — AI × Rights Cross-Reference
            </h2>
            <p style={{ fontSize: 12, color: "#4a7fa5", margin: 0, fontFamily: "var(--font-mono)" }}>
              Your AI systems matched against FRA discrimination data in deployment countries
            </p>
          </div>
        </div>
        {crossRefs.length > 0 && (
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span style={{ padding: "4px 12px", background: SEVERITY_STYLES.critical.bg, border: `1px solid ${SEVERITY_STYLES.critical.border}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: SEVERITY_STYLES.critical.text, letterSpacing: "0.06em" }}>
                {criticalCount} critical
              </span>
            )}
            {elevatedCount > 0 && (
              <span style={{ padding: "4px 12px", background: SEVERITY_STYLES.elevated.bg, border: `1px solid ${SEVERITY_STYLES.elevated.border}`, borderRadius: 6, fontSize: 12, fontWeight: 700, color: SEVERITY_STYLES.elevated.text, letterSpacing: "0.06em" }}>
                {elevatedCount} elevated
              </span>
            )}
          </div>
        )}
      </div>

      {loading && (
        <div style={{ background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <Loader2 style={{ width: 20, height: 20, color: "#4f7cff" }} className="animate-spin mx-auto mb-2" />
          <p style={{ fontSize: 13, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>Cross-referencing AI systems with discrimination signals…</p>
        </div>
      )}

      {loaded && crossRefs.length === 0 && !loading && (
        <div style={{ background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 12, padding: 32, textAlign: "center" }}>
          <p style={{ fontSize: 14, color: "#8ba8c8" }}>No discrimination signals found for your deployment countries and sectors.</p>
        </div>
      )}

      {loaded && crossRefs.length > 0 && (
        <div className="space-y-2">
          {crossRefs.map((ref, idx) => {
            const key = `${ref.systemId}-${ref.country}`;
            const sev = SEVERITY_STYLES[ref.maxSeverity] ?? SEVERITY_STYLES.watch;
            const isExpanded = expanded[key];
            const groups = [...new Set(ref.signals.map((s) => s.group_id))];

            return (
              <div key={key} style={{ background: "#0f2040", border: `1px solid ${sev.border}`, borderRadius: 12, overflow: "hidden", cursor: "pointer" }} onClick={() => setExpanded((e) => ({ ...e, [key]: !e[key] }))}>
                <div style={{ height: 2, background: sev.text }} />
                <div style={{ padding: "16px 20px" }}>
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 flex-wrap min-w-0">
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, fontWeight: 700, color: "#e8eaf0" }}>{ref.country}</span>
                      <span style={{ padding: "2px 10px", background: sev.bg, border: `1px solid ${sev.border}`, borderRadius: 6, fontSize: 11, fontWeight: 700, color: sev.text, letterSpacing: "0.08em" }}>
                        {sev.label}
                      </span>
                      <span style={{ fontSize: 12, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>{ref.systemName}</span>
                      <span style={{ fontSize: 12, color: "#4a7fa5" }}>·</span>
                      {groups.map((g) => (
                        <span key={g} style={{ fontSize: 12, padding: "2px 8px", background: "#071525", border: "1px solid #1e3a5f", borderRadius: 4, color: "#8ba8c8", fontFamily: "var(--font-mono)" }}>
                          {GROUP_LABELS_SHORT[g] ?? g}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <span style={{ fontSize: 12, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>{ref.signals.length} signals</span>
                      {isExpanded ? <ChevronUp style={{ width: 16, height: 16, color: "#4a7fa5" }} /> : <ChevronDown style={{ width: 16, height: 16, color: "#4a7fa5" }} />}
                    </div>
                  </div>

                  {!isExpanded && (
                    <p style={{ fontSize: 13, color: "#8ba8c8", marginTop: 8, lineHeight: 1.5 }}>
                      {ref.recommendation}
                    </p>
                  )}
                </div>

                {isExpanded && (
                  <div style={{ borderTop: "1px solid #1e3a5f", padding: "16px 20px" }}>
                    <div style={{ padding: "12px 16px", background: sev.bg, border: `1px solid ${sev.border}`, borderRadius: 8, marginBottom: 16 }}>
                      <p style={{ fontSize: 13, color: sev.text, lineHeight: 1.6, fontWeight: 500 }}>
                        {ref.recommendation}
                      </p>
                    </div>

                    <div className="space-y-3">
                      {ref.signals.map((sig, i) => {
                        const sigSev = SEVERITY_STYLES[sig.severity] ?? SEVERITY_STYLES.watch;
                        const delta = sig.value_observed != null && sig.value_eu_avg != null
                          ? Math.round((sig.value_observed - sig.value_eu_avg) * 10) / 10 : null;
                        return (
                          <div key={i} className="flex items-start gap-3">
                            <span style={{ width: 8, height: 8, borderRadius: "50%", background: sigSev.text, marginTop: 6, flexShrink: 0 }} />
                            <div style={{ minWidth: 0 }}>
                              <p style={{ fontSize: 13, color: "#e8eaf0", lineHeight: 1.5 }}>{sig.title}</p>
                              <div className="flex items-center gap-3 mt-1 flex-wrap">
                                {delta !== null && (
                                  <span style={{ fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, color: delta > 0 ? "#ff5c5c" : "#4ade80" }}>
                                    {delta > 0 ? "+" : ""}{delta}pp vs EU
                                  </span>
                                )}
                                {sig.source_label && (
                                  <span style={{ fontSize: 11, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>{sig.source_label}</span>
                                )}
                                {sig.year_observed && (
                                  <span style={{ fontSize: 11, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>{sig.year_observed}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function SystemsPage() {
  const [systems, setSystems] = useState<AiSystem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "", description: "", provider: "", version: "",
    riskCategory: "", intendedPurpose: "", deploymentCountries: [] as string[],
  });

  useEffect(() => { fetchSystems(); }, []);

  async function fetchSystems() {
    setLoading(true);
    try {
      const res = await fetch("/api/systems");
      const data = await res.json();
      setSystems(data.systems ?? []);
    } catch { setSystems([]); }
    finally { setLoading(false); }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim()) { setError("Name is required"); return; }
    setSaving(true); setError("");
    try {
      const res = await fetch("/api/systems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error((await res.json()).error ?? "Failed");
      setShowModal(false);
      setForm({ name: "", description: "", provider: "", version: "", riskCategory: "", intendedPurpose: "", deploymentCountries: [] });
      fetchSystems();
    } catch (e: any) { setError(e.message); }
    finally { setSaving(false); }
  }

  async function handleDelete(id: string) {
    if (!confirm("Archive this system?")) return;
    await fetch(`/api/systems/${id}`, { method: "DELETE" });
    fetchSystems();
  }

  function toggleCountry(code: string) {
    setForm(f => ({
      ...f,
      deploymentCountries: f.deploymentCountries.includes(code)
        ? f.deploymentCountries.filter(c => c !== code)
        : [...f.deploymentCountries, code],
    }));
  }

  const isHighRisk = RISK_CATEGORIES.slice(0, 8).map(c => c.value).includes(form.riskCategory);

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, color: "#e8eaf0", marginBottom: 6 }}>AI Systems</h1>
          <p style={{ fontSize: 15, color: "#8ba8c8" }}>Register and classify your AI systems under the EU AI Act</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 20px", background: "#4f7cff", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
        >
          <Plus style={{ width: 16, height: 16 }} /> Add system
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px 0" }}>
          <Loader2 style={{ width: 32, height: 32, color: "#4a7fa5", margin: "0 auto" }} className="animate-spin" />
        </div>
      ) : systems.length === 0 ? (
        <div style={{ background: "#0f2040", border: "1px solid #1e3a5f", borderRadius: 14, padding: "64px 36px", textAlign: "center" }}>
          <Cpu style={{ width: 48, height: 48, color: "#2a5080", margin: "0 auto 20px" }} />
          <h2 style={{ fontSize: 20, fontWeight: 600, color: "#e8eaf0", marginBottom: 10 }}>No systems registered</h2>
          <p style={{ fontSize: 15, color: "#4a7fa5", maxWidth: 460, margin: "0 auto 28px", lineHeight: 1.7 }}>
            Register your AI systems to identify which ones fall under Annex III high-risk categories and require a Fundamental Rights Impact Assessment.
          </p>
          <button
            onClick={() => setShowModal(true)}
            style={{ display: "inline-flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#4f7cff", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: "pointer" }}
          >
            <Plus style={{ width: 16, height: 16 }} /> Register first system
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {systems.map((system) => (
            <div key={system.id} style={{ background: "#0f2040", border: `1px solid ${system.isHighRisk ? "rgba(255,92,92,0.3)" : "#1e3a5f"}`, borderRadius: 12, padding: "20px 24px" }}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-start gap-4 min-w-0">
                  <div style={{ width: 40, height: 40, borderRadius: 10, background: system.isHighRisk ? "rgba(255,92,92,0.1)" : "rgba(79,124,255,0.1)", border: `1px solid ${system.isHighRisk ? "rgba(255,92,92,0.3)" : "rgba(79,124,255,0.3)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <Cpu style={{ width: 18, height: 18, color: system.isHighRisk ? "#ff5c5c" : "#4f7cff" }} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <h3 style={{ fontSize: 16, fontWeight: 600, color: "#e8eaf0" }}>{system.name}</h3>
                      {system.isHighRisk && (
                        <span style={{ padding: "2px 10px", background: "rgba(255,92,92,0.1)", border: "1px solid rgba(255,92,92,0.3)", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#ff5c5c", letterSpacing: "0.08em" }}>
                          ANNEX III HIGH-RISK
                        </span>
                      )}
                      {system.requiresFria && (
                        <span style={{ padding: "2px 10px", background: "rgba(232,184,75,0.1)", border: "1px solid rgba(232,184,75,0.3)", borderRadius: 6, fontSize: 11, fontWeight: 700, color: "#e8b84b", letterSpacing: "0.08em" }}>
                          FRIA REQUIRED
                        </span>
                      )}
                    </div>
                    {system.description && <p style={{ fontSize: 14, color: "#8ba8c8", marginBottom: 8 }}>{system.description}</p>}
                    <div className="flex items-center gap-4 flex-wrap">
                      {system.riskCategory && <span style={{ fontSize: 12, color: "#4a7fa5", fontFamily: "var(--font-mono)" }}>{RISK_CATEGORIES.find(c => c.value === system.riskCategory)?.label ?? system.riskCategory}</span>}
                      {system.provider && <span style={{ fontSize: 12, color: "#4a7fa5" }}>{system.provider}{system.version ? ` v${system.version}` : ""}</span>}
                      {system.deploymentCountries?.length > 0 && <span style={{ fontSize: 12, color: "#4a7fa5" }}>{system.deploymentCountries.length} countries</span>}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {system.requiresFria && (
                    <Link href="/assessments/new" style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", background: "rgba(79,124,255,0.1)", border: "1px solid rgba(79,124,255,0.3)", borderRadius: 8, fontSize: 13, color: "#4f7cff", textDecoration: "none" }}>
                      <FileCheck style={{ width: 14, height: 14 }} /> Start FRIA
                    </Link>
                  )}
                  <button onClick={() => handleDelete(system.id)} style={{ padding: 8, background: "none", border: "1px solid #1e3a5f", borderRadius: 8, cursor: "pointer", color: "#4a7fa5", display: "flex" }}>
                    <Trash2 style={{ width: 14, height: 14 }} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── CROSS-REFERENCE PANEL ── */}
      {systems.length > 0 && <CrossRefPanel systems={systems} />}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(4px)" }} onClick={() => setShowModal(false)} />
          <div style={{ position: "relative", width: "100%", maxWidth: 560, maxHeight: "90vh", overflowY: "auto", background: "#0a1628", border: "1px solid #1e3a5f", borderRadius: 16 }}>
            <div style={{ padding: "24px 28px", borderBottom: "1px solid #1e3a5f", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 600, color: "#e8eaf0", marginBottom: 4 }}>Register AI System</h2>
                <p style={{ fontSize: 13, color: "#4a7fa5" }}>EU AI Act Article 27 — Annex III classification</p>
              </div>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#4a7fa5", padding: 4 }}>
                <X style={{ width: 20, height: 20 }} />
              </button>
            </div>

            <form onSubmit={handleSubmit} style={{ padding: "28px", display: "flex", flexDirection: "column", gap: 22 }}>
              <div>
                <label style={labelStyle}>System Name *</label>
                <input style={inputStyle} placeholder="e.g. Recruitment Screening Tool" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>

              <div>
                <label style={labelStyle}>Description</label>
                <textarea style={{ ...inputStyle, height: 80, resize: "none" }} placeholder="What does this system do?" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label style={labelStyle}>Provider</label>
                  <input style={inputStyle} placeholder="e.g. OpenAI, internal" value={form.provider} onChange={e => setForm(f => ({ ...f, provider: e.target.value }))} />
                </div>
                <div>
                  <label style={labelStyle}>Version</label>
                  <input style={inputStyle} placeholder="e.g. 2.1.0" value={form.version} onChange={e => setForm(f => ({ ...f, version: e.target.value }))} />
                </div>
              </div>

              <div>
                <label style={labelStyle}>Risk Category (Annex III)</label>
                <select style={inputStyle} value={form.riskCategory} onChange={e => setForm(f => ({ ...f, riskCategory: e.target.value }))}>
                  <option value="">Select category...</option>
                  {RISK_CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
                {isHighRisk && form.riskCategory && (
                  <div style={{ marginTop: 8, padding: "10px 14px", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.2)", borderRadius: 8, display: "flex", alignItems: "center", gap: 8 }}>
                    <AlertTriangle style={{ width: 14, height: 14, color: "#ff5c5c", flexShrink: 0 }} />
                    <p style={{ fontSize: 12, color: "#ff5c5c" }}>This system falls under Annex III — a FRIA will be required.</p>
                  </div>
                )}
              </div>

              <div>
                <label style={labelStyle}>Intended Purpose</label>
                <textarea style={{ ...inputStyle, height: 72, resize: "none" }} placeholder="Describe the intended use of this system" value={form.intendedPurpose} onChange={e => setForm(f => ({ ...f, intendedPurpose: e.target.value }))} />
              </div>

              <div>
                <label style={labelStyle}>Deployment Countries</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 4 }}>
                  {EU27.map(code => (
                    <button
                      key={code}
                      type="button"
                      onClick={() => toggleCountry(code)}
                      style={{
                        padding: "4px 10px", borderRadius: 6, fontSize: 12, cursor: "pointer",
                        background: form.deploymentCountries.includes(code) ? "rgba(79,124,255,0.2)" : "transparent",
                        border: `1px solid ${form.deploymentCountries.includes(code) ? "rgba(79,124,255,0.5)" : "#1e3a5f"}`,
                        color: form.deploymentCountries.includes(code) ? "#4f7cff" : "#4a7fa5",
                        fontFamily: "var(--font-mono)",
                      }}
                    >
                      {code}
                    </button>
                  ))}
                </div>
              </div>

              {error && (
                <div style={{ padding: "12px 16px", background: "rgba(255,92,92,0.08)", border: "1px solid rgba(255,92,92,0.25)", borderRadius: 8, color: "#ff5c5c", fontSize: 13 }}>
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
                <button type="button" onClick={() => setShowModal(false)} style={{ padding: "12px 20px", background: "none", border: "1px solid #1e3a5f", borderRadius: 8, color: "#8ba8c8", fontSize: 14, cursor: "pointer" }}>
                  Cancel
                </button>
                <button type="submit" disabled={saving} style={{ display: "flex", alignItems: "center", gap: 8, padding: "12px 24px", background: "#4f7cff", border: "none", borderRadius: 8, color: "#fff", fontSize: 14, fontWeight: 500, cursor: saving ? "not-allowed" : "pointer", opacity: saving ? 0.6 : 1 }}>
                  {saving ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" /> : <><Plus style={{ width: 16, height: 16 }} /> Register system</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
