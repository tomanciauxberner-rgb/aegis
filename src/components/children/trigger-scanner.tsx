"use client";

import { useState, useTransition } from "react";
import { ScanSearch, AlertTriangle, ShieldCheck, Clock, Euro, ExternalLink, Filter } from "lucide-react";
import type { TriggerScanResult, TriggerObligation, DetectedSignal } from "@/lib/children/trigger-engine";

const KNOWN_JURISDICTIONS = ["EU", "US", "GB", "CA", "BR", "AU", "IN", "SG", "KR"] as const;

const TIMING_LABEL: Record<string, string> = {
  immediate:       "Immediate",
  pre_deployment:  "Before deployment",
  within_72h:      "Within 72 h",
  within_30d:      "Within 30 days",
};

const TIMING_COLOR: Record<string, string> = {
  immediate:       "bg-[var(--color-danger-soft)] text-[var(--color-danger)]",
  pre_deployment:  "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  within_72h:      "bg-[var(--color-warning-soft)] text-[var(--color-warning)]",
  within_30d:      "bg-[var(--color-accent-soft)] text-[var(--color-accent)]",
};

function SignalPill({ signal }: { signal: DetectedSignal }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[var(--color-accent-soft)] text-[var(--color-accent)]">
      {signal.type.replace(/_/g, " ")}
      <span className="opacity-60">·{Math.round(signal.confidence * 100)}%</span>
    </span>
  );
}

function ObligationCard({ ob }: { ob: TriggerObligation }) {
  const timingClass = TIMING_COLOR[ob.timing] ?? "bg-[var(--color-surface)] text-[var(--color-text-muted)]";
  return (
    <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-text)] leading-snug">{ob.title}</p>
          <p className="text-[11px] text-[var(--color-text-muted)] mt-0.5 font-mono">{ob.rule_id}</p>
        </div>
        <span className={`shrink-0 text-[11px] font-medium px-2 py-0.5 rounded-full ${timingClass}`}>
          {TIMING_LABEL[ob.timing] ?? ob.timing}
        </span>
      </div>

      <p className="text-sm text-[var(--color-text-muted)] leading-relaxed">{ob.description}</p>

      <div className="rounded-lg bg-[var(--color-bg)] border border-[var(--color-border)] px-3 py-2">
        <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)] mb-1">Action required</p>
        <p className="text-sm text-[var(--color-text)]">{ob.action_required}</p>
      </div>

      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[var(--color-text-muted)]">
        {ob.max_fine_eur !== null && (
          <span className="flex items-center gap-1">
            <Euro className="w-3 h-3" />
            {ob.max_fine_eur >= 1_000_000
              ? `${(ob.max_fine_eur / 1_000_000).toFixed(0)}M max fine`
              : `${ob.max_fine_eur.toLocaleString()} max fine`}
          </span>
        )}
        {ob.max_fine_pct_revenue !== null && (
          <span>{ob.max_fine_pct_revenue}% of global revenue</span>
        )}
        {ob.enforcing_authority.length > 0 && (
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            {ob.enforcing_authority.join(", ")}
          </span>
        )}
        {ob.source_url && (
          <a
            href={ob.source_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-[var(--color-accent)] hover:underline ml-auto"
          >
            Source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>

      {ob.triggered_by.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {ob.triggered_by.map((s) => (
            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--color-surface-alt)] text-[var(--color-text-dim)]">
              {s.replace(/_/g, " ")}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export function TriggerScanner() {
  const [text, setText] = useState("");
  const [jurisdiction, setJurisdiction] = useState<string>("");
  const [result, setResult] = useState<TriggerScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [jurisdictionFilter, setJurisdictionFilter] = useState<string>("");

  const charCount = text.length;
  const atLimit = charCount >= 50_000;

  function handleScan() {
    if (!text.trim()) return;
    setError(null);
    startTransition(async () => {
      try {
        const res = await fetch("/api/children-v2/trigger-scan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            text,
            ...(jurisdiction ? { jurisdiction } : {}),
          }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data?.error ?? "Scan failed.");
          return;
        }
        setResult(data as TriggerScanResult);
      } catch {
        setError("Network error. Please retry.");
      }
    });
  }

  const filteredObligations = result
    ? jurisdictionFilter
      ? result.obligations.filter((ob) =>
          ob.rule_id.toLowerCase().startsWith(jurisdictionFilter.toLowerCase())
        )
      : result.obligations
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 flex flex-col gap-3">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value.slice(0, 50_000))}
          placeholder="Paste any policy text, privacy notice, terms of service, product description… The engine detects regulatory triggers for children's data protection."
          className="w-full min-h-[160px] resize-y rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] placeholder:text-[var(--color-text-dim)] p-3 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          disabled={isPending}
        />
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={jurisdiction}
            onChange={(e) => setJurisdiction(e.target.value)}
            disabled={isPending}
            className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-sm text-[var(--color-text)] px-3 py-2 focus:outline-none focus:ring-1 focus:ring-[var(--color-accent)]"
          >
            <option value="">All jurisdictions</option>
            {KNOWN_JURISDICTIONS.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>

          <span className={`text-[11px] ml-auto ${atLimit ? "text-[var(--color-danger)]" : "text-[var(--color-text-dim)]"}`}>
            {charCount.toLocaleString()} / 50,000
          </span>

          <button
            onClick={handleScan}
            disabled={isPending || !text.trim()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[var(--color-accent)] text-white disabled:opacity-40 hover:opacity-90 transition-opacity"
          >
            <ScanSearch className="w-4 h-4" />
            {isPending ? "Scanning…" : "Scan"}
          </button>
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-[var(--color-danger)] bg-[var(--color-danger-soft)] px-4 py-3 text-sm text-[var(--color-danger)]">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          {error}
        </div>
      )}

      {result && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Signals detected",  value: result.signal_count },
              { label: "Obligations",        value: result.obligation_count },
              { label: "Jurisdictions hit",  value: result.jurisdictions.length },
              { label: "Scanned at",         value: new Date(result.scanned_at).toLocaleTimeString() },
            ].map(({ label, value }) => (
              <div key={label} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-[var(--color-text-dim)] mb-1">{label}</p>
                <p className="text-xl font-semibold text-[var(--color-text)]">{value}</p>
              </div>
            ))}
          </div>

          {result.signals.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {result.signals.map((s, i) => (
                <SignalPill key={i} signal={s} />
              ))}
            </div>
          )}

          {result.obligations.length > 0 && (
            <div className="flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold text-[var(--color-text)]">
                  Obligations <span className="font-normal text-[var(--color-text-muted)]">· sorted by urgency</span>
                </p>
                <div className="ml-auto flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-[var(--color-text-dim)]" />
                  <select
                    value={jurisdictionFilter}
                    onChange={(e) => setJurisdictionFilter(e.target.value)}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-bg)] text-[11px] text-[var(--color-text)] px-2 py-1 focus:outline-none"
                  >
                    <option value="">All</option>
                    {KNOWN_JURISDICTIONS.map((j) => (
                      <option key={j} value={j}>{j}</option>
                    ))}
                  </select>
                </div>
              </div>
              {filteredObligations.length === 0 ? (
                <p className="text-sm text-[var(--color-text-muted)]">No obligations for this jurisdiction filter.</p>
              ) : (
                filteredObligations.map((ob) => (
                  <ObligationCard key={ob.rule_id} ob={ob} />
                ))
              )}
            </div>
          )}

          {result.signals.length === 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3 text-sm text-[var(--color-text-muted)]">
              <ShieldCheck className="w-4 h-4 text-[var(--color-success)]" />
              No regulatory triggers detected in this text.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
