"use client";

import { useEffect, useState } from "react";
import { Loader2, Zap, Eye, Bookmark, ExternalLink, CalendarClock, AlertCircle } from "lucide-react";

interface ForwardSignal {
  id: string;
  signal_type: string;
  status: string;
  title_en: string;
  summary_en: string;
  signal_date: string;
  deadline_date: string | null;
  days_to_deadline: number | null;
  jurisdiction: string;
  themes: string[];
  legal_frameworks: string[];
  relevance_score: number;
  why_it_matters: string | null;
  stakeholders: string[];
  source_url: string;
  source_acronym: string | null;
  action_score: number;
  action_label: "act_now" | "monitor" | "track";
}

interface ForwardResponse {
  act_now: ForwardSignal[];
  monitor: ForwardSignal[];
  track: ForwardSignal[];
  summary: {
    total: number;
    act_now: number;
    monitor: number;
    open_consultations: number;
    next_deadline: string | null;
  } | null;
  generated_at: string;
}

export function ForwardSignal() {
  const [data, setData] = useState<ForwardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/api/children-v2/forward", { signal: controller.signal })
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: ForwardResponse) => setData(d))
      .catch((e) => { if (e?.name !== "AbortError") setData(null); })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-[var(--color-accent)]" /></div>;
  }

  if (!data || !data.summary || data.summary.total === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--color-border)] bg-[var(--color-surface)] p-8 text-center">
        <p className="text-sm text-[var(--color-text-muted)]">No forward signals yet.</p>
        <p className="text-xs text-[var(--color-text-dim)] mt-1">FRA, EDPB and EU policy sources are scanned daily. Actionable windows — open consultations, bills in progress — will surface here ranked by urgency.</p>
      </div>
    );
  }

  const s = data.summary;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="rounded-lg border border-[var(--color-danger)]/30 bg-[var(--color-danger-soft)]/30 p-4">
          <div className="flex items-center gap-2 mb-1"><Zap className="w-4 h-4 text-[var(--color-danger)]" /><span className="text-[11px] uppercase tracking-wide text-[var(--color-text-dim)]">Act now</span></div>
          <div className="text-2xl font-bold text-[var(--color-danger)]">{s.act_now}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">deadline ≤ 14 days</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-1"><Eye className="w-4 h-4 text-[var(--color-gold)]" /><span className="text-[11px] uppercase tracking-wide text-[var(--color-text-dim)]">Monitor</span></div>
          <div className="text-2xl font-bold text-[var(--color-text)]">{s.monitor}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">≤ 45 days / open</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-1"><CalendarClock className="w-4 h-4 text-[var(--color-accent)]" /><span className="text-[11px] uppercase tracking-wide text-[var(--color-text-dim)]">Open consultations</span></div>
          <div className="text-2xl font-bold text-[var(--color-text)]">{s.open_consultations}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">accepting input</div>
        </div>
        <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
          <div className="flex items-center gap-2 mb-1"><AlertCircle className="w-4 h-4 text-[var(--color-purple)]" /><span className="text-[11px] uppercase tracking-wide text-[var(--color-text-dim)]">Next deadline</span></div>
          <div className="text-base font-bold text-[var(--color-text)]">{s.next_deadline ? new Date(s.next_deadline).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "—"}</div>
          <div className="text-[11px] text-[var(--color-text-muted)]">closest action</div>
        </div>
      </div>

      {data.act_now.length > 0 && (
        <Section icon={Zap} color="var(--color-danger)" title="Act now" desc="Windows closing within two weeks — input or response required soon.">
          {data.act_now.map((sig) => <SignalRow key={sig.id} sig={sig} />)}
        </Section>
      )}

      {data.monitor.length > 0 && (
        <Section icon={Eye} color="var(--color-gold)" title="Monitor" desc="Open or approaching — worth tracking actively.">
          {data.monitor.map((sig) => <SignalRow key={sig.id} sig={sig} />)}
        </Section>
      )}

      {data.track.length > 0 && (
        <Section icon={Bookmark} color="var(--color-text-dim)" title="Track" desc="Background developments — no immediate action.">
          {data.track.slice(0, 15).map((sig) => <SignalRow key={sig.id} sig={sig} />)}
        </Section>
      )}

      <p className="text-[11px] text-[var(--color-text-dim)] pt-1">
        Action score = relevance × actionable status × deadline proximity. Generated {new Date(data.generated_at).toLocaleString("en-GB")}.
      </p>
    </div>
  );
}

function Section({ icon: Icon, color, title, desc, children }: { icon: typeof Zap; color: string; title: string; desc: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-4 h-4" style={{ color }} />
        <h3 className="text-sm font-semibold text-[var(--color-text)]">{title}</h3>
      </div>
      <p className="text-xs text-[var(--color-text-dim)] mb-3">{desc}</p>
      <div className="space-y-2">{children}</div>
    </section>
  );
}

function SignalRow({ sig }: { sig: ForwardSignal }) {
  const days = sig.days_to_deadline;
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 hover:border-[var(--color-border-accent)] transition-colors">
      <div className="flex items-start justify-between gap-3 mb-1">
        <div className="flex flex-wrap items-center gap-2">
          {sig.source_acronym && <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-dim)]">{sig.source_acronym}</span>}
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{sig.signal_type.replace(/_/g, " ")}</span>
          <span className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-surface-2)] text-[var(--color-text-muted)]">{sig.status.replace(/_/g, " ")}</span>
        </div>
        {days !== null && days >= 0 && (
          <span className={`text-[11px] font-medium whitespace-nowrap px-2 py-0.5 rounded ${days <= 14 ? "bg-[var(--color-danger-soft)] text-[var(--color-danger)]" : "bg-[var(--color-surface-2)] text-[var(--color-text-muted)]"}`}>
            {days === 0 ? "Due today" : `${days}d left`}
          </span>
        )}
      </div>
      <h4 className="text-sm font-semibold text-[var(--color-text)] leading-snug mb-1">{sig.title_en}</h4>
      {sig.why_it_matters && (
        <p className="text-[11px] text-[var(--color-text-muted)] leading-relaxed mb-2 border-l-2 border-[var(--color-accent)] pl-2">{sig.why_it_matters}</p>
      )}
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-1">
          {sig.legal_frameworks.slice(0, 3).map((f) => (
            <span key={f} className="text-[10px] uppercase tracking-wider px-1.5 py-0.5 rounded bg-[var(--color-accent-soft)] text-[var(--color-accent)]">{f.replace(/_/g, " ")}</span>
          ))}
        </div>
        <a href={sig.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-[var(--color-accent)] hover:underline whitespace-nowrap">
          Source <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}
