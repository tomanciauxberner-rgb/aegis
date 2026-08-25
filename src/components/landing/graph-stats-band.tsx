import type { RightsGraphStats } from "@/lib/rights-graph-stats";

export function GraphStatsBand({ stats }: { stats: RightsGraphStats | null }) {
  if (!stats) return null;

  const anchored = stats.positions > 0 && stats.positionsAnchored !== undefined;

  const items: { v: number | string; l: string }[] = [
    { v: stats.systems, l: "AI systems mapped" },
    { v: stats.domains, l: "Annex III domains" },
    { v: stats.countries, l: "countries" },
    { v: stats.friaGap, l: "high-risk, no publicly known FRIA" },
    { v: stats.divergingTopics, l: "topics where regulators diverge" },
    anchored
      ? { v: `${stats.positionsAnchored}/${stats.positions}`, l: "positions anchored to the regulator's own text" }
      : { v: stats.sources, l: "sources on record" },
  ];

  return (
    <div className="gsb-wrap">
      <div className="gsb-grid">
        {items.map((it) => (
          <div key={it.l} className="gsb-cell">
            <span className="gsb-value">{it.v}</span>
            <span className="gsb-label">{it.l}</span>
          </div>
        ))}
      </div>
      <p className="gsb-note">
        Counts from the Rights Graph. Each entry carries its source and its source tier, and a position counts as anchored
        only when it quotes the regulator&apos;s own text verbatim. The figures grow as verified contributions are added, never by scraping.
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
        .gsb-cell { background: #0d1b35; padding: 16px 14px; display: flex; flex-direction: column; gap: 5px; text-align: left; }
        .gsb-value { font-size: 26px; font-weight: 800; color: #fff; line-height: 1; }
        .gsb-label { font-size: 11px; color: rgba(255,255,255,0.55); line-height: 1.3; }
        .gsb-note { font-size: 11px; color: rgba(255,255,255,0.4); margin-top: 10px; line-height: 1.5; }
      `}</style>
    </div>
  );
}
