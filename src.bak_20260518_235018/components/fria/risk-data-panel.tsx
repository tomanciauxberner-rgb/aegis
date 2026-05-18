"use client";

import { useEffect, useState } from "react";
import { Database, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface RiskIndicator {
  indicator: string;
  name: string;
  description: string;
  topic: string;
  subtopic: string;
  value: number;
  year: number;
  sampleSize: number;
  population: { code: string; name: string };
  source: { survey: string; name: string; url: string };
  riskSignal: string;
}

interface RiskProfileData {
  country: { code: string; name: string; region: string };
  overallRisk: string;
  totalIndicators: number;
  riskBreakdown: Record<string, number>;
  indicators: RiskIndicator[];
}

const RISK_BADGE: Record<string, string> = {
  critical: "text-danger bg-danger-soft border border-danger/30",
  high: "text-danger bg-danger-soft/60 border border-danger/20",
  medium: "text-gold bg-gold-soft border border-gold/20",
  low: "text-success bg-success-soft border border-success/20",
  minimal: "text-text-muted bg-surface-2 border border-border",
};

const RISK_BAR: Record<string, string> = {
  critical: "bg-danger",
  high: "bg-danger/70",
  medium: "bg-gold",
  low: "bg-success/70",
  minimal: "bg-text-dim/30",
};

export function RiskDataPanel({
  countryCode,
  populationCode,
}: {
  countryCode: string;
  populationCode?: string;
}) {
  const [data, setData] = useState<RiskProfileData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!countryCode) return;
    async function fetchRiskProfile() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ country: countryCode });
        if (populationCode) params.set("population", populationCode);
        const res = await fetch(`/api/fria/risk-profile?${params}`);
        if (!res.ok) throw new Error("Failed to fetch");
        setData(await res.json());
      } catch {
        setError("Failed to load risk data");
      } finally {
        setLoading(false);
      }
    }
    fetchRiskProfile();
  }, [countryCode, populationCode]);

  if (!countryCode) return null;

  if (loading) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 flex items-center justify-center gap-3">
        <Loader2 className="w-5 h-5 animate-spin text-accent" />
        <span className="text-sm text-text-muted">Loading FRA risk data...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-danger-soft/30 border border-danger/20 rounded-lg p-4 text-sm text-danger">{error}</div>
    );
  }

  if (!data || data.totalIndicators === 0) {
    return (
      <div className="bg-surface border border-border rounded-lg p-8 text-center">
        <Database className="w-7 h-7 text-text-dim mx-auto mb-3" />
        <p className="text-sm text-text-muted">No FRA data available for this country/population combination.</p>
      </div>
    );
  }

  const grouped = data.indicators.reduce((acc, ind) => {
    const key = ind.topic || "other";
    if (!acc[key]) acc[key] = [];
    acc[key].push(ind);
    return acc;
  }, {} as Record<string, RiskIndicator[]>);

  const topicLabels: Record<string, string> = {
    discrimination: "Discrimination",
    hate_crime: "Hate Crime & Harassment",
    policing: "Policing & Profiling",
    trust: "Trust in Institutions",
    reporting: "Rights Awareness & Reporting",
    poverty: "Poverty & Social Exclusion",
    education: "Education",
  };

  return (
    <div className="bg-surface border border-border rounded-lg overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center">
            <Database className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-base font-semibold">
              FRA Risk Profile — {data.country.name}
            </h3>
            <p className="text-xs text-text-muted mt-0.5">
              {data.totalIndicators} indicators from EU Agency for Fundamental Rights
            </p>
          </div>
        </div>
        <span className={cn("px-3 py-1.5 rounded-md text-xs font-bold uppercase tracking-wider", RISK_BADGE[data.overallRisk])}>
          {data.overallRisk} risk
        </span>
      </div>

      {/* Grouped indicators */}
      <div className="divide-y divide-border">
        {Object.entries(grouped).map(([topic, indicators]) => (
          <div key={topic}>
            <div className="px-6 py-2.5 bg-surface-2/50">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-dim">
                {topicLabels[topic] || topic}
              </span>
            </div>
            <div className="divide-y divide-border/50">
              {indicators.map((ind, i) => (
                <div key={i} className="px-6 py-4 flex items-center gap-6 hover:bg-surface-2/30 transition-colors">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-text leading-snug">
                      {ind.name}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-text-muted">{ind.population.name}</span>
                      <span className="text-text-dim/40">·</span>
                      <span className="text-xs text-text-dim">{ind.year}</span>
                      <span className="text-text-dim/40">·</span>
                      <span className="text-xs text-text-dim font-[family-name:var(--font-mono)]">n={ind.sampleSize?.toLocaleString()}</span>
                    </div>
                  </div>

                  <div className="w-32 flex-shrink-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-lg font-bold text-text tabular-nums">
                        {ind.value}%
                      </span>
                      <span className={cn("text-[10px] font-bold uppercase tracking-wider", RISK_BADGE[ind.riskSignal]?.split(" ")[0])}>
                        {ind.riskSignal}
                      </span>
                    </div>
                    <div className="h-1.5 bg-surface-2 rounded-full overflow-hidden">
                      <div
                        className={cn("h-full rounded-full transition-all duration-500", RISK_BAR[ind.riskSignal])}
                        style={{ width: `${Math.min(ind.value, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-6 py-3 bg-surface-2/50 border-t border-border">
        <p className="text-[11px] text-text-dim leading-relaxed">
          Source: EU Agency for Fundamental Rights (FRA). Values are survey response percentages.
          Risk signals computed by Aegis based on indicator type and threshold analysis.
        </p>
      </div>
    </div>
  );
}
