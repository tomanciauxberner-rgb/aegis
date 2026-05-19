"use client";

import { useEffect, useState } from "react";
import { ExternalLink, Loader2 } from "lucide-react";
import type { GdprAgeResponse, GdprAgeItem } from "@/types/children-ui";

function ageTier(age: number): { color: string; label: string } {
  if (age <= 13) return { color: "var(--color-accent)", label: "13" };
  if (age === 14) return { color: "var(--color-cyan)", label: "14" };
  if (age === 15) return { color: "var(--color-gold)", label: "15" };
  return { color: "var(--color-purple)", label: "16" };
}

export function GdprAgeMap() {
  const [data, setData] = useState<GdprAgeResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);

    fetch("/api/children-v2/gdpr-age", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: GdprAgeResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData({ items: [], total: 0 }); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" />
      </div>
    );
  }

  if (!data || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">GDPR age data not available.</p>
      </div>
    );
  }

  const stats = computeStats(data.items);

  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
        <div className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider mb-3">Distribution across EU-27</div>
        <div className="grid grid-cols-4 gap-3">
          {[13, 14, 15, 16].map((age) => {
            const tier = ageTier(age);
            const count = stats[age] ?? 0;
            return (
              <div key={age} className="text-center">
                <div
                  className="text-3xl font-bold mb-1 tabular-nums"
                  style={{ color: tier.color }}
                >
                  {count}
                </div>
                <div className="text-[11px] text-[var(--color-text-dim)] uppercase tracking-wider">
                  countries at age {age}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2">
        {data.items.map((item) => <AgeCard key={item.countryCode} item={item} />)}
      </div>
    </div>
  );
}

function AgeCard({ item }: { item: GdprAgeItem }) {
  const country = COUNTRIES_EU27.find((c) => c.code === item.countryCode);
  const tier = ageTier(item.ageConsent);
  return (
    <a
      href={item.sourceUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:border-[var(--color-border-accent)] transition-colors"
    >
      <div className="flex items-center justify-between gap-2 mb-1">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-base">{country?.flag}</span>
          <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wider truncate">{item.countryCode}</span>
        </div>
        <ExternalLink className="w-3 h-3 text-[var(--color-text-dim)] opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold tabular-nums" style={{ color: tier.color }}>
          {item.ageConsent}
        </span>
        <span className="text-[10px] text-[var(--color-text-dim)] uppercase tracking-wider">yrs</span>
      </div>
      <div className="text-[10px] text-[var(--color-text-dim)] mt-1 truncate" title={item.legalSource}>
        {item.legalSource}
      </div>
    </a>
  );
}

function computeStats(items: GdprAgeItem[]): Record<number, number> {
  const out: Record<number, number> = {};
  for (const item of items) {
    out[item.ageConsent] = (out[item.ageConsent] ?? 0) + 1;
  }
  return out;
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
