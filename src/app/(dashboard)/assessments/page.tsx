"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus, FileCheck, Loader2, Trash2, Clock } from "lucide-react";

interface FriaListItem {
  id: string;
  title: string | null;
  status: string;
  version: number;
  overallRiskLevel: string | null;
  sourceRef: string | null;
  updatedAt: string;
  createdAt: string;
}

const STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  draft:      { bg: "var(--color-surface-2)",   text: "var(--color-text-dim)" },
  in_review:  { bg: "var(--color-gold-soft)",   text: "var(--color-gold)" },
  approved:   { bg: "var(--color-success-soft)",text: "var(--color-success)" },
  published:  { bg: "var(--color-accent-soft)", text: "var(--color-accent)" },
  archived:   { bg: "var(--color-surface-2)",   text: "var(--color-text-dim)" },
};

export default function AssessmentsPage() {
  const [items, setItems] = useState<FriaListItem[] | null>(null);

  function load() {
    fetch("/api/fria/assessments")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d) => setItems(d.items ?? []))
      .catch(() => setItems([]));
  }

  useEffect(() => { load(); }, []);

  async function remove(id: string) {
    if (!confirm("Delete this FRIA draft? This cannot be undone.")) return;
    const res = await fetch(`/api/fria/assessments/${id}`, { method: "DELETE" });
    if (res.ok) setItems((prev) => prev?.filter((i) => i.id !== id) ?? null);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">FRIA Assessments</h1>
          <p className="text-sm text-text-muted">Fundamental Rights Impact Assessments — Article 27 EU AI Act</p>
        </div>
        <Link href="/assessments/new" className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 transition-colors">
          <Plus className="w-4 h-4" />
          New assessment
        </Link>
      </div>

      {items === null ? (
        <div className="flex items-center justify-center py-16"><Loader2 className="w-6 h-6 animate-spin text-accent" /></div>
      ) : items.length === 0 ? (
        <div className="bg-surface border border-border rounded-lg p-12 text-center">
          <FileCheck className="w-10 h-10 text-text-dim mx-auto mb-4" />
          <h2 className="text-lg font-semibold mb-2">No assessments yet</h2>
          <p className="text-sm text-text-muted max-w-md mx-auto">
            Start a FRIA from scratch, or generate one directly from a system in the EdTech Risk Atlas. Drafts auto-save as you go.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {items.map((it) => {
            const st = STATUS_STYLE[it.status] ?? STATUS_STYLE.draft;
            return (
              <div key={it.id} className="flex items-center gap-3 bg-surface border border-border rounded-lg p-4 hover:border-border-accent transition-colors">
                <FileCheck className="w-5 h-5 text-accent shrink-0" />
                <Link href={`/assessments/new?id=${it.id}`} className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-text truncate">{it.title || "Untitled FRIA"}</div>
                  <div className="flex items-center gap-2 text-[11px] text-text-dim mt-0.5">
                    <Clock className="w-3 h-3" />
                    Updated {new Date(it.updatedAt).toLocaleString("en-GB")}
                    {it.sourceRef && <span>· from {it.sourceRef}</span>}
                  </div>
                </Link>
                <span className="text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded" style={{ background: st.bg, color: st.text }}>
                  {it.status.replace(/_/g, " ")}
                </span>
                <button onClick={() => remove(it.id)} className="p-1.5 text-text-dim hover:text-danger transition-colors" aria-label="Delete">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
