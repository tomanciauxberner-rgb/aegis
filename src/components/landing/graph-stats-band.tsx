"use client";

import { useEffect, useState } from "react";

interface Stats {
  systems: number; highRisk: number; knownFria: number; friaGap: number;
  domains: number; countries: number; rightsLinks: number; sources: number;
  positions: number; divergingTopics: number;
}

export function GraphStatsBand() {
  const [s, setS] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    fetch("/api/rights-graph/stats")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: Stats) => setS(d))
      .catch(() => setFailed(true));
  }, []);

  if (failed) return null;

  const items = s
    ? [
        { v: s.systems, l: "AI systems mapped" },
        { v: s.domains, l: "Annex III domains" },
        { v: s.countries, l: "countries" },
        { v: s.sources, l: "primary sources" },
        { v: s.friaGap, l: "high-risk, no known FRIA" },
        { v: s.divergingTopics, l: "topics where regulators diverge" },
      ]
    : null;

  return (
    <div className="gsb-wrap">
      <div className="gsb-grid">
        {(items ?? Array.from({ length: 6 })).map((it, i) => (
          <div key={i} className="gsb-cell">
            <span className="gsb-value">{items ? (it as { v: number }).v : "—"}</span>
            <span className="gsb-label">{items ? (it as { l: string }).l : "loading"}</span>
          </div>
        ))}
      </div>
      <p className="gsb-note">
        Live counts from the Rights Graph. Deliberately small and fully sourced — the figures grow as verified contributions are added, never by scraping.
      </p>
      <style>{`
        .gsb-wrap { margin: 0 0 28px; }
        .gsb-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 1px;
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
        }
        .gsb-cell {
          background: #0d1b35;
          padding: 16px 14px;
          display: flex;
          flex-direction: column;
          gap: 5px;
          text-align: left;
        }
        .gsb-value { font-size: 26px; font-weight: 800; color: #fff; line-height: 1; }
        .gsb-label { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.3; }
        .gsb-note { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 10px; line-height: 1.5; }
      `}</style>
    </div>
  );
}
