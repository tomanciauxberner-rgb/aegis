"use client";

import { useState } from "react";
import { ShieldAlert, List } from "lucide-react";
import { ComplianceGapEngine } from "@/components/children/compliance-gap-engine";
import { AppRadar } from "@/components/children/app-radar";

type View = "gaps" | "radar";

export function AppTab() {
  const [view, setView] = useState<View>("gaps");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        <button
          onClick={() => setView("gaps")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "gaps" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          Compliance gaps
        </button>
        <button
          onClick={() => setView("radar")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "radar" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <List className="w-3.5 h-3.5" />
          Full radar
        </button>
      </div>

      {view === "gaps" ? <ComplianceGapEngine /> : <AppRadar />}
    </div>
  );
}
