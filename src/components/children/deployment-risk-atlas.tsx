"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, GraduationCap, FileCheck, ExternalLink, Users, AlertOctagon, ShieldCheck } from "lucide-react";

interface AtlasSystem {
  id: string;
  country_code: string;
  system_name: string;
  vendor: string | null;
  deployment_scope: string;
  students_affected: number | null;
  ai_features: string[];
  annex3_categories: string[];
  risk_tier: string;
  legal_status: string | null;
  source_url: string | null;
  description: string;
  last_verified: string;
  legal_age_consent: number | null;
  risk_score: number;
  fria_required: boolean;
  fria_rationale: string;
}

interface AtlasResponse {
  systems: AtlasSystem[];
  summary: {
    total: number;
    annex3_count: number;
    fria_required_count: number;
    countries: number;
    students_total: number;
  } | null;
  generated_at: string;
}

const FLAGS: Record<string, string> = {
  AT:"🇦🇹",BE:"🇧🇪",BG:"🇧🇬",HR:"🇭🇷",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",EE:"🇪🇪",FI:"🇫🇮",FR:"🇫🇷",
  DE:"🇩🇪",GR:"🇬🇷",HU:"🇭🇺",IE:"🇮🇪",IT:"🇮🇹",LV:"🇱🇻",LT:"🇱🇹",LU:"🇱🇺",MT:"🇲🇹",NL:"🇳🇱",
  PL:"🇵🇱",PT:"🇵🇹",RO:"🇷🇴",SK:"🇸🇰",SI:"🇸🇮",ES:"🇪🇸",SE:"🇸🇪",
};

const TIER_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  annex3:     { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  label: "Annex III" },
  prohibited: { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  label: "Prohibited" },
  limited:    { bg: "var(--color-gold-soft)",    text: "var(--color-gold)",    label: "Limited" },
  minimal:    { bg: "var(--color-success-soft)", text: "var(--color-success)", label: "Minimal" },
  unknown:    { bg: "var(--color-surface-2)",    text: "var(--color-text-dim)",label: "Unknown" },
};

export function DeploymentRiskAtlas() {
  const [data, setData] = useState<AtlasResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/atlas", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: AtlasResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>;
  }

  if (!data || !data.summary || data.systems.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No EdTech systems mapped yet.</p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">Run the edtech seed to populate the national deployment atlas.</p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <KpiCard icon={GraduationCap} accent="var(--color-accent)" value={s.total} label="Systems mapped" sub={`${s.countries} countries`} />
        <KpiCard icon={AlertOctagon} accent="var(--color-danger)" value={s.annex3_count} label="Annex III high-risk" sub="AI Act point 3" />
        <KpiCard icon={FileCheck} accent="var(--color-gold)" value={s.fria_required_count} label="FRIA required" sub="Art. 27 mandatory" />
        <KpiCard icon={Users} accent="var(--color-purple)" value={s.students_total > 0 ? s.students_total.toLocaleString() : "—"} label="Students affected" sub="where reported" />
      </div>

      <div className="space-y-3">
        {data.systems.map((sys) => {
          const tier = TIER_STYLE[sys.risk_tier] ?? TIER_STYLE.unknown;
          const friaHref = `/assessments/new?system=${encodeURIComponent(sys.system_name)}&country=${sys.country_code}&tier=${sys.risk_tier}&edtechId=${encodeURIComponent(sys.id)}`;
          return (
            <div key={sys.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors">
              <div className="flex items-start gap-4">
                <RiskDial score={sys.risk_score} />

                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span className="text-base">{FLAGS[sys.country_code] ?? sys.country_code}</span>
                    <span className="text-sm font-semibold text-[var(--color-text)]">{sys.system_name}</span>
                    <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded" style={{ background: tier.bg, color: tier.text }}>{tier.label}</span>
                    <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{sys.deployment_scope}</span>
                  </div>
                  {sys.vendor && <div className="text-[11px] text-[var(--color-text-dim)] mb-1">{sys.vendor}</div>}
                  <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-2 line-clamp-2">{sys.description}</p>

                  <div className="flex flex-wrap gap-1 mb-2">
                    {sys.ai_features.map((f) => (
                      <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{f.replace(/_/g, " ")}</span>
                    ))}
                    {sys.annex3_categories.map((c) => (
                      <span key={c} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-danger-soft)] text-[var(--color-danger)]">{c.replace(/_/g, " ")}</span>
                    ))}
                  </div>

                  <div className={`flex items-start gap-2 text-[11px] mb-3 px-2.5 py-1.5 rounded ${sys.fria_required ? "bg-[var(--color-danger-soft)]/40 text-[var(--color-text-muted)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-dim)]"}`}>
                    {sys.fria_required ? <AlertOctagon className="w-3.5 h-3.5 text-[var(--color-danger)] mt-0.5 shrink-0" /> : <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-text-dim)] mt-0.5 shrink-0" />}
                    <span>{sys.fria_rationale}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href={friaHref}
                      className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent)]/90 transition-colors"
                    >
                      <FileCheck className="w-3.5 h-3.5" />
                      Generate FRIA
                    </Link>
                    {sys.source_url && (
                      <a href={sys.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline">
                        Source <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                    {sys.legal_age_consent !== null && (
                      <span className="text-[11px] text-[var(--color-text-dim)]">Local consent age: {sys.legal_age_consent}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-[11px] text-[var(--color-text-dim)] pt-1">
        Risk score = deployment scope × AI feature sensitivity × Annex III classification × legal status. Generated {new Date(data.generated_at).toLocaleString("en-GB")}.
      </p>
    </div>
  );
}

function KpiCard({ icon: Icon, accent, value, label, sub }: { icon: typeof GraduationCap; accent: string; value: number | string; label: string; sub: string }) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="flex items-center gap-2 mb-2">
        <Icon className="w-4 h-4" style={{ color: accent }} />
        <span className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wide">{label}</span>
      </div>
      <div className="text-2xl font-semibold text-[var(--color-text)]">{value}</div>
      <div className="text-[11px] text-[var(--color-text-muted)]">{sub}</div>
    </div>
  );
}

function RiskDial({ score }: { score: number }) {
  const color = score >= 70 ? "var(--color-danger)" : score >= 40 ? "var(--color-gold)" : "var(--color-success)";
  const circumference = 2 * Math.PI * 26;
  const offset = circumference - (score / 100) * circumference;
  return (
    <div className="relative w-16 h-16 shrink-0">
      <svg viewBox="0 0 64 64" className="w-16 h-16 -rotate-90">
        <circle cx="32" cy="32" r="26" fill="none" stroke="var(--color-surface-3)" strokeWidth="5" />
        <circle cx="32" cy="32" r="26" fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-base font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[8px] uppercase tracking-wider text-[var(--color-text-dim)]">risk</span>
      </div>
    </div>
  );
}
