"use client";

import { useEffect, useState } from "react";
import {
  ExternalLink, Loader2, Search, X, Calendar, AlertCircle,
  FileText, MessageSquare, Microscope, Scale, Vote, Users, ClipboardList,
} from "lucide-react";
import type { PolicySignalItem, PolicySignalsResponse, PolicySignalType, PolicySignalStatus } from "@/types/children-policy-ui";

const TYPE_META: Record<PolicySignalType, { label: string; icon: typeof FileText; tone: string; bg: string; text: string }> = {
  research_project:       { label: "Research project",     icon: Microscope,    tone: "purple", bg: "var(--color-purple-soft)", text: "var(--color-purple)" },
  opinion_or_guidance:    { label: "Opinion / guidance",   icon: Scale,         tone: "accent", bg: "var(--color-accent-soft)", text: "var(--color-accent)" },
  consultation_open:      { label: "Consultation OPEN",    icon: MessageSquare, tone: "success",bg: "var(--color-success-soft)",text: "var(--color-success)" },
  consultation_closed:    { label: "Consultation closed",  icon: MessageSquare, tone: "dim",    bg: "var(--color-surface-2)",   text: "var(--color-text-dim)" },
  bill_introduced:        { label: "Bill introduced",      icon: FileText,      tone: "gold",   bg: "var(--color-gold-soft)",   text: "var(--color-gold)" },
  bill_adopted:           { label: "Bill adopted",         icon: FileText,      tone: "danger", bg: "var(--color-danger-soft)", text: "var(--color-danger)" },
  parliamentary_question: { label: "Parliament question",  icon: Vote,          tone: "cyan",   bg: "var(--color-cyan-soft)",   text: "var(--color-cyan)" },
  position_paper:         { label: "Position paper",       icon: ClipboardList, tone: "accent", bg: "var(--color-accent-soft)", text: "var(--color-accent)" },
  work_programme:         { label: "Work programme",       icon: ClipboardList, tone: "purple", bg: "var(--color-purple-soft)", text: "var(--color-purple)" },
  stakeholder_event:      { label: "Stakeholder event",    icon: Users,         tone: "cyan",   bg: "var(--color-cyan-soft)",   text: "var(--color-cyan)" },
};

const STATUS_LABEL: Record<PolicySignalStatus, string> = {
  upcoming: "Upcoming", open: "Open", in_progress: "In progress",
  closed: "Closed", adopted: "Adopted", withdrawn: "Withdrawn",
};

export function PolicyRadar() {
  const [data, setData] = useState<PolicySignalsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [signalType, setSignalType] = useState<string>("");
  const [status, setStatus] = useState<string>("");
  const [minRelevance, setMinRelevance] = useState<string>("50");
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
    if (signalType)   params.set("signal_type", signalType);
    if (status)       params.set("status", status);
    if (minRelevance) params.set("min_relevance", minRelevance);
    if (qDebounced)   params.set("q", qDebounced);
    params.set("limit", "50");

    fetch(`/api/children-v2/policy?${params}`, { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: PolicySignalsResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData({ items: [], total: 0, limit: 50, offset: 0 }); })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [signalType, status, minRelevance, qDebounced]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2 p-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-dim)]" />
          <input
            type="text"
            placeholder="Search signals, themes, frameworks..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="w-full pl-9 pr-9 py-2 text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] focus:outline-none focus:border-[var(--color-accent)]"
          />
          {q && (
            <button type="button" onClick={() => setQ("")} className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-[var(--color-text-dim)] hover:text-[var(--color-text)]" aria-label="Clear">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <select value={signalType} onChange={(e) => setSignalType(e.target.value)} className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]">
          <option value="">All signal types</option>
          {Object.entries(TYPE_META).map(([k, m]) => <option key={k} value={k}>{m.label}</option>)}
        </select>

        <select value={status} onChange={(e) => setStatus(e.target.value)} className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]">
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>

        <select value={minRelevance} onChange={(e) => setMinRelevance(e.target.value)} className="text-sm rounded-md bg-[var(--color-bg)] border border-[var(--color-border)] text-[var(--color-text)] py-2 px-3 focus:outline-none focus:border-[var(--color-accent)]">
          <option value="0">All relevance</option>
          <option value="50">Relevance ≥ 50</option>
          <option value="70">Relevance ≥ 70</option>
          <option value="90">Relevance ≥ 90 only</option>
        </select>
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
            {data.total.toLocaleString()} {data.total === 1 ? "signal" : "signals"}
            {qDebounced && ` matching "${qDebounced}"`}
          </div>
          <ul className="space-y-3">
            {data.items.map((s) => <SignalCard key={s.id} s={s} />)}
          </ul>
        </>
      )}
    </div>
  );
}

function SignalCard({ s }: { s: PolicySignalItem }) {
  const meta = TYPE_META[s.signalType] ?? TYPE_META.position_paper;
  const Icon = meta.icon;
  const deadlineNear = isDeadlineNear(s.deadlineDate);

  return (
    <li className="rounded-lg border bg-[var(--color-surface)] p-4 hover:border-[var(--color-border-accent)] transition-colors" style={{ borderColor: "var(--color-border)" }}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex flex-wrap items-center gap-2">
          <span
            className="inline-flex items-center gap-1 text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded"
            style={{ background: meta.bg, color: meta.text }}
          >
            <Icon className="w-3 h-3" />
            {meta.label}
          </span>
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
            {STATUS_LABEL[s.status]}
          </span>
          {s.sourceAcronym && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">
              {s.sourceAcronym}
            </span>
          )}
          <span className="text-xs text-[var(--color-text-dim)]">
            {new Date(s.signalDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
          </span>
        </div>
        <div className="flex items-center gap-2 whitespace-nowrap">
          <span className="text-[10px] uppercase tracking-wider text-[var(--color-text-dim)]">Relevance</span>
          <span className="text-sm font-semibold tabular-nums" style={{ color: relevanceColor(s.relevanceScore) }}>
            {s.relevanceScore}
          </span>
        </div>
      </div>

      <h3 className="text-sm font-semibold text-[var(--color-text)] mb-1 leading-snug">{s.titleEn}</h3>
      {s.titleOriginal !== s.titleEn && (
        <p className="text-[11px] text-[var(--color-text-dim)] italic mb-2 leading-snug">{s.titleOriginal}</p>
      )}
      <p className="text-xs text-[var(--color-text-muted)] mb-3 leading-relaxed">{s.summaryEn}</p>

      {s.whyItMatters && (
        <div className="mb-3 px-3 py-2 rounded border-l-2 border-[var(--color-accent)] bg-[var(--color-accent-soft)]/30">
          <div className="text-[10px] uppercase tracking-wider text-[var(--color-accent)] mb-0.5 font-medium">Why it matters</div>
          <p className="text-xs text-[var(--color-text-muted)] leading-relaxed">{s.whyItMatters}</p>
        </div>
      )}

      {s.deadlineDate && (
        <div className={`inline-flex items-center gap-1 text-xs mb-2 px-2 py-1 rounded ${
          deadlineNear ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"
        }`}>
          {deadlineNear ? <AlertCircle className="w-3 h-3" /> : <Calendar className="w-3 h-3" />}
          Deadline: {new Date(s.deadlineDate).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
        </div>
      )}

      <div className="flex flex-wrap gap-1 mb-2">
        {s.themes.slice(0, 6).map((t) => (
          <span key={t} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">
            {t.replace(/_/g, " ")}
          </span>
        ))}
        {s.legalFrameworks.slice(0, 4).map((f) => (
          <span key={f} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
            {f.replace(/_/g, " ")}
          </span>
        ))}
      </div>

      <div className="flex items-center justify-between mt-2">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-[var(--color-text-dim)]">
          {s.stakeholders.length > 0 && (
            <span>Stakeholders: {s.stakeholders.slice(0, 3).map((x) => x.replace(/_/g, " ")).join(", ")}{s.stakeholders.length > 3 ? ` +${s.stakeholders.length - 3}` : ""}</span>
          )}
        </div>
        <a
          href={s.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline"
        >
          Source <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </li>
  );
}

function EmptyState() {
  return (
    <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
      <p className="text-sm text-[var(--color-text-muted)]">No policy signals match these filters.</p>
      <p className="text-xs text-[var(--color-text-dim)] mt-1">FRA, EDPB and other EU policy sources are scanned every 6 hours. New signals appear automatically.</p>
    </div>
  );
}

function relevanceColor(score: number): string {
  if (score >= 90) return "var(--color-danger)";
  if (score >= 70) return "var(--color-gold)";
  if (score >= 50) return "var(--color-accent)";
  return "var(--color-text-dim)";
}

function isDeadlineNear(d: string | null): boolean {
  if (!d) return false;
  const ms = new Date(d).getTime() - Date.now();
  return ms > 0 && ms < 14 * 24 * 3600 * 1000;
}
