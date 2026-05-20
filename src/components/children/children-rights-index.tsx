"use client";

import { useEffect, useState } from "react";
import { Loader2, Trophy, Info } from "lucide-react";

interface CountryIndex {
  country_code: string;
  legal_age_consent: number | null;
  enforcement_score: number;
  exposure_score: number;
  edtech_risk_score: number;
  framework_score: number;
  cdri: number;
  band: "robust" | "developing" | "exposed" | "insufficient_data";
  signals: { dpa_decisions: number; app_violations: number; edtech_systems: number; edtech_annex3: number };
}

interface IndexResponse {
  index: CountryIndex[];
  eu_average: number;
  methodology: { weights: Record<string, number>; note: string };
  generated_at: string;
}

const NAMES: Record<string, string> = {
  AT:"Austria",BE:"Belgium",BG:"Bulgaria",HR:"Croatia",CY:"Cyprus",CZ:"Czechia",DK:"Denmark",EE:"Estonia",
  FI:"Finland",FR:"France",DE:"Germany",GR:"Greece",HU:"Hungary",IE:"Ireland",IT:"Italy",LV:"Latvia",
  LT:"Lithuania",LU:"Luxembourg",MT:"Malta",NL:"Netherlands",PL:"Poland",PT:"Portugal",RO:"Romania",
  SK:"Slovakia",SI:"Slovenia",ES:"Spain",SE:"Sweden",
};
const FLAGS: Record<string, string> = {
  AT:"🇦🇹",BE:"🇧🇪",BG:"🇧🇬",HR:"🇭🇷",CY:"🇨🇾",CZ:"🇨🇿",DK:"🇩🇰",EE:"🇪🇪",FI:"🇫🇮",FR:"🇫🇷",
  DE:"🇩🇪",GR:"🇬🇷",HU:"🇭🇺",IE:"🇮🇪",IT:"🇮🇹",LV:"🇱🇻",LT:"🇱🇹",LU:"🇱🇺",MT:"🇲🇹",NL:"🇳🇱",
  PL:"🇵🇱",PT:"🇵🇹",RO:"🇷🇴",SK:"🇸🇰",SI:"🇸🇮",ES:"🇪🇸",SE:"🇸🇪",
};
const BAND: Record<string, { label: string; color: string }> = {
  robust:            { label: "Robust",     color: "var(--color-success)" },
  developing:        { label: "Developing", color: "var(--color-gold)" },
  exposed:           { label: "Exposed",    color: "var(--color-danger)" },
  insufficient_data: { label: "No data",    color: "var(--color-text-dim)" },
};

export function ChildrenRightsIndex() {
  const [data, setData] = useState<IndexResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/index", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: IndexResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>;
  if (!data) return <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center"><p className="text-sm text-[var(--color-text-muted)]">Index unavailable.</p></div>;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <Trophy className="w-5 h-5 text-[var(--color-gold)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">Children Digital Rights Index</h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
          A composite, recomputed-live score (0–100) ranking the EU-27 on how well children&apos;s digital rights are protected — built from four independent dimensions Aegis tracks: DPA enforcement, app-store compliance, EdTech AI Act risk, and legal framework maturity. <span className="text-[var(--color-text-dim)]">EU average: <span className="font-semibold text-[var(--color-text)]">{data.eu_average}</span>.</span>
        </p>
      </div>

      <div className="space-y-2">
        {data.index.map((c, i) => {
          const band = BAND[c.band];
          const isOpen = expanded === c.country_code;
          return (
            <div key={c.country_code} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
              <button onClick={() => setExpanded(isOpen ? null : c.country_code)} className="w-full flex items-center gap-3 p-3 hover:bg-[var(--color-surface-2)]/40 transition-colors text-left">
                <span className="text-sm font-bold text-[var(--color-text-dim)] tabular-nums w-6">{i + 1}</span>
                <span className="text-xl">{FLAGS[c.country_code]}</span>
                <span className="flex-1 text-sm font-medium text-[var(--color-text)]">{NAMES[c.country_code]}</span>
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded" style={{ background: `${band.color}22`, color: band.color }}>{band.label}</span>
                <div className="w-32 hidden sm:block">
                  <div className="h-2 rounded-full bg-[var(--color-surface-3)] overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${c.cdri}%`, background: band.color }} />
                  </div>
                </div>
                <span className="text-lg font-bold tabular-nums w-10 text-right" style={{ color: band.color }}>{c.cdri}</span>
              </button>

              {isOpen && (
                <div className="px-4 pb-4 pt-1 border-t border-[var(--color-border)]">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    <Dimension label="Enforcement" score={c.enforcement_score} sub={`${c.signals.dpa_decisions} decisions`} />
                    <Dimension label="App compliance" score={c.exposure_score} sub={`${c.signals.app_violations} violations`} />
                    <Dimension label="EdTech risk" score={c.edtech_risk_score} sub={`${c.signals.edtech_annex3}/${c.signals.edtech_systems} Annex III`} />
                    <Dimension label="Framework" score={c.framework_score} sub={c.legal_age_consent ? `consent age ${c.legal_age_consent}` : "—"} />
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 flex items-start gap-2">
        <Info className="w-3.5 h-3.5 text-[var(--color-text-dim)] mt-0.5 shrink-0" />
        <p className="text-[11px] text-[var(--color-text-dim)] leading-relaxed">
          {data.methodology.note} Weights: app compliance 30%, framework 30%, enforcement 20%, EdTech risk 20%. Generated {new Date(data.generated_at).toLocaleString("en-GB")}.
        </p>
      </div>
    </div>
  );
}

function Dimension({ label, score, sub }: { label: string; score: number; sub: string }) {
  const color = score >= 70 ? "var(--color-success)" : score >= 50 ? "var(--color-gold)" : "var(--color-danger)";
  return (
    <div className="rounded-lg bg-[var(--color-surface-2)] p-2.5">
      <div className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)] mb-1">{label}</div>
      <div className="flex items-baseline gap-1">
        <span className="text-lg font-bold tabular-nums" style={{ color }}>{score}</span>
        <span className="text-[10px] text-[var(--color-text-dim)]">/100</span>
      </div>
      <div className="text-[10px] text-[var(--color-text-muted)] mt-0.5">{sub}</div>
    </div>
  );
}
