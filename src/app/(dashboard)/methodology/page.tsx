import Link from "next/link";

export const metadata = { title: "Methodology — Aegis", robots: { index: true, follow: true } };

const QA = [
  {
    q: "Who verifies the data?",
    a: [
      "Every entry in the Rights Graph carries one of three provenance levels, visible on the entry itself:",
      "**Verified** — added and checked by Aegis against a cited primary source (a regulation, court decision, supervisory-authority action, or documented investigation by a recognised body).",
      "**Expert-validated** — reviewed and confirmed by an approved contributor with relevant domain expertise.",
      "**Community** — proposed by a contributor and awaiting review. New submissions enter at this level by default and are labelled as unverified until checked.",
      "Provenance is never hidden. An expert can see at a glance what is solid and what is still pending.",
    ],
  },
  {
    q: "How many systems are covered?",
    a: [
      "The live count is shown on the home page and on the Rights Graph itself — and it is deliberately modest.",
      "Aegis does not claim exhaustive coverage of every AI system deployed across 27 Member States. No tool can. What it offers is a small, fully-sourced base that grows only through verified contribution.",
      "Wherever a figure is shown — the FRIA Coverage Gap, the number of diverging topics — the size of the underlying sample is shown alongside it. A gap of 'X systems without a known FRIA' is always stated as a gap across the systems mapped so far, never as a claim about all of Europe.",
    ],
  },
  {
    q: "How often is it updated?",
    a: [
      "The graph updates continuously as contributions are reviewed and as Aegis adds verified systems and regulatory positions.",
      "Each entry records when it was added; regulatory positions record the date the authority stated them. Because the field moves quickly, Aegis favours dated, sourced positions over a claim of permanent currency — you can always see how recent a given data point is.",
    ],
  },
  {
    q: "How is a link in the graph created?",
    a: [
      "A system is linked to a fundamental right only where that connection is supported by a cited source — a court finding, a supervisory-authority decision, or documented analysis. The link carries its own provenance and an impact note explaining the basis.",
      "Aegis does not infer rights impacts algorithmically. A link exists because a source supports it, not because a model predicted it. This is a deliberate constraint: it keeps the graph defensible at the cost of breadth.",
      "Regulatory divergence is established the same way: two or more authorities are shown as diverging on a topic only when each position is backed by a dated, linked source. No consensus is invented, and no conflict is invented.",
    ],
  },
  {
    q: "How do you avoid false positives?",
    a: [
      "Three safeguards. First, classification is conservative — where the risk tier or the applicability of an exception is genuinely uncertain, it is marked undetermined rather than overstated.",
      "Second, nothing is published as a confident finding on the strength of a model's output. A system's classification reflects the cited legal basis and documented facts, not an automated guess.",
      "Third, the platform separates what it knows from what it infers. 'No known FRIA' means exactly that — no assessment is known to exist in the public record — not that none exists. The wording is chosen to avoid asserting more than the evidence supports.",
    ],
  },
];

export default function MethodologyPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 860, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/rights-graph" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Rights Graph</Link>
            <Link href="/roadmap" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Roadmap</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 860, margin: "0 auto", padding: "56px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>Methodology</p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          How Aegis decides what to show — and what it refuses to claim.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 720, marginBottom: 44 }}>
          An intelligence platform is only as good as the discipline behind it. These are the questions a serious reviewer should ask, answered plainly. Where Aegis is rigorous, it says so; where it is deliberately limited, it says that too.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          {QA.map((item, i) => (
            <section key={i} style={{ borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: 24 }}>
              <h2 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 14 }}>{item.q}</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {item.a.map((p, j) => (
                  <p key={j} style={{ fontSize: 14, lineHeight: 1.65, color: "rgba(255,255,255,0.72)" }}
                     dangerouslySetInnerHTML={{ __html: p.replace(/\*\*(.+?)\*\*/g, '<strong style="color:#fff;font-weight:600">$1</strong>') }} />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div style={{ marginTop: 44, padding: 24, border: "1px solid rgba(255,255,255,0.1)", borderRadius: 14, background: "rgba(255,255,255,0.02)" }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
            Aegis is an open, non-profit project. It provides regulatory and fundamental-rights intelligence; it is not legal advice. Every figure should be read with its stated sample size, and every entry with its provenance. If you find an error, or a system that belongs in the graph, that correction is itself a contribution — and it&apos;s welcome.
          </p>
          <Link href="/" style={{ display: "inline-block", marginTop: 14, fontSize: 13, fontWeight: 600, color: "#4f7cff", textDecoration: "none" }}>
            Request contributor access →
          </Link>
        </div>
      </main>
    </div>
  );
}
