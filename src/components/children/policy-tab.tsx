"use client";

import { useState } from "react";
import { Zap, List } from "lucide-react";
import { ForwardSignal } from "@/components/children/forward-signal";
import { PolicyRadar } from "@/components/children/policy-radar";

type View = "forward" | "all";

export function PolicyTab() {
  const [view, setView] = useState<View>("forward");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        <button
          onClick={() => setView("forward")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "forward" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Zap className="w-3.5 h-3.5" />
          Action windows
        </button>
        <button
          onClick={() => setView("all")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "all" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          All signals
        </button>
      </div>

      {view === "forward" ? <ForwardSignal /> : <PolicyRadar />}
    </div>
  );
}
