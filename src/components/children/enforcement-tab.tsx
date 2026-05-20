"use client";

import { useState } from "react";
import { BarChart3, List } from "lucide-react";
import { EnforcementIntelligence } from "@/components/children/enforcement-intelligence";
import { DecisionsFeed } from "@/components/children/decisions-feed";

type View = "intelligence" | "feed";

export function EnforcementTab() {
  const [view, setView] = useState<View>("intelligence");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        <button
          onClick={() => setView("intelligence")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "intelligence"
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          Intelligence
        </button>
        <button
          onClick={() => setView("feed")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "feed"
              ? "bg-[var(--color-accent)] text-white"
              : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          All decisions
        </button>
      </div>

      {view === "intelligence" ? <EnforcementIntelligence /> : <DecisionsFeed />}
    </div>
  );
}
