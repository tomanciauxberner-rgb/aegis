import Link from "next/link";

export const metadata = { title: "Roadmap — Aegis", robots: { index: true, follow: true } };

const VERTICALS = [
  {
    code: "children", status: "live", title: "Children's Digital Rights",
    why: "The most rights-sensitive domain where children meet AI — education, app stores, content platforms.",
    what: "Digital Rights Index across the EU-27, cross-border DPA enforcement intelligence, compliance-gap engine (app ages vs GDPR Art. 8), EdTech Risk Atlas with one-click FRIA, Forward Signal on policy windows, DSA Article 28 minors-protection tracker.",
  },
  {
    code: "omnibus", status: "live", title: "AI Act × Digital Omnibus",
    why: "The deadline that decides everything: are providers and deployers preparing for August 2026 or December 2027? CEN/CENELEC standards remain unfinished and harmonised tools are scarce — so the real need is not another news tracker, but a way to model how the framework could play out for a specific system.",
    what: "A live Regulatory Scenario Engine: describe a system and Aegis projects the plausible regulatory futures (Omnibus adopted, not adopted in time, strict national reading, pro-innovation path), your personalised deadline, your exposure under each, a sourced map of where experts diverge, and the actions that are robust whichever timeline lands. Every output is cited; none is legal advice.",
  },
  {
    code: "employment", status: "next", title: "Employment & HR AI",
    why: "Annex III(4): recruitment, evaluation, workforce management. The largest deployer volume of the AI Act, and an area where deployer evidence gaps (Article 26) are widest.",
    what: "Sector-specific FRIA templates, intelligence on employment-related enforcement, classification helper for borderline systems, and deployer-evidence checklists aligned with Article 26.",
  },
  {
    code: "essential", status: "next", title: "Essential Services AI",
    why: "Annex III(5): credit scoring, insurance pricing, access to public services and emergency response. High consumer impact, high enforcement risk.",
    what: "Mapping of national supervisory positions per sector, sourced enforcement decisions, and a FRIA workflow adapted to financial and welfare contexts.",
  },
  {
    code: "public", status: "scoping", title: "Public-sector AI",
    why: "AI in justice, law enforcement and migration — the most rights-sensitive uses of all, and the ones where independent intelligence is most needed.",
    what: "Scope is being defined with practitioners and civil-society contributors. If you work in this space, your input shapes what we build.",
  },
];

const STATUS_LABEL: Record<string, string> = { live: "Live", building: "Building", next: "Next up", scoping: "Scoping with the community" };
const STATUS_COLOR: Record<string, string> = { live: "#34d399", building: "#4f7cff", next: "#e8b84b", scoping: "rgba(255,255,255,0.5)" };

export default function RoadmapPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <header style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "18px 24px" }}>
        <div style={{ maxWidth: 920, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link href="/" style={{ fontWeight: 700, letterSpacing: 1, color: "#fff", textDecoration: "none" }}>AEGIS</Link>
          <nav style={{ display: "flex", gap: 18, fontSize: 13 }}>
            <Link href="/" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Home</Link>
            <Link href="/legal/notice" style={{ color: "rgba(255,255,255,0.6)", textDecoration: "none" }}>Legal notice</Link>
          </nav>
        </div>
      </header>

      <main style={{ maxWidth: 920, margin: "0 auto", padding: "56px 24px 96px" }}>
        <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "rgba(255,255,255,0.45)", marginBottom: 14 }}>Roadmap</p>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 16 }}>
          One platform, every high-risk domain the EU AI Act regulates.
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.6, color: "rgba(255,255,255,0.7)", maxWidth: 720, marginBottom: 40 }}>
          Aegis was born to answer one question — <em>where do AI deployments meet fundamental rights, and how do you assess that before harm is done?</em> Children&apos;s digital rights is the first vertical built in depth. The same intelligence layer, the same FRIA engine and the same contributive model apply across every other high-risk domain. Here is where we&apos;re going, and where the community shapes priority.
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {VERTICALS.map((v) => (
            <section key={v.code} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: 22, background: "rgba(255,255,255,0.02)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", padding: "4px 10px", borderRadius: 6, background: `${STATUS_COLOR[v.status]}22`, color: STATUS_COLOR[v.status] }}>{STATUS_LABEL[v.status]}</span>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#fff" }}>{v.title}</h2>
              </div>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)", marginBottom: 10 }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>Why it matters · </strong>{v.why}</p>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.55)" }}><strong style={{ color: "rgba(255,255,255,0.8)" }}>What it includes · </strong>{v.what}</p>
              {v.code === "omnibus" && (
                <p style={{ marginTop: 12 }}>
                  <Link href="/ai-act-scenarios" style={{ fontSize: 13, fontWeight: 600, color: "#4f7cff", textDecoration: "none" }}>Try the live engine →</Link>
                </p>
              )}
            </section>
          ))}
        </div>

        <div style={{ marginTop: 48, padding: 26, border: "1px solid rgba(79,124,255,0.25)", borderRadius: 14, background: "linear-gradient(180deg, rgba(79,124,255,0.05), rgba(255,255,255,0.02))" }}>
          <p style={{ fontSize: 12, fontWeight: 700, letterSpacing: 1.5, textTransform: "uppercase", color: "#4f7cff", marginBottom: 8 }}>Shape what comes next</p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
            Priority isn&apos;t set by us alone. If you work in any of these domains and want to weigh in — what to build first, what we&apos;re missing, where the real risks are — request contributor access from the home page. Your input directly shapes the order.
          </p>
        </div>
      </main>
    </div>
  );
}
