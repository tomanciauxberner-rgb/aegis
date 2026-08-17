import type { Metadata } from "next";
import Link from "next/link";
import {
  BRIDGE_MAPPINGS,
  COVERAGE_DISCLAIMER,
  type BridgeMapping,
} from "@/lib/compliance-bridge/mappings";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aegis-eu.com";

export const metadata: Metadata = {
  title: "ISO 42001 vs the EU AI Act — Coverage, Gaps, Verdict",
  description:
    "Does ISO/IEC 42001 make you AI Act compliant? A source-verified, clause-by-clause crosswalk: high and partial alignments, and the five obligations with no ISO equivalent at all.",
  alternates: { canonical: "/iso-42001-vs-eu-ai-act" },
  openGraph: {
    title: "ISO 42001 vs the EU AI Act — Coverage, Gaps, Verdict",
    description:
      "A source-verified, clause-by-clause crosswalk between ISO/IEC 42001 and the EU AI Act — including the five obligations certification does not touch.",
    url: "/iso-42001-vs-eu-ai-act",
    type: "article",
  },
};

const FAQ: { q: string; a: string }[] = [
  {
    q: "Does ISO/IEC 42001 certification make an organisation EU AI Act compliant?",
    a: "No. ISO/IEC 42001 is a management-system standard; the EU AI Act is product legislation. Certification provides no presumption of conformity: conformity assessment, CE marking, EU database registration, post-market monitoring and serious-incident reporting all sit outside the standard.",
  },
  {
    q: "Which AI Act obligations does ISO 42001 directly support?",
    a: "Four obligations show high alignment in this crosswalk: risk management (Clause 6.1 → Art. 9), data and data governance (Clause 6.2 + Annex B → Art. 10), transparency and information to deployers (Annex A.8 → Art. 13), and human oversight (Annex A.9 → Art. 14). Each still requires AI Act-specific enhancements.",
  },
  {
    q: "Where is ISO 42001 support only partial?",
    a: "Two places: technical documentation — Clause 7.5 establishes documentation practice but not the specific Annex IV content, retained 10 years after market placement — and record-keeping, where Clause 9.1 requires monitoring while Art. 12 mandates automatic event logging with traceability and retention.",
  },
  {
    q: "Which AI Act obligations have no ISO 42001 equivalent at all?",
    a: "Five: conformity assessment (Art. 43), CE marking (Art. 48), registration in the EU database (Art. 49 and 71), post-market monitoring (Art. 72), and serious-incident reporting (Art. 73).",
  },
  {
    q: "Can any standard give a presumption of conformity with the AI Act?",
    a: "Under Article 40, presumption of conformity attaches to harmonised European standards once they are cited in the Official Journal — standardisation work led by CEN-CENELEC JTC 21 (see prEN 18286). ISO/IEC 42001 itself carries no such presumption.",
  },
  {
    q: "Is this mapping legal advice?",
    a: "No. It reflects published crosswalk analysis and the primary legal text, and must be validated against the current legal text before reliance.",
  },
];

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: FAQ.map((f) => ({
    "@type": "Question",
    name: f.q,
    acceptedAnswer: { "@type": "Answer", text: f.a },
  })),
};

const ALIGN_META: Record<string, { color: string; label: string }> = {
  high: { color: "#34d399", label: "High" },
  partial: { color: "#e8b84b", label: "Partial" },
  gap: { color: "#ff5c5c", label: "Gap" },
};

export default function Iso42001VsAiActPage() {
  const alignments = BRIDGE_MAPPINGS.filter((m): m is BridgeMapping & { iso: NonNullable<BridgeMapping["iso"]> } => m.iso !== null);
  const gaps = BRIDGE_MAPPINGS.filter((m) => m.iso === null);
  const high = alignments.filter((m) => m.alignment === "high").length;
  const partial = alignments.filter((m) => m.alignment === "partial").length;

  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <Link href="/rights-graph" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Rights Graph</Link>
            <Link href="/ai-act-scenarios" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Scenario Engine</Link>
            <Link href="/code-radar" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Code Radar</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 900, margin: "0 auto", padding: "48px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#a78bfa", marginBottom: 14 }}>
          Compliance Bridge · Open Analysis
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 20 }}>
          ISO 42001 vs the EU AI Act: what certification covers — and where it stops
        </h1>

        {/* Direct answer — the quotable block */}
        <div style={{ border: "1px solid rgba(167,139,250,0.3)", borderRadius: 14, padding: 22, background: "linear-gradient(180deg, rgba(167,139,250,0.07), rgba(255,255,255,0.02))", marginBottom: 28 }}>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.9)" }}>
            <strong>ISO/IEC 42001 certification is not EU AI Act compliance.</strong> The standard genuinely supports several
            AI Act obligations — risk management, data governance, transparency, human oversight — but five core obligations
            have no ISO 42001 equivalent at all: conformity assessment, CE marking, EU database registration, post-market
            monitoring, and serious-incident reporting. Anyone selling certification as conformity is selling the first half
            and hiding the second.
          </p>
        </div>

        {/* Verdict strip — computed from the live mapping data */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 40 }}>
          <Stat value={String(BRIDGE_MAPPINGS.length)} label="Mappings, source-verified" color="#fff" />
          <Stat value={String(high)} label="High alignment" color="#34d399" />
          <Stat value={String(partial)} label="Partial alignment" color="#e8b84b" />
          <Stat value={String(gaps.length)} label="No ISO equivalent" color="#ff5c5c" />
        </div>

        {/* Alignments table — real HTML table, crawlable */}
        <h2 style={h2Style}>Where ISO 42001 supports the AI Act</h2>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", marginBottom: 40 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={thStyle}>ISO/IEC 42001</th>
                <th style={thStyle}>EU AI Act</th>
                <th style={thStyle}>Alignment</th>
                <th style={thStyle}>What it means in practice</th>
              </tr>
            </thead>
            <tbody>
              {alignments.map((m) => {
                const meta = ALIGN_META[m.alignment];
                return (
                  <tr key={m.id} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>{m.iso.ref}</strong>
                      <span style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{m.iso.title}</span>
                    </td>
                    <td style={tdStyle}>
                      <strong style={{ color: "#fff" }}>{m.aiAct.ref}</strong>
                      <span style={{ display: "block", color: "rgba(255,255,255,0.55)", fontSize: 12 }}>{m.aiAct.title}</span>
                    </td>
                    <td style={{ ...tdStyle, whiteSpace: "nowrap" }}>
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, background: `${meta.color}22`, color: meta.color }}>
                        {meta.label}
                      </span>
                    </td>
                    <td style={{ ...tdStyle, color: "rgba(255,255,255,0.65)", lineHeight: 1.55 }}>{m.note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* The gaps */}
        <h2 style={h2Style}>The five obligations certification does not touch</h2>
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)", maxWidth: 760, marginBottom: 16 }}>
          These are not enhancements or documentation deltas — they are regulatory acts and systems the standard has no
          mechanism for. An organisation can hold a flawless ISO 42001 certificate and have done none of the following.
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {gaps.map((m) => (
            <div key={m.id} style={{ border: "1px solid rgba(255,92,92,0.25)", borderRadius: 12, padding: 18, background: "rgba(255,92,92,0.04)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: "#fff" }}>{m.aiAct.ref} — {m.aiAct.title}</span>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", padding: "3px 8px", borderRadius: 5, background: "rgba(255,92,92,0.13)", color: "#ff5c5c", whiteSpace: "nowrap" }}>
                  No ISO equivalent
                </span>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.55, color: "rgba(255,255,255,0.65)" }}>{m.note}</p>
            </div>
          ))}
        </div>

        {/* FAQ — visible content matches the JSON-LD exactly */}
        <h2 style={h2Style}>Frequently asked questions</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {FAQ.map((f) => (
            <div key={f.q} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.q}</h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>{f.a}</p>
            </div>
          ))}
        </div>

        {/* Method, sources, disclaimer */}
        <h2 style={h2Style}>Method and sources</h2>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)", marginBottom: 40 }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)", marginBottom: 12 }}>
            Every mapping on this page is rendered directly from the source-verified crosswalk behind the AEGIS Compliance
            Bridge — grounded in the ISO/IEC 42001:2023 clause and Annex A structure, the primary text of{" "}
            <a href="https://eur-lex.europa.eu/eli/reg/2024/1689/oj" target="_blank" rel="noopener noreferrer" style={aStyle}>
              Regulation (EU) 2024/1689
            </a>{" "}
            (Arts. 9–14, 11 + Annex IV, 43, 48, 49, 71, 72, 73), and published control-by-control crosswalk analyses
            (Glacis, Modulos, prEN 18286 Annex D). Sources verified June 2026.
          </p>
          <p style={{ fontSize: 12, lineHeight: 1.6, color: "rgba(255,255,255,0.5)", fontStyle: "italic" }}>{COVERAGE_DISCLAIMER}</p>
        </div>

        {/* CTAs */}
        <div style={{ padding: 28, border: "1px solid rgba(79,124,255,0.3)", borderRadius: 16, background: "linear-gradient(180deg, rgba(79,124,255,0.07), rgba(255,255,255,0.02))", marginBottom: 28 }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>
            Use this crosswalk
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 740, marginBottom: 16 }}>
            The full mapping is published as an open dataset — machine-readable JSON, schema-validated, versioned, CC BY 4.0,
            with GitHub-native citation. Corrections are welcome with primary sources. The interactive version — click a
            clause, light up the articles it supports — lives in the AEGIS Compliance Bridge (contributor access).
          </p>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <a
              href="https://github.com/Thinklanceai/ai-act-iso42001-crosswalk"
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}
            >
              Open the dataset →
            </a>
            <Link
              href="/compliance-bridge"
              style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "transparent", color: "#4f7cff", border: "1px solid rgba(79,124,255,0.4)", borderRadius: 9, textDecoration: "none" }}
            >
              Interactive Compliance Bridge
            </Link>
          </div>
        </div>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          Related: <Link href="/ai-act-scenarios" style={aStyle}>classify your system under the AI Act</Link> ·{" "}
          <Link href="/rights-graph" style={aStyle}>the EU high-risk systems map</Link> ·{" "}
          <Link href="/code-radar" style={aStyle}>who publishes public-sector code in Europe</Link>
        </p>
      </main>
    </div>
  );
}

const h2Style: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" };
const tdStyle: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };
const aStyle: React.CSSProperties = { color: "#4f7cff", textDecoration: "none" };

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
