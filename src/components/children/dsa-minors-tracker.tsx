"use client";

import { useEffect, useState } from "react";
import { Loader2, ShieldAlert, ExternalLink, Search, BookText, Gavel, FileQuestion, Users2, Megaphone } from "lucide-react";

interface DsaItem {
  id: string;
  actionType: string;
  status: string;
  target: string | null;
  title: string;
  summary: string;
  dsaArticle: string;
  concerns: string[];
  actionDate: string;
  sourceUrl: string;
}

interface DsaResponse {
  items: DsaItem[];
  summary: { total: number; ongoing: number; targets: number } | null;
  generated_at: string;
}

const TYPE_META: Record<string, { label: string; icon: typeof Gavel; color: string }> = {
  investigation:       { label: "Investigation",        icon: Search,       color: "var(--color-danger)" },
  preliminary_finding: { label: "Preliminary finding",  icon: Gavel,        color: "var(--color-danger)" },
  guidelines:          { label: "Guidelines",           icon: BookText,     color: "var(--color-accent)" },
  recommendation:      { label: "Recommendation",       icon: Megaphone,    color: "var(--color-gold)" },
  information_request: { label: "Information request",   icon: FileQuestion, color: "var(--color-cyan)" },
  coordinated_action:  { label: "Coordinated action",   icon: Users2,       color: "var(--color-purple)" },
};

const STATUS_LABEL: Record<string, string> = {
  ongoing: "Ongoing", preliminary: "Preliminary", adopted: "Adopted", closed: "Closed",
};

export function DsaMinorsTracker() {
  const [data, setData] = useState<DsaResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/dsa-minors", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: DsaResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>;
  if (!data || !data.summary || data.items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No DSA Article 28 actions tracked yet.</p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">Run the DSA minors seed to populate Commission investigations, guidelines and recommendations.</p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-5">
      <div className="rounded-lg border border-[var(--color-border)] bg-gradient-to-br from-[var(--color-surface)] to-[var(--color-surface-2)] p-5">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-[var(--color-danger)]" />
          <h2 className="text-lg font-bold text-[var(--color-text)]">DSA Article 28 — Protection of Minors</h2>
        </div>
        <p className="text-xs text-[var(--color-text-muted)] max-w-3xl leading-relaxed">
          Platforms accessible to minors must ensure a high level of privacy, safety and security. This tracks the Commission&apos;s enforcement of Article 28 — investigations, guidelines and the age-verification push — the front line of EU child-safety enforcement in 2026.
          <span className="text-[var(--color-text-dim)]"> {s.ongoing} active proceedings · {s.targets} platforms under scrutiny.</span>
        </p>
      </div>

      <ul className="space-y-3">
        {data.items.map((it) => {
          const meta = TYPE_META[it.actionType] ?? TYPE_META.investigation;
          const Icon = meta.icon;
          return (
            <li key={it.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded" style={{ background: `${meta.color}18`, color: meta.color }}>
                    <Icon className="w-3 h-3" /> {meta.label}
                  </span>
                  {it.target && <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text)]">{it.target}</span>}
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{STATUS_LABEL[it.status] ?? it.status}</span>
                  <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{it.dsaArticle}</span>
                </div>
                <span className="text-xs text-[var(--color-text-dim)] whitespace-nowrap">
                  {new Date(it.actionDate).toLocaleDateString("en-GB", { month: "short", year: "numeric" })}
                </span>
              </div>

              <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 leading-snug">{it.title}</h3>
              <p className="text-xs text-[var(--color-text-muted)] leading-relaxed mb-2">{it.summary}</p>

              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-1">
                  {it.concerns.map((c) => (
                    <span key={c} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{c.replace(/_/g, " ")}</span>
                  ))}
                </div>
                <a href={it.sourceUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline whitespace-nowrap">
                  Source <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </li>
          );
        })}
      </ul>

      <p className="text-[11px] text-[var(--color-text-dim)]">
        All entries verified against primary Commission / DSA sources. Generated {new Date(data.generated_at).toLocaleString("en-GB")}.
      </p>
    </div>
  );
}
