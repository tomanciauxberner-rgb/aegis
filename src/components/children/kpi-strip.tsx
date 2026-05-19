"use client";

import { Gavel, Smartphone, GraduationCap, AlertTriangle } from "lucide-react";
import type { OverviewResponse } from "@/types/children-ui";

interface Props {
  data: OverviewResponse | null;
  loading: boolean;
}

function formatEur(amount: number): string {
  if (amount >= 1_000_000_000) return `€${(amount / 1_000_000_000).toFixed(1)}B`;
  if (amount >= 1_000_000) return `€${(amount / 1_000_000).toFixed(1)}M`;
  if (amount >= 1_000) return `€${(amount / 1_000).toFixed(0)}k`;
  return `€${amount}`;
}

export function ChildrenKpiStrip({ data, loading }: Props) {
  if (loading || !data) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="h-24 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] animate-pulse" />
        ))}
      </div>
    );
  }

  const cards = [
    {
      icon: Gavel,
      label: "DPA decisions (children)",
      value: data.decisions.total.toLocaleString(),
      sub: `${data.decisions.critical} critical · ${data.decisions.high} high`,
      accent: "var(--color-accent)",
    },
    {
      icon: AlertTriangle,
      label: "Total fines",
      value: formatEur(data.decisions.total_fines_eur),
      sub: `Across ${data.decisions.countries_covered} countries`,
      accent: "var(--color-danger)",
    },
    {
      icon: Smartphone,
      label: "Apps tracked",
      value: data.apps.total.toLocaleString(),
      sub: `${data.apps.vlops_count} VLOPs · ${data.apps.rated_under_12} rated <12`,
      accent: "var(--color-gold)",
    },
    {
      icon: GraduationCap,
      label: "EdTech systems mapped",
      value: data.edtech.total.toLocaleString(),
      sub: `${data.edtech.annex3_count} Annex III · ${data.edtech.countries_mapped} countries`,
      accent: "var(--color-purple)",
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.label}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors"
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className="w-4 h-4" style={{ color: c.accent }} />
              <span className="text-xs text-[var(--color-text-dim)] uppercase tracking-wide">{c.label}</span>
            </div>
            <div className="text-2xl font-semibold text-[var(--color-text)] mb-1">{c.value}</div>
            <div className="text-xs text-[var(--color-text-muted)]">{c.sub}</div>
          </div>
        );
      })}
    </div>
  );
}
