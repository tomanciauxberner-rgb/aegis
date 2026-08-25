"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Precedent {
  id: string; court: string; name: string; citation: string; year: number;
  country: string | null; holding: string; relevance: string;
  sectors: string[]; aiActArticles: string[]; rightsCategories: string[]; url: string | null;
}
interface SystemBlock {
  systemId: string; systemName: string; area: string; riskTier: string;
  precedentCount: number; precedents: Precedent[];
}
interface Resp { systems: SystemBlock[]; note: string; }

const AREA_LABEL: Record<string, string> = {
  biometrics: "Biometrics", critical_infra: "Critical infrastructure", education: "Education",
  employment: "Employment", essential: "Essential services", law_enforcement: "Law enforcement",
  migration: "Migration & asylum", justice: "Justice & democracy",
};
const COURT_COLOR: Record<string, string> = { CJEU: "#4f7cff", ECHR: "#a06bff", DPA: "#34d399", national: "#e8b84b" };
const REL_LABEL: Record<string, string> = { binding: "Binding", persuasive: "Persuasive", illustrative: "Illustrative" };

export default function PrecedentsPage() {
  const [data, setData] = useState<Resp | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/rights-graph/precedents")
      .then((r) => r.ok ? r.json() : Promise.reject(r))
      .then((d: Resp) => setData(d))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <main style={{ maxWidth: 1000, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#a06bff", marginBottom: 14 }}>Rights Precedent System · Beta</p>
        <h1 style={{ fontSize: 32, fontWeight: 800, color: "#fff", lineHeight: 1.18, marginBottom: 16 }}>
          For each high-risk system, the case law that already shapes it.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 800, marginBottom: 12 }}>
          When you assess a deployment, the first question is rarely &quot;what does the Act say&quot; — it&apos;s &quot;has a court or authority already ruled on something like this?&quot; Aegis links every mapped high-risk system to the binding and persuasive precedents in its regulatory sector: the holding, the court, how strongly it binds.
        </p>
        {data?.note && (
          <div style={{ display: "inline-block", fontSize: 12, color: "rgba(255,255,255,0.6)", border: "1px solid rgba(160,107,255,0.3)", background: "rgba(160,107,255,0.06)", borderRadius: 8, padding: "8px 12px", marginBottom: 36 }}>
            {data.note}
          </div>
        )}

        {loading ? (
          <p style={{ color: "rgba(255,255,255,0.5)" }}>Matching systems to precedents…</p>
        ) : !data || data.systems.length === 0 ? (
          <div style={{ border: "1px dashed rgba(255,255,255,0.15)", borderRadius: 12, padding: 32, textAlign: "center" }}>
            <p style={{ color: "rgba(255,255,255,0.6)" }}>The graph is being seeded.</p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {data.systems.map((s) => (
              <section key={s.systemId} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 20, background: "rgba(255,255,255,0.02)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap", marginBottom: 14, alignItems: "baseline" }}>
                  <h2 style={{ fontSize: 16, fontWeight: 700, color: "#fff" }}>{s.systemName}</h2>
                  <span style={{ fontSize: 11, color: "rgba(255,255,255,0.5)" }}>{AREA_LABEL[s.area] ?? s.area} · {s.precedentCount} precedent{s.precedentCount !== 1 ? "s" : ""}</span>
                </div>
                {s.precedents.length === 0 ? (
                  <p style={{ fontSize: 13, color: "rgba(255,255,255,0.45)" }}>No precedent in the graph for this sector yet.</p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {s.precedents.map((p) => (
                      <div key={p.id} style={{ borderLeft: `2px solid ${COURT_COLOR[p.court] ?? "#888"}`, paddingLeft: 14 }}>
                        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "baseline", marginBottom: 3 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: "#fff" }}>{p.name}</span>
                          <span style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>{p.citation} · {p.year}</span>
                          <Tag text={p.court} color={COURT_COLOR[p.court] ?? "#888"} />
                          <Tag text={REL_LABEL[p.relevance] ?? p.relevance} color={p.relevance === "binding" ? "#ff7676" : "rgba(255,255,255,0.5)"} />
                        </div>
                        <p style={{ fontSize: 12.5, lineHeight: 1.55, color: "rgba(255,255,255,0.7)", marginBottom: 4 }}>{p.holding}</p>
                        {p.url && <a href={p.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", textDecoration: "none" }}>Source ↗</a>}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            ))}
          </div>
        )}

        <div style={{ marginTop: 32, padding: 28, border: "1px solid rgba(160,107,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(160,107,255,0.07), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#a06bff", marginBottom: 10 }}>Know a ruling we&apos;re missing?</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 760, marginBottom: 16 }}>
            Precedent is what turns a risk into a known quantity. Each sourced ruling added — CJEU, ECHR, a DPA decision, a national judgment — sharpens the picture for every system in its sector. That is exactly the kind of contribution that compounds.
          </p>
          <Link href="/" style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#a06bff", color: "#fff", borderRadius: 9, textDecoration: "none" }}>
            Request contributor access →
          </Link>
        </div>
      </main>
    </div>
  );
}

function Tag({ text, color }: { text: string; color: string }) {
  return <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "2px 7px", borderRadius: 5, background: `${color}1a`, color, whiteSpace: "nowrap" }}>{text}</span>;
}
