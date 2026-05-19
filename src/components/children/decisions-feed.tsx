"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2, Search, X } from "lucide-react";
import type { DecisionsResponse, DpaDecisionItem } from "@/types/children-ui";

const SEVERITY_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  critical:      { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  border: "var(--color-danger)" },
  high:          { bg: "var(--color-gold-soft)",    text: "var(--color-gold)",    border: "var(--color-gold)" },
  medium:        { bg: "var(--color-accent-soft)",  text: "var(--color-accent)",  border: "var(--color-accent)" },
  low:           { bg: "var(--color-cyan-soft)",    text: "var(--color-cyan)",    border: "var(--color-cyan)" },
  informational: { bg: "var(--color-surface-2)",    text: "var(--color-text-dim)",border: "var(--color-border)" },
};

const OUTCOME_LABELS: Record<string, string> = {
  fine: "Fine",
  warning: "Warning",
  injunction: "Injunction",
  dismissed: "Dismissed",
  ongoing: "Ongoing",
  settled: "Settled",
  guidance: "Guidance",
};

const SECTORS = ["edtech", "social_media", "gaming", "streaming", "school", "public_authority"];

interface Props {
  initialCountry?: string;
}

export function DecisionsFeed({ initialCountry }: Props) {
  const [data, setData] = useState<DecisionsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [country, setCountry] = useState<string>(initialCountry ?? "");
  const [severity, setSeverity] = useState<string>("");
  const [outcome, setOutcome] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [qDebounced, setQDebounced] = useState<string>("");

  useEffect(() => {
    const t = setTimeout(() => setQDebounced(q), 350);
    return () => clearTimeout(t);
  }, [q]);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    const params = new URLSearchParams();
    if (country) params.set("country", country);
    if (severity) params.set("severity", severity);
    if (outcome) params.set("outcome", outcome);
    if (qDebounced) params.set("q", qDebounced);
    params.set("limit", "50");

    fetch(`/api/children-v2/decisions?${params}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: DecisionsResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData({ items: [], total: 0, limit: 50, offset: 0 }); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [country, severity, outcome, qDebounced]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            placeholder="Search decisions, respondents..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]"
          />
          {q && (
            <button
              type="button"
              onClick={() => setQ("")}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <FilterSelect value={severity} onChange={setSeverity} placeholder="All severities">
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
          <option value="informational">Informational</option>
        </FilterSelect>

        <FilterSelect value={outcome} onChange={setOutcome} placeholder="All outcomes">
          {Object.entries(OUTCOME_LABELS).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </FilterSelect>

        <FilterSelect value={country} onChange={setCountry} placeholder="All countries" />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <EmptyState />
      ) : (
        <>
          <div className="text-xs text-[var(--color-text-dim)] px-1">
            {data.total.toLocaleString()} {data.total === 1 ? "decision" : "decisions"}
            {qDebounced && ` for "${qDebounced}"`}
          </div>
          <ul className="space-y-3">
            {data.items.map((d) => <DecisionCard key={d.id} d={d} />)}
          </ul>
        </>
      )}
    </div>
  );
}

function FilterSelect({
  value, onChange, placeholder, children,
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  children?: React.ReactNode;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]"
    >
      <option value="">{placeholder}</option>
      {children ?? COUNTRIES_EU27.map((c) => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
    </select>
  );
}

function DecisionCard({ d }: { d: DpaDecisionItem }) {
  const sev = SEVERITY_STYLES[d.severity] ?? SEVERITY_STYLES.medium;
  const country = COUNTRIES_EU27.find((c) => c.code === d.countryCode);
  const fine = d.fineAmountEur && d.fineAmountEur > 0 ? formatEurFine(d.fineAmountEur) : null;

  return (
    <li
      className="rounded-lg border bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors"
      style={{ borderColor: "var(--color-border)" }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-base">{country?.flag ?? "🇪🇺"}</span>
          <span
            className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded border"
            style={{ background: sev.bg, color: sev.text, borderColor: sev.border }}
          >
            {d.severity}
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
            {OUTCOME_LABELS[d.outcome] ?? d.outcome}
          </span>
          {d.dpaAcronym && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
              {d.dpaAcronym}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-dim)]">
            {new Date(d.decisionDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        {fine && (
          <span className="text-sm font-semibold text-[var(--color-danger)] whitespace-nowrap">{fine}</span>
        )}
      </div>

      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 leading-snug">{d.titleEn}</h3>
      {d.titleOriginal !== d.titleEn && (
        <p className="text-[11px] text-[var(--color-text-dim)] italic mb-2 leading-snug">{d.titleOriginal}</p>
      )}
      <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">{d.summaryEn}</p>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px]">
        {d.respondentName && (
          <span className="text-[var(--color-text-muted)]">
            <span className="text-[var(--color-text-dim)]">Respondent: </span>{d.respondentName}
          </span>
        )}
        {d.respondentSector && (
          <span className="text-[var(--color-text-dim)]">· {d.respondentSector.replace(/_/g, " ")}</span>
        )}
        {d.ageRangeAffected && (
          <span className="text-[var(--color-text-dim)]">· age: {d.ageRangeAffected}</span>
        )}
      </div>

      {d.legalBases.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {d.legalBases.map((b) => (
            <span key={b} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
              {b.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}

      <a
        href={d.sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline mt-3"
      >
        Source <ExternalLink className="w-3 h-3" />
      </a>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">No decisions match these filters.</p>
      <p className="text-xs text-[var(--color-text-dim)] mt-1">DPA ingestion runs daily. New decisions appear within 24h of publication.</p>
    </div>
  );
}

function formatEurFine(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return `€${n}`;
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
