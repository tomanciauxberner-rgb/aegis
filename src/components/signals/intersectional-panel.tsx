"use client";

import { useEffect, useState } from "react";
import { GitMerge, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";
import type { IntersectionalProfile, IntersectionalResponse } from "@/types/intersectional";
import { GROUP_LABELS, GROUP_COLORS, SECTOR_LABELS } from "@/types/intersectional";

const SEV = {
  critical: {
    label: "Critical",
    badge: "text-danger bg-danger-soft border border-danger/40",
    bar:   "bg-danger",
    card:  "border-danger/40 hover:border-danger/70",
  },
  elevated: {
    label: "Elevated",
    badge: "text-gold bg-gold-soft border border-gold/40",
    bar:   "bg-gold",
    card:  "border-gold/40 hover:border-gold/70",
  },
  watch: {
    label: "Watch",
    badge: "text-accent bg-accent-soft border border-accent/40",
    bar:   "bg-accent",
    card:  "border-accent/30 hover:border-accent/60",
  },
} as const;

function GroupPill({ groupId }: { groupId: string }) {
  const color = GROUP_COLORS[groupId] ?? "#4f7cff";
  return (
    <span
      className="px-2.5 py-1 rounded text-base font-mono border"
      style={{ color, backgroundColor: `${color}18`, borderColor: `${color}40` }}
    >
      {GROUP_LABELS[groupId] ?? groupId}
    </span>
  );
}

function AmplificationBadge({ factor }: { factor: number }) {
  const cls =
    factor >= 1.6
      ? "text-danger bg-danger-soft border-danger/40"
      : factor >= 1.4
      ? "text-gold bg-gold-soft border-gold/40"
      : "text-accent bg-accent-soft border-accent/40";
  return (
    <span className={cn("px-2 py-0.5 rounded border text-base font-mono font-bold", cls)}>
      ×{factor.toFixed(1)}
    </span>
  );
}

function ScoreBar({ score, max = 12 }: { score: number; max?: number }) {
  const pct = Math.min((score / max) * 100, 100);
  const color = score >= 6 ? "#ff5c5c" : score >= 3.5 ? "#e8b84b" : "#4f7cff";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-surface-3 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
      <span className="text-base font-mono font-bold text-text-muted w-10 text-right">
        {score.toFixed(1)}
      </span>
    </div>
  );
}

function ProfileCard({ profile }: { profile: IntersectionalProfile }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = SEV[profile.compound_severity];
  const uniqueGroups  = [...new Set(profile.affected_groups)];
  const uniqueSectors = [...new Set(profile.affected_sectors)];

  return (
    <div
      className={cn("bg-surface border rounded-lg overflow-hidden transition-colors cursor-pointer", cfg.card)}
      onClick={() => setExpanded(v => !v)}
    >
      <div className={cn("h-0.5 w-full", cfg.bar)} />

      <div className="px-5 py-4 space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0 flex-wrap">
            <span className="text-base font-bold text-text font-mono w-8 flex-shrink-0">
              {profile.country}
            </span>
            <span className={cn("px-3 py-1 rounded text-base font-bold uppercase tracking-wider", cfg.badge)}>
              {cfg.label}
            </span>
            <AmplificationBadge factor={profile.amplification_factor} />
            <span className="text-base text-text-dim font-mono">
              {profile.axes.length} axes · {uniqueGroups.length} groups
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            {expanded
              ? <ChevronUp className="w-4 h-4 text-text-muted" />
              : <ChevronDown className="w-4 h-4 text-text-muted" />
            }
          </div>
        </div>

        <ScoreBar score={profile.compound_score} />

        <div className="flex flex-wrap gap-1.5">
          {uniqueGroups.map(g => <GroupPill key={g} groupId={g} />)}
        </div>

        {profile.intersectional_note && (
          <p className="text-base text-text-muted leading-relaxed">
            {profile.intersectional_note}
          </p>
        )}
      </div>

      {expanded && (
        <div className="border-t border-border px-5 py-4 space-y-4">
          <p className="text-base font-mono text-text-dim uppercase tracking-wider">
            Risk axes — by sector × group
          </p>
          <div className="space-y-2">
            {profile.axes.map((axis, i) => {
              const axisColor = GROUP_COLORS[axis.group_id] ?? "#4f7cff";
              return (
                <div key={i} className="flex items-center gap-3 bg-surface-2 border border-border rounded px-4 py-3">
                  <span
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: axisColor }}
                  />
                  <span className="text-base text-text-muted font-mono flex-shrink-0 w-28">
                    {SECTOR_LABELS[axis.sector] ?? axis.sector}
                  </span>
                  <GroupPill groupId={axis.group_id} />
                  <div className="flex-1" />
                  <span className={cn(
                    "text-base font-mono font-bold px-2 py-0.5 rounded",
                    axis.severity === "critical"
                      ? "text-danger"
                      : axis.severity === "elevated"
                      ? "text-gold"
                      : "text-accent"
                  )}>
                    {axis.convergence_score}/3
                  </span>
                  {axis.headline && (
                    <span className="hidden lg:block text-base text-text-dim truncate max-w-xs">
                      {axis.headline}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          <div className="pt-1">
            <p className="text-base text-text-dim font-mono">
              Affected sectors —{" "}
              {uniqueSectors.map(s => SECTOR_LABELS[s] ?? s).join(" · ")}
            </p>
            <p className="text-base text-text-dim font-mono mt-1">
              Amplification ×{profile.amplification_factor.toFixed(1)} — compound score {profile.compound_score.toFixed(1)}
              {" "}(raw sum × intersectionality multiplier)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

interface IntersectionalPanelProps {
  countryFilter?: string;
}

export function IntersectionalPanel({ countryFilter }: IntersectionalPanelProps) {
  const [data, setData]         = useState<IntersectionalResponse | null>(null);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [minAxes, setMinAxes]   = useState(2);
  const [collapsed, setCollapsed] = useState(false);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ min_axes: String(minAxes) });
        if (countryFilter) params.set("country", countryFilter);
        const res = await fetch(`/api/alerts/intersectional?${params}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json: IntersectionalResponse = await res.json();
        setData(json);
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : "Failed to load intersectional data");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [minAxes, countryFilter]);

  return (
    <div className="space-y-3">
      <div
        className="flex items-center justify-between cursor-pointer select-none py-1"
        onClick={() => setCollapsed(v => !v)}
      >
        <div className="flex items-center gap-3">
          <GitMerge className="w-5 h-5 text-purple" />
          <span
            style={{ fontSize: 15, fontWeight: 600, letterSpacing: "0.08em" }}
            className="uppercase text-text-muted font-mono"
          >
            Intersectional Risk
          </span>
          {data && (
            <div className="flex items-center gap-2">
              {data.critical > 0 && (
                <span className="px-2.5 py-1 rounded text-base font-bold bg-danger-soft border border-danger/40 text-danger">
                  {data.critical} critical
                </span>
              )}
              {data.elevated > 0 && (
                <span className="px-2.5 py-1 rounded text-base font-bold bg-gold-soft border border-gold/40 text-gold">
                  {data.elevated} elevated
                </span>
              )}
              {data.watch > 0 && (
                <span className="px-2.5 py-1 rounded text-base font-bold bg-accent-soft border border-accent/40 text-accent">
                  {data.watch} watch
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {!collapsed && (
            <div
              className="flex items-center gap-1 text-base font-mono text-text-muted"
              onClick={e => e.stopPropagation()}
            >
              <span>Min groups</span>
              {[2, 3, 4].map(n => (
                <button
                  key={n}
                  onClick={() => setMinAxes(n)}
                  className={cn(
                    "px-2.5 py-1 rounded border transition-colors",
                    minAxes === n
                      ? "border-accent text-accent bg-accent-soft"
                      : "border-border text-text-muted hover:border-border-accent"
                  )}
                >
                  {n}+
                </button>
              ))}
            </div>
          )}
          {collapsed
            ? <ChevronDown className="w-5 h-5 text-text-muted" />
            : <ChevronUp className="w-5 h-5 text-text-muted" />
          }
        </div>
      </div>

      {!collapsed && loading && (
        <div className="bg-surface border border-border rounded-lg p-6 text-center">
          <p className="text-base text-text-muted font-mono animate-pulse">
            Computing compound discrimination risk…
          </p>
        </div>
      )}

      {!collapsed && error && (
        <div className="bg-danger-soft border border-danger/30 rounded-lg p-4">
          <p className="text-base text-danger font-mono">{error}</p>
        </div>
      )}

      {!collapsed && data && !loading && (
        <div className="space-y-2">
          {data.profiles.length === 0 ? (
            <div className="bg-surface border border-border rounded-lg p-6 text-center">
              <p className="text-base text-text-muted">
                No intersectional profiles at this threshold.
              </p>
            </div>
          ) : (
            data.profiles.map(profile => (
              <ProfileCard key={profile.id} profile={profile} />
            ))
          )}
        </div>
      )}

      {!collapsed && data && !loading && data.top_sectors.length > 0 && (
        <p className="text-base text-text-dim font-mono">
          Intersectional: compound score = Σ convergence × amplification multiplier
          {" "}· top sectors: {data.top_sectors.map(s => SECTOR_LABELS[s] ?? s).join(" · ")}
        </p>
      )}
    </div>
  );
}
