"use client";

import { useEffect, useState } from "react";
import { Loader2, TrendingUp, Scale, Building2, Globe2, ArrowUpRight } from "lucide-react";

interface EnforcementPattern {
  legal_basis: string;
  decision_count: number;
  countries: string[];
  country_count: number;
  total_fines_eur: number;
  first_seen: string;
  last_seen: string;
  trend_label: "emerging" | "active" | "established";
  sample_titles: string[];
}

interface SectorTrend {
  sector: string;
  decision_count: number;
  countries: string[];
  avg_severity_score: number;
}

interface Precedent {
  id: string;
  court: string;
  name: string;
  citation: string;
  year: number;
  country: string | null;
  holding: string;
  relevance: string;
  rights_categories: string[];
  ai_act_articles: string[];
}

interface EnforcementResponse {
  patterns: EnforcementPattern[];
  sector_trends: SectorTrend[];
  precedents: Precedent[];
  generated_at: string;
}

const BASIS_LABELS: Record<string, string> = {
  gdpr_art8: "GDPR Art. 8 — child consent",
  gdpr_art22: "GDPR Art. 22 — automated decisions",
  gdpr_art35: "GDPR Art. 35 — DPIA",
  dsa_art28: "DSA Art. 28 — minors protection",
  dsa_art34: "DSA Art. 34 — systemic risk",
  dsa_art35: "DSA Art. 35 — risk mitigation",
  dsa_art39: "DSA Art. 39 — ad transparency",
  ai_act_annex3: "AI Act Annex III — high-risk",
  ai_act_art5: "AI Act Art. 5 — prohibited",
  ai_act_art27: "AI Act Art. 27 — FRIA",
  charter_art24: "Charter Art. 24 — rights of the child",
  uncrc_art3: "UNCRC Art. 3 — best interests",
  uncrc_art16: "UNCRC Art. 16 — privacy",
  uncrc_art17: "UNCRC Art. 17 — media access",
};

const TREND_STYLE: Record<string, { bg: string; text: string; label: string }> = {
  emerging:    { bg: "var(--color-cyan-soft)",    text: "var(--color-cyan)",    label: "Emerging" },
  active:      { bg: "var(--color-gold-soft)",    text: "var(--color-gold)",    label: "Active" },
  established: { bg: "var(--color-danger-soft)",  text: "var(--color-danger)",  label: "Established" },
};

const FLAGS: Record<string, string> = {
  AT:"🇦🇹",BE:"🇧🇪",BG:"🇧🇬",HR:"🇭🇷",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",EE:"🇪🇪",FI:"🇫🇮",FR:"🇫🇷",
  DE:"🇩🇪",GR:"🇬🇷",HU:"🇭🇺",IE:"🇮🇪",IT:"🇮🇹",LV:"🇱🇻",LT:"🇱🇹",LU:"🇱🇺",MT:"🇲🇹",NL:"🇳🇱",
  PL:"🇵🇱",PT:"🇵🇹",RO:"🇷🇴",SK:"🇸🇰",SI:"🇸🇮",ES:"🇪🇸",SE:"🇸🇪",
};

function fmtEur(n: number): string {
  if (n >= 1_000_000) return `€${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `€${(n / 1_000).toFixed(0)}k`;
  return n > 0 ? `€${n}` : "—";
}

export function EnforcementIntelligence() {
  const [data, setData] = useState<EnforcementResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/enforcement", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: EnforcementResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!data || (data.patterns.length === 0 && data.sector_trends.length === 0)) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No enforcement data yet to analyse.</p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">
          As DPA decisions are ingested, cross-border enforcement patterns will surface here automatically.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section>
        <div className="flex items-center gap-2 mb-3">
          <Globe2 className="w-4 h-4 text-[var(--color-accent)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Cross-border enforcement patterns</h3>
        </div>
        <p className="text-xs text-[var(--color-text-dim)] mb-4 max-w-2xl">
          When the same legal basis is enforced across multiple Member States, it signals a converging regulatory
          stance. Patterns spanning several countries are where EU-level frameworks crystallise.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {data.patterns.map((p) => {
            const trend = TREND_STYLE[p.trend_label];
            return (
              <div key={p.legal_basis} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-sm font-semibold text-[var(--color-text)] leading-snug">
                    {BASIS_LABELS[p.legal_basis] ?? p.legal_basis.replace(/_/g, " ")}
                  </span>
                  <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded whitespace-nowrap" style={{ background: trend.bg, color: trend.text }}>
                    {trend.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 mb-3 text-xs text-[var(--color-text-muted)]">
                  <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" /> {p.decision_count} decisions</span>
                  <span className="flex items-center gap-1"><Globe2 className="w-3 h-3" /> {p.country_count} countries</span>
                  {p.total_fines_eur > 0 && <span className="text-[var(--color-danger)] font-medium">{fmtEur(p.total_fines_eur)}</span>}
                </div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {p.countries.map((c) => (
                    <span key={c} className="text-sm" title={c}>{FLAGS[c] ?? c}</span>
                  ))}
                </div>
                {p.sample_titles[0] && (
                  <p className="text-[11px] text-[var(--color-text-dim)] leading-snug line-clamp-2 border-t border-[var(--color-border)] pt-2 mt-2">
                    Latest: {p.sample_titles[0]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section>
        <div className="flex items-center gap-2 mb-3">
          <Building2 className="w-4 h-4 text-[var(--color-gold)]" />
          <h3 className="text-sm font-semibold text-[var(--color-text)]">Sector exposure</h3>
        </div>
        <div className="overflow-x-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
          <table className="w-full text-sm">
            <thead className="bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
              <tr>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Sector</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Decisions</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Countries</th>
                <th className="text-left px-3 py-2 font-medium text-[11px] uppercase tracking-wider">Avg severity</th>
              </tr>
            </thead>
            <tbody>
              {data.sector_trends.map((s) => (
                <tr key={s.sector} className="border-t border-[var(--color-border)]">
                  <td className="px-3 py-2 text-[var(--color-text)] capitalize">{s.sector.replace(/_/g, " ")}</td>
                  <td className="px-3 py-2 text-[var(--color-text-muted)] tabular-nums">{s.decision_count}</td>
                  <td className="px-3 py-2 text-[var(--color-text-muted)] tabular-nums">{s.countries.length}</td>
                  <td className="px-3 py-2">
                    <SeverityBar score={s.avg_severity_score} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {data.precedents.length > 0 && (
        <section>
          <div className="flex items-center gap-2 mb-3">
            <Scale className="w-4 h-4 text-[var(--color-purple)]" />
            <h3 className="text-sm font-semibold text-[var(--color-text)]">Connected jurisprudence</h3>
          </div>
          <p className="text-xs text-[var(--color-text-dim)] mb-4 max-w-2xl">
            CJEU and ECHR precedents sharing legal grounds with current enforcement — the case law that shapes how these decisions are argued.
          </p>
          <ul className="space-y-2">
            {data.precedents.map((c) => (
              <li key={c.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:border-[var(--color-border-accent)] transition-colors">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-[10px] uppercase tracking-wider font-medium px-1.5 py-0.5 rounded bg-[var(--color-purple-soft)] text-[var(--color-purple)]">{c.court}</span>
                  <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">{c.relevance}</span>
                  <span className="text-xs text-[var(--color-text-dim)]">{c.year}</span>
                </div>
                <div className="text-sm font-medium text-[var(--color-text)] leading-snug">{c.name}</div>
                <div className="text-[11px] text-[var(--color-text-dim)] mb-1">{c.citation}</div>
                <p className="text-xs text-[var(--color-text-muted)] leading-relaxed line-clamp-2">{c.holding}</p>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-[11px] text-[var(--color-text-dim)] pt-2">
        Generated {new Date(data.generated_at).toLocaleString("en-GB")} · patterns recomputed live from ingested decisions.
      </p>
    </div>
  );
}

function SeverityBar({ score }: { score: number }) {
  const pct = Math.min(100, (score / 5) * 100);
  const color = score >= 4 ? "var(--color-danger)" : score >= 3 ? "var(--color-gold)" : "var(--color-success)";
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
      <span className="text-[11px] tabular-nums text-[var(--color-text-dim)]">{score.toFixed(1)}</span>
    </div>
  );
}
