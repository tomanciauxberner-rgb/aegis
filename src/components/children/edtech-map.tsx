"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import type { EdtechResponse, EdtechItem } from "@/types/children-ui";

const RISK_STYLES: Record<string, { bg: string; text: string; label: string }> = {
  annex3:     { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  label: "Annex III" },
  prohibited: { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  label: "Prohibited" },
  limited:    { bg: "var(--color-gold-soft)",    text: "var(--color-gold)",    label: "Limited risk" },
  minimal:    { bg: "var(--color-success-soft)", text: "var(--color-success)", label: "Minimal" },
  unknown:    { bg: "var(--color-surface-2)",    text: "var(--color-text-dim)",label: "Unknown" },
};

export function EdtechMap() {
  const [data, setData] = useState<EdtechResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>("");
  const [riskTier, setRiskTier] = useState<string>("");

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (riskTier) params.set("risk_tier", riskTier);

    fetch(`/api/children-v2/edtech?${params}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: EdtechResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData({ items: [], total: 0 }); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [country, riskTier]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <select
          value={country}
          onChange={(e) => setCountry(e.target.value)}
          className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All countries</option>
          {COUNTRIES_EU27.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
        </select>

        <select
          value={riskTier}
          onChange={(e) => setRiskTier(e.target.value)}
          className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]"
        >
          <option value="">All risk tiers</option>
          <option value="annex3">Annex III</option>
          <option value="prohibited">Prohibited</option>
          <option value="limited">Limited</option>
          <option value="minimal">Minimal</option>
          <option value="unknown">Unknown</option>
        </select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.items.map((s) => <EdtechCard key={s.id} s={s} />)}
        </div>
      )}
    </div>
  );
}

function EdtechCard({ s }: { s: EdtechItem }) {
  const risk = RISK_STYLES[s.riskTier] ?? RISK_STYLES.unknown;
  const country = COUNTRIES_EU27.find((c) => c.code === s.countryCode);

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors">
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base">{country?.flag}</span>
          <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider">{country?.name}</span>
          <span
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
            style={{ background: risk.bg, color: risk.text }}
          >
            {risk.label}
          </span>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)] whitespace-nowrap">
          {s.deploymentScope}
        </span>
      </div>

      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 leading-snug">{s.systemName}</h3>
      {s.vendor && <p className="text-[11px] text-[var(--color-text-dim)] mb-2">{s.vendor}</p>}
      <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">{s.description}</p>

      {(s.aiFeatures.length > 0 || s.annex3Categories.length > 0) && (
        <div className="space-y-1 mb-3">
          {s.aiFeatures.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {s.aiFeatures.map((f) => (
                <span key={f} className="text-[10px] px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
                  {f.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
          {s.annex3Categories.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {s.annex3Categories.map((c) => (
                <span key={c} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-danger-soft)] text-[var(--color-danger)]">
                  {c.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex items-center justify-between text-[11px] text-[var(--color-text-dim)]">
        <span>Verified: {new Date(s.lastVerified).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
        {s.sourceUrl && (
          <a
            href={s.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[var(--color-accent)] hover:underline"
          >
            Source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">No edtech systems match these filters.</p>
    </div>
  );
}

const COUNTRIES_EU27 = [
  { code: "AT", name: "Austria",     flag: "🇦🇹" }, { code: "BE", name: "Belgium",     flag: "🇧🇪" },
  { code: "BG", name: "Bulgaria",    flag: "🇧🇬" }, { code: "HR", name: "Croatia",     flag: "🇭🇷" },
  { code: "CY", name: "Cyprus",      flag: "🇨🇾" }, { code: "CZ", name: "Czechia",     flag: "🇨🇿" },
  { code: "DK", name: "Denmark",     flag: "🇩🇰" }, { code: "EE", name: "Estonia",     flag: "🇪🇪" },
  { code: "FI", name: "Finland",     flag: "🇫🇮" }, { code: "FR", name: "France",      flag: "🇫🇷" },
  { code: "DE", name: "Germany",     flag: "🇩🇪" }, { code: "GR", name: "Greece",      flag: "🇬🇷" },
  { code: "HU", name: "Hungary",     flag: "🇭🇺" }, { code: "IE", name: "Ireland",     flag: "🇮🇪" },
  { code: "IT", name: "Italy",       flag: "🇮🇹" }, { code: "LV", name: "Latvia",      flag: "🇱🇻" },
  { code: "LT", name: "Lithuania",   flag: "🇱🇹" }, { code: "LU", name: "Luxembourg",  flag: "🇱🇺" },
  { code: "MT", name: "Malta",       flag: "🇲🇹" }, { code: "NL", name: "Netherlands", flag: "🇳🇱" },
  { code: "PL", name: "Poland",      flag: "🇵🇱" }, { code: "PT", name: "Portugal",    flag: "🇵🇹" },
  { code: "RO", name: "Romania",     flag: "🇷🇴" }, { code: "SK", name: "Slovakia",    flag: "🇸🇰" },
  { code: "SI", name: "Slovenia",    flag: "🇸🇮" }, { code: "ES", name: "Spain",       flag: "🇪🇸" },
  { code: "SE", name: "Sweden",      flag: "🇸🇪" },
];
