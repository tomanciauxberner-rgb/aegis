"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Shield, ShieldAlert, ShieldX } from "lucide-react";
import type { AppsResponse, AppItem, ComplianceGap } from "@/types/children-ui";

const GAP_STYLES: Record<ComplianceGap, { bg: string; text: string; icon: typeof Shield; label: string }> = {
  ok:         { bg: "var(--color-success-soft)", text: "var(--color-success)", icon: Shield,      label: "OK" },
  borderline: { bg: "var(--color-gold-soft)",    text: "var(--color-gold)",    icon: ShieldAlert, label: "Borderline" },
  violation:  { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  icon: ShieldX,     label: "Gap" },
  unknown:    { bg: "var(--color-surface-2)",    text: "var(--color-text-dim)",icon: Shield,      label: "Unknown" },
};

const CATEGORIES = [
  { value: "", label: "All categories" },
  { value: "kids", label: "Kids" },
  { value: "social", label: "Social" },
  { value: "entertainment", label: "Entertainment" },
  { value: "games", label: "Games" },
];

export function AppRadar({ initialCountry }: { initialCountry?: string }) {
  const [data, setData] = useState<AppsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>(initialCountry ?? "");
  const [category, setCategory] = useState<string>("");
  const [vlopOnly, setVlopOnly] = useState<boolean>(false);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (category) params.set("category", category);
    if (vlopOnly) params.set("vlop_only", "true");
    params.set("limit", "60");

    fetch(`/api/children-v2/apps?${params}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: AppsResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData({ items: [], total: 0, observed_at: null }); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [country, category, vlopOnly]);

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
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]"
        >
          {CATEGORIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
        </select>

        <label className="flex items-center gap-2 text-sm text-[var(--color-text-muted)] cursor-pointer ml-auto px-3 py-2 rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] hover:border-[var(--color-border-accent)]">
          <input
            type="checkbox"
            checked={vlopOnly}
            onChange={(e) => setVlopOnly(e.target.checked)}
            className="accent-[var(--color-accent)]"
          />
          VLOPs only
        </label>
      </div>

      {data?.observed_at && (
        <div className="text-xs text-[var(--color-text-dim)] px-1">
          Latest snapshot: {new Date(data.observed_at).toLocaleString("en-GB")} · {data.total} entries
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">#</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">App</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Country</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Category</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Min age</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">GDPR art.8</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Compliance</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">VLOP</th>
              </tr>
            </thead>
            <tbody>
              {data.items.map((a, idx) => <AppRow key={`${a.appId}-${a.countryCode}-${a.chartCategory}-${idx}`} a={a} />)}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function AppRow({ a }: { a: AppItem }) {
  const gap = GAP_STYLES[a.compliance_gap];
  const country = COUNTRIES_EU27.find((c) => c.code === a.countryCode);
  const GapIcon = gap.icon;

  return (
    <tr className="border-t border-[var(--color-border)] hover:bg-[var(--color-surface-2)]/40">
      <td className="px-3 py-2 text-[var(--color-text-dim)] tabular-nums">{a.rank}</td>
      <td className="px-3 py-2">
        <div className="font-medium text-[var(--color-text)] leading-tight">{a.name}</div>
        {a.publisher && <div className="text-[11px] text-[var(--color-text-dim)] leading-tight">{a.publisher}</div>}
      </td>
      <td className="px-3 py-2 text-[var(--color-text-muted)] whitespace-nowrap">
        {country?.flag} {a.countryCode}
      </td>
      <td className="px-3 py-2 text-[var(--color-text-muted)] capitalize">{a.chartCategory}</td>
      <td className="px-3 py-2 tabular-nums text-[var(--color-text-muted)]">
        {a.declaredMinAge !== null ? `${a.declaredMinAge}+` : "—"}
      </td>
      <td className="px-3 py-2 tabular-nums text-[var(--color-text-muted)]">
        {a.legal_age_gdpr_art8 !== null ? `${a.legal_age_gdpr_art8}` : "—"}
      </td>
      <td className="px-3 py-2">
        <span
          className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
          style={{ background: gap.bg, color: gap.text }}
        >
          <GapIcon className="w-3 h-3" />
          {gap.label}
        </span>
      </td>
      <td className="px-3 py-2">
        {a.isVlop ? (
          a.dsaTransparencyUrl ? (
            <a
              href={a.dsaTransparencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-[var(--color-purple-soft)] text-[var(--color-purple)] hover:underline"
            >
              VLOP <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <span className="inline-flex items-center text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-[var(--color-purple-soft)] text-[var(--color-purple)]">
              VLOP
            </span>
          )
        ) : (
          <span className="text-[var(--color-text-dim)]">—</span>
        )}
      </td>
    </tr>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">No app data yet.</p>
      <p className="text-xs text-[var(--color-text-dim)] mt-1">App Radar ingests iTunes EU charts daily. First run pending.</p>
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
