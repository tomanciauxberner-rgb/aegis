"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldX, Globe2, AlertTriangle, TrendingDown } from "lucide-react";

interface AppGap {
  app_id: string;
  name: string;
  publisher: string | null;
  category: string | null;
  declared_min_age: number | null;
  is_vlop: boolean;
  dsa_transparency_url: string | null;
  violation_countries: string[];
  borderline_countries: string[];
  ok_countries: string[];
  violation_count: number;
  max_gap_years: number;
  worst_country: string | null;
  exposure_rank_best: number | null;
}

interface CountryGap {
  country_code: string;
  legal_age: number;
  apps_observed: number;
  violations: number;
  borderline: number;
  violation_rate: number;
}

interface GapResponse {
  apps: AppGap[];
  countries: CountryGap[];
  summary: {
    apps_in_violation: number;
    total_violation_instances: number;
    vlops_in_violation: number;
    worst_app: string | null;
    countries_analysed: number;
  } | null;
  observed_at: string | null;
}

const FLAGS: Record<string, string> = {
  AT:"🇦🇹",BE:"🇧🇪",BG:"🇧🇬",HR:"🇭🇷",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",EE:"🇪🇪",FI:"🇫🇮",FR:"🇫🇷",
  DE:"🇩🇪",GR:"🇬🇷",HU:"🇭🇺",IE:"🇮🇪",IT:"🇮🇹",LV:"🇱🇻",LT:"🇱🇹",LU:"🇱🇺",MT:"🇲🇹",NL:"🇳🇱",
  PL:"🇵🇱",PT:"🇵🇹",RO:"🇷🇴",SK:"🇸🇰",SI:"🇸🇮",ES:"🇪🇸",SE:"🇸🇪",
};

export function ComplianceGapEngine() {
  const [data, setData] = useState<GapResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/gaps", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: GapResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>;
  }

  if (!data || !data.summary || data.apps.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No compliance gaps detected yet.</p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">
          The engine cross-references each app&apos;s declared minimum age against every country&apos;s GDPR Art. 8 age of consent. Data populates as App Radar ingests EU charts.
        </p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)]/30 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-[var(--color-danger)] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-[var(--color-text)] leading-relaxed">
              <span className="font-semibold text-[var(--color-danger)]">{s.apps_in_violation} apps</span> charting in EU stores declare a minimum age <span className="font-semibold">below the legal age of consent</span> in at least one Member State — <span className="font-semibold">{s.total_violation_instances} systemic violation instances</span> in total, including <span className="font-semibold">{s.vlops_in_violation} VLOPs</span>.
            </p>
            <p className="text-[11px] text-[var(--color-text-dim)] mt-1">
              GDPR Art. 8 sets the age of consent for data processing between 13 and 16 depending on the country. Apps applying a single global age threshold create measurable cross-border gaps.
            </p>
          </div>
        </div>
      </div>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <ShieldX className="w-4 h-4 text-[var(--color-danger)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Worst systemic offenders</h3>
        </div>
        <div className="space-y-2">
          {data.apps.slice(0, 20).map((a) => (
            <div key={a.app_id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:border-[var(--color-border-accent)] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-[var(--color-text)]">{a.name}</span>
                    {a.is_vlop && (
                      a.dsa_transparency_url ? (
                        <a href={a.dsa_transparency_url} target="_blank" rel="noopener noreferrer" className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-[var(--color-purple-soft)] text-[var(--color-purple)] hover:underline">VLOP</a>
                      ) : (
                        <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-[var(--color-purple-soft)] text-[var(--color-purple)]">VLOP</span>
                      )
                    )}
                  </div>
                  {a.publisher && <div className="text-[11px] text-[var(--color-text-dim)]">{a.publisher}</div>}
                </div>
                <div className="text-right whitespace-nowrap">
                  <div className="text-lg font-bold text-[var(--color-danger)] tabular-nums leading-none">{a.violation_count}</div>
                  <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">countries</div>
                </div>
              </div>

              <div className="flex items-center gap-3 mb-2 text-[11px] text-[var(--color-text-muted)]">
                <span>Declared: <span className="font-semibold text-[var(--color-text)]">{a.declared_min_age ?? "—"}+</span></span>
                {a.max_gap_years > 0 && <span className="text-[var(--color-danger)]">Max gap: {a.max_gap_years} yr{a.max_gap_years > 1 ? "s" : ""}</span>}
                {a.exposure_rank_best && <span className="text-[var(--color-text-dim)]">Best chart rank: #{a.exposure_rank_best}</span>}
              </div>

              <div className="flex flex-wrap items-center gap-1">
                {a.violation_countries.map((c) => (
                  <span key={c} className="inline-flex items-center gap-0.5 text-[11px] px-1.5 py-0.5 rounded bg-[var(--color-danger-soft)]" title={`Violation in ${c}`}>
                    <span>{FLAGS[c] ?? c}</span>
                  </span>
                ))}
                {a.borderline_countries.length > 0 && (
                  <span className="text-[10px] text-[var(--color-gold)] ml-1">+{a.borderline_countries.length} borderline</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Globe2 className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Exposure by country</h3>
        </div>
        <p className="text-xs text-[var(--color-text-dim)] mb-3 max-w-2xl">
          Countries with higher age-of-consent thresholds mechanically face more gaps, since most apps default to the lowest global age (often 13).
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {data.countries.map((c) => (
            <div key={c.country_code} className="flex items-center gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-2.5">
              <span className="text-lg">{FLAGS[c.country_code] ?? c.country_code}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-[var(--color-text)]">{c.country_code} · consent {c.legal_age}</span>
                  <span className="text-xs font-semibold tabular-nums" style={{ color: rateColor(c.violation_rate) }}>{c.violation_rate}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${c.violation_rate}%`, background: rateColor(c.violation_rate) }} />
                </div>
                <div className="text-[10px] text-[var(--color-text-dim)] mt-0.5">{c.violations} violations / {c.apps_observed} apps</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <p className="text-[11px] text-[var(--color-text-dim)] flex items-center gap-1 pt-1">
        <TrendingDown className="w-3 h-3" />
        Snapshot {data.observed_at ? new Date(data.observed_at).toLocaleString("en-GB") : "—"} · recomputed live from latest EU chart rankings × GDPR Art. 8 reference.
      </p>
    </div>
  );
}

function rateColor(rate: number): string {
  if (rate >= 60) return "var(--color-danger)";
  if (rate >= 30) return "var(--color-gold)";
  if (rate > 0) return "var(--color-accent)";
  return "var(--color-success)";
}
