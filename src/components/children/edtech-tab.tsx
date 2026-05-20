"use client";

import { useState } from "react";
import { Gauge, Map as MapIcon } from "lucide-react";
import { DeploymentRiskAtlas } from "@/components/children/deployment-risk-atlas";
import { EdtechMap } from "@/components/children/edtech-map";

type View = "atlas" | "map";

export function EdtechTab() {
  const [view, setView] = useState<View>("atlas");

  return (
    <div className="space-y-4">
      <div className="inline-flex rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-1">
        <button
          onClick={() => setView("atlas")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "atlas" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <Gauge className="w-3.5 h-3.5" />
          Risk atlas
        </button>
        <button
          onClick={() => setView("map")}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
            view === "map" ? "bg-[var(--color-accent)] text-white" : "text-[var(--color-text-muted)] hover:text-[var(--color-text)]"
          }`}
        >
          <MapIcon className="w-3.5 h-3.5" />
          Country map
        </button>
      </div>

      {view === "atlas" ? <DeploymentRiskAtlas /> : <EdtechMap />}
    </div>
  );
}
