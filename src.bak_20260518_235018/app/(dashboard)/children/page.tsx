"use client";

import { useEffect, useState } from "react";
import { Baby, AlertTriangle, Scale, ShieldAlert, ExternalLink, BookOpen, Filter } from "lucide-react";
import { cn } from "@/lib/utils";
import { GdprAgeMap } from "@/components/children/gdpr-age-map";
import { DOMAIN_LABELS, LEGAL_LABELS } from "@/types/children";
import type { ChildrenIncident, ChildrenCountryProfile, ChildrenRiskLevel } from "@/types/children";

const COUNTRIES = [
  { code: "AT", name: "Austria" }, { code: "BE", name: "Belgium" }, { code: "BG", name: "Bulgaria" },
  { code: "HR", name: "Croatia" }, { code: "CY", name: "Cyprus" }, { code: "CZ", name: "Czechia" },
  { code: "DK", name: "Denmark" }, { code: "EE", name: "Estonia" }, { code: "FI", name: "Finland" },
  { code: "FR", name: "France" }, { code: "DE", name: "Germany" }, { code: "GR", name: "Greece" },
  { code: "HU", name: "Hungary" }, { code: "IE", name: "Ireland" }, { code: "IT", name: "Italy" },
  { code: "LV", name: "Latvia" }, { code: "LT", name: "Lithuania" }, { code: "LU", name: "Luxembourg" },
  { code: "MT", name: "Malta" }, { code: "NL", name: "Netherlands" }, { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" }, { code: "RO", name: "Romania" }, { code: "SK", name: "Slovakia" },
  { code: "SI", name: "Slovenia" }, { code: "ES", name: "Spain" }, { code: "SE", name: "Sweden" },
];

const LEGAL_REFS = [
  { code: "DSA Art.28", title: "Protection of minors online", severity: "critical" as ChildrenRiskLevel, deadline: "Feb 2024", obligation: "VLOPs must not serve profiling-based ads to minors. Risk assessments must address children specifically." },
  { code: "DSA Art.39", title: "Non-profiled recommender systems", severity: "high" as ChildrenRiskLevel, deadline: "Feb 2024", obligation: "VLOPs must offer at least one recommender option not based on profiling. Minors get non-profiled feeds by default." },
  { code: "GDPR Art.8", title: "Consent age for data processing", severity: "critical" as ChildrenRiskLevel, deadline: "Applicable — enforcement ramping", obligation: "Processing children's data for digital services requires parental consent below national threshold (13–16 per MS)." },
  { code: "GDPR Art.22", title: "Automated decision-making & profiling", severity: "high" as ChildrenRiskLevel, deadline: "EDPB Guidelines 05/2022", obligation: "Minors must not be subject to solely automated decisions with significant effects without explicit consent." },
  { code: "AI Act Annex III", title: "High-risk AI in education", severity: "critical" as ChildrenRiskLevel, deadline: "Aug 2, 2026", obligation: "AI systems monitoring students' emotional state or behavior in education contexts are high-risk. FRIA required before deployment." },
  { code: "AI Act Art.9", title: "Risk management — vulnerable groups", severity: "high" as ChildrenRiskLevel, deadline: "Aug 2, 2026", obligation: "Risk management for high-risk AI must specifically address risks to children and other vulnerable persons." },
];

const SEV_STYLE: Record<ChildrenRiskLevel, string> = {
  critical: "text-danger bg-danger-soft border-danger/40",
  high:     "text-gold bg-gold-soft border-gold/40",
  medium:   "text-accent bg-accent-soft border-accent/30",
  low:      "text-success bg-success-soft border-success/30",
};

const DSACOMP: Record<string, string> = {
  compliant:     "text-success bg-success-soft border-success/30",
  partial:       "text-gold bg-gold-soft border-gold/40",
  non_compliant: "text-danger bg-danger-soft border-danger/40",
  unknown:       "text-text-dim bg-surface-2 border-border",
};

const DSACOMP_LABELS: Record<string, string> = {
  compliant: "DSA compliant", partial: "Partial", non_compliant: "Non-compliant", unknown: "Unknown",
};

interface ApiData {
  incidents: ChildrenIncident[];
  profiles: ChildrenCountryProfile[];
  stats: { total_incidents: number; critical: number; high: number; countries_affected: number; total_fines_eur: number };
}

export default function ChildrenPage() {
  const [data, setData] = useState<ApiData | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch(country ? `/api/children?country=${country}` : "/api/children")
      .then((r) => r.json())
      .then((d) => { setData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [country]);

  const profile = data?.profiles[0];
  const incidents = data?.incidents ?? [];

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Baby className="w-5 h-5 text-accent" />
            <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold">
              Children&apos;s Digital Rights
            </h1>
          </div>
          <p className="text-sm text-text-muted">DSA · GDPR Art. 8 · AI Act Annex III — monitoring violations and risk across EU27</p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded border text-xs font-medium font-mono text-danger bg-danger-soft border-danger/20">
          <AlertTriangle className="w-3 h-3" />
          7 documented cases · €410M+ fines
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Documented incidents", value: "7",     color: "text-danger" },
          { label: "Countries affected",   value: "6",     color: "text-gold" },
          { label: "Total fines issued",   value: "€410M+",color: "text-accent" },
          { label: "Legal frameworks",     value: "6",     color: "text-success" },
        ].map((s) => (
          <div key={s.label} className="bg-surface border border-border rounded-lg p-4">
            <p className={cn("text-2xl font-bold font-mono", s.color)}>{s.value}</p>
            <p className="text-xs text-text-dim mt-1 font-mono uppercase tracking-wider">{s.label}</p>
          </div>
        ))}
      </div>

      {/* GDPR AGE MAP */}
      <GdprAgeMap selectedCountry={country} onSelect={setCountry} />

      {/* LEGAL FRAMEWORK */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Scale className="w-4 h-4 text-accent" />
          <span className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">Applicable legal framework</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {LEGAL_REFS.map((ref) => (
            <div key={ref.code} className="bg-surface border border-border rounded-lg p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <span className="text-xs font-bold font-mono text-accent">{ref.code}</span>
                  <p className="text-sm font-semibold text-text mt-0.5">{ref.title}</p>
                </div>
                <span className={cn("px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-wide flex-shrink-0", SEV_STYLE[ref.severity])}>
                  {ref.severity}
                </span>
              </div>
              <p className="text-sm text-text-muted leading-relaxed mb-2">{ref.obligation}</p>
              <p className="text-xs text-text-dim font-mono">{ref.deadline}</p>
            </div>
          ))}
        </div>
      </div>

      {/* FILTER */}
      <div className="flex items-center gap-3 p-4 bg-surface border border-border rounded-lg flex-wrap">
        <Filter className="w-4 h-4 text-text-muted flex-shrink-0" />
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="flex-1 min-w-[160px] px-3 py-2 bg-bg border border-border rounded text-sm text-text focus:outline-none focus:border-accent transition-colors"
        >
          <option value="">All countries</option>
          {COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}
        </select>
        {country && (
          <button onClick={() => setCountry("")} className="px-3 py-2 text-sm text-text-muted hover:text-text border border-border rounded transition-colors">
            Reset
          </button>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">

        {/* LEFT — incidents */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-gold" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">
              Documented violations{country ? ` — ${COUNTRIES.find((c) => c.code === country)?.name}` : ""}
            </h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="w-5 h-5 border-2 border-accent border-t-transparent rounded-full animate-spin" />
            </div>
          ) : incidents.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-8 text-center">
              <Baby className="w-8 h-8 text-text-dim mx-auto mb-3" />
              <p className="text-sm text-text-muted">No documented violations for this filter.</p>
            </div>
          ) : (
            incidents.map((inc) => (
              <div key={inc.id} className="bg-surface border border-border hover:border-border-accent rounded-lg p-4 transition-colors space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-lg leading-none mt-0.5 flex-shrink-0">{inc.flag}</span>
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-text leading-snug">{inc.title}</p>
                      {inc.platform && <p className="text-xs text-text-dim mt-0.5 font-mono">{inc.platform}</p>}
                    </div>
                  </div>
                  <span className={cn("px-2 py-0.5 rounded border text-xs font-bold uppercase tracking-wide flex-shrink-0", SEV_STYLE[inc.severity])}>
                    {inc.severity}
                  </span>
                </div>

                <p className="text-sm text-text-muted leading-relaxed">{inc.summary}</p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs px-2 py-0.5 bg-surface-2 border border-border rounded text-text-dim font-mono">
                    {DOMAIN_LABELS[inc.domain]}
                  </span>
                  {inc.legalBases.map((lb) => {
                    const meta = LEGAL_LABELS[lb];
                    return (
                      <span key={lb} className="text-xs px-2 py-0.5 rounded border font-mono" style={{ color: meta.color, background: `${meta.color}18`, borderColor: `${meta.color}40` }}>
                        {meta.label}
                      </span>
                    );
                  })}
                </div>

                <div className="flex items-center justify-between flex-wrap gap-2">
                  <p className="text-xs text-gold font-mono">{inc.outcome}</p>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-text-dim font-mono">{inc.date}</span>
                    <a href={inc.url} target="_blank" rel="noopener noreferrer" className="text-text-dim hover:text-accent transition-colors">
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>
                <p className="text-xs text-text-dim font-mono">Source: {inc.source}</p>
              </div>
            ))
          )}

          {/* Country profile */}
          {profile && !loading && (
            <div className="bg-surface border border-border rounded-lg p-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">
                Country profile — {profile.countryName}
              </p>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-surface-2 border border-border rounded p-3">
                  <p className="text-xs text-text-dim font-mono mb-1">GDPR consent age</p>
                  <p className="text-lg font-bold text-text font-mono">{profile.gdprChildAgeConsent}</p>
                </div>
                <div className="bg-surface-2 border border-border rounded p-3">
                  <p className="text-xs text-text-dim font-mono mb-1">DSA status</p>
                  <span className={cn("px-2 py-0.5 rounded border text-xs font-medium", DSACOMP[profile.dsaComplianceStatus])}>
                    {DSACOMP_LABELS[profile.dsaComplianceStatus]}
                  </span>
                </div>
                <div className="bg-surface-2 border border-border rounded p-3">
                  <p className="text-xs text-text-dim font-mono mb-1">Risk score</p>
                  <p className="text-lg font-bold font-mono text-text">{profile.riskScore}<span className="text-xs text-text-dim">/100</span></p>
                </div>
              </div>
              <p className="text-xs text-text-dim font-mono">{profile.dsmaBodies.join(", ")}</p>
            </div>
          )}
        </div>

        {/* RIGHT — sources + roadmap */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-accent" />
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-dim font-mono">Key sources & reports</h2>
          </div>
          <div className="bg-surface border border-border rounded-lg p-4 space-y-2">
            {[
              { label: "DSA Delegated Regulation — VLOP risk assessments",       year: "2024", url: "https://digital-strategy.ec.europa.eu/en/policies/dsa-delegated-regulations" },
              { label: "EDPB Guidelines 05/2022 — facial recognition",           year: "2022", url: "https://edpb.europa.eu/our-work-tools/our-documents/guidelines/guidelines-052022_en" },
              { label: "EDPB Opinion 8/2024 — valid consent, children",          year: "2024", url: "https://edpb.europa.eu/our-work-tools/our-documents/opinion-board-art-64/opinion-82024_en" },
              { label: "FRA — Children's rights and digital environment",        year: "2023", url: "https://fra.europa.eu/en/publication/2023/childrens-rights-digital-environment" },
              { label: "UNICEF — Policy guidance on AI for children",            year: "2021", url: "https://www.unicef.org/globalinsight/reports/policy-guidance-ai-children" },
              { label: "AI Act — Recitals on children and vulnerable groups",    year: "2024", url: "https://eur-lex.europa.eu/legal-content/EN/TXT/?uri=CELEX:32024R1689" },
              { label: "5rights Foundation — Children's Code resources",         year: "2024", url: "https://5rightsfoundation.com/" },
            ].map((src) => (
              <a key={src.label} href={src.url} target="_blank" rel="noopener noreferrer"
                className="flex items-center justify-between group hover:text-accent transition-colors py-1 border-b border-border last:border-0">
                <span className="text-sm text-text-muted group-hover:text-accent transition-colors">{src.label}</span>
                <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                  <span className="text-xs text-text-dim font-mono">{src.year}</span>
                  <ExternalLink className="w-3 h-3 text-text-dim group-hover:text-accent" />
                </div>
              </a>
            ))}
          </div>

          <div className="bg-gold-soft border border-gold/20 rounded-lg p-4">
            <p className="text-xs font-bold text-gold font-mono uppercase tracking-wider mb-2">Sprint 7 — coming next</p>
            <ul className="space-y-1.5">
              {[
                "AI in education risk scorer — per system, per country",
                "DSA VLOP tracker — 19 designated platforms",
                "Parental consent mechanism audit tool",
                "Children's FRIA template — AI Act Annex III education",
              ].map((item) => (
                <li key={item} className="text-xs text-gold/80 flex items-start gap-2">
                  <span className="text-gold/40 flex-shrink-0 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
