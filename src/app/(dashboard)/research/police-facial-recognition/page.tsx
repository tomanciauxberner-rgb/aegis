import type { Metadata } from "next";
import Link from "next/link";

const BASE = process.env.NEXT_PUBLIC_APP_URL || "https://aegis-eu.com";
const PATH = "/research/police-facial-recognition";
const PDF_PATH = "/research/aegis-rp01-police-facial-recognition-v1.0.pdf";
const DOI = "";

const TITLE = "When the alarm comes from outside";
const SUBTITLE =
  "Detecting, verifying and correcting police facial-recognition misuse in Sweden, Belgium and France";
const AUTHOR = "Tom Anciaux Berner";
const ORCID = "0009-0006-1414-7400";
const PUBLISHED = "2026-10-27";
const DESCRIPTION =
  "AEGIS Research Paper 01. A source-based pilot on four police facial-recognition cases in Sweden, Belgium and France: how each became visible to the supervisor, whether its extent could be reconstructed, and whether corrections can be verified.";

const doiUrl = DOI ? `https://doi.org/${DOI}` : "";
const citation = `Anciaux Berner, T. (2026). When the Alarm Comes from Outside: Detecting, Verifying and Correcting Police Facial-Recognition Misuse in Sweden, Belgium and France. AEGIS Research Paper 01, Version 1.0, Expert Review Edition. ${
  DOI ? doiUrl : `${BASE}${PATH}`
}`;

const citationMeta: Record<string, string> = {
  citation_title: `${TITLE}: ${SUBTITLE}`,
  citation_author: AUTHOR,
  citation_publication_date: "2026/10/27",
  citation_technical_report_institution: "AEGIS",
  citation_technical_report_number: "AEGIS Research Paper 01",
  citation_language: "en",
  citation_pdf_url: `${BASE}${PDF_PATH}`,
};
if (DOI) citationMeta.citation_doi = DOI;

export const metadata: Metadata = {
  title: `${TITLE}: police facial recognition in Sweden, Belgium and France`,
  description: DESCRIPTION,
  alternates: { canonical: PATH },
  openGraph: {
    title: `${TITLE} · AEGIS Research Paper 01`,
    description: DESCRIPTION,
    url: PATH,
    type: "article",
  },
  other: citationMeta,
};

const reportJsonLd = {
  "@context": "https://schema.org",
  "@type": "Report",
  name: `${TITLE}: ${SUBTITLE}`,
  headline: TITLE,
  description: DESCRIPTION,
  datePublished: PUBLISHED,
  inLanguage: "en",
  reportNumber: "AEGIS Research Paper 01",
  version: "1.0",
  url: `${BASE}${PATH}`,
  author: {
    "@type": "Person",
    name: AUTHOR,
    identifier: `https://orcid.org/${ORCID}`,
    sameAs: `https://orcid.org/${ORCID}`,
  },
  publisher: { "@type": "Organization", name: "AEGIS", url: BASE },
  encoding: {
    "@type": "MediaObject",
    contentUrl: `${BASE}${PDF_PATH}`,
    encodingFormat: "application/pdf",
  },
  ...(DOI ? { sameAs: doiUrl } : {}),
};

const STAGES: [string, string][] = [
  ["S1 Visibility", "How and when did the supervisory authority learn that the deployment existed?"],
  ["S2 Establishment", "How was an irregularity identified and legally established?"],
  ["S3 Auditability", "Could the actual extent of processing be independently reconstructed?"],
  ["S4 Correction", "Is there verifiable evidence that corrective measures were implemented?"],
];

const FINDINGS: { title: string; text: string }[] = [
  {
    title: "In all four established cases, documented supervisory action followed a public report.",
    text: "In Sweden, Belgium (Clearview) and France, it was press coverage. At Brussels Airport, it was the operator’s own announcement in a press interview, about a system the supervisor did not know about. External disclosure can activate meaningful supervision. This does not establish that proactive supervision was absent or ineffective in other cases.",
  },
  {
    title: "The documented preventive procedures were activated for processing brought within their scope.",
    text: "Prior consultation and impact-assessment review are documented in Sweden and Belgium. The four established cases concern uses that did not pass through these procedures: two through a commercial service the police organisation had not provided, one on equipment acquired in 2017 and unknown to the supervisor, and one through a function added by a software update. This is an observation on four cases and a hypothesis for further research, not a European finding.",
  },
  {
    title: "Establishing unlawful processing does not establish its full extent.",
    text: "Different questions need different evidence: how many searches occurred, who conducted them, which images were uploaded, what results were obtained, and what happened to the data afterwards. The Belgian report shows this most clearly, because it separates information supplied by the vendor from facts the supervisor could verify.",
  },
  {
    title: "Corrective orders and verified correction are different outcomes.",
    text: "The pilot documents investigations, formal notices, orders and the interruption of a deployment. For none of the corrective measures does the assembled public record establish final implementation. This is a limitation of the evidence, not proof that the measures were ignored.",
  },
  {
    title: "Enforcement outcomes must be followed through the whole judicial process.",
    text: "The Swedish penalty, upheld at first instance, was annulled on appeal. Research on the effectiveness of supervision must track appeals and final outcomes, not stop at the original regulatory announcement.",
  },
];

const CASES: { name: string; visible: string; established: string; extent: string; correction: string }[] = [
  {
    name: "Sweden · Clearview AI",
    visible: "Supervisor acted after media reports, February 2020.",
    established: "Breaches found in February 2021. The SEK 2.5 million penalty was annulled on appeal in November 2022.",
    extent: "Extent rests on police replies. The supervisor could not determine what happened to the uploaded data.",
    correction: "Orders documented. Execution and status after appeal not established.",
  },
  {
    name: "Belgium · Clearview AI",
    visible: "Supervisor acted after press, March 2020. A first inquiry was closed on an answer later found incorrect.",
    established: "Unlawful use established in February 2022, after a second press report.",
    extent: "No logs in police databases. The 78-search figure came from the vendor and could not be verified.",
    correction: "Deletion request and proof ordered. Execution not established.",
  },
  {
    name: "Belgium · Brussels Airport",
    visible: "Supervisor learned of the system from the police commissioner-general’s press interview, July 2019. It states it was not aware of it.",
    established: "No legal basis for a biometric database.",
    extent: "No logs or alert figures reported.",
    correction: "Biometric processing halted, September 2019. Deletion of snapshots not established.",
  },
  {
    name: "France · BriefCam facial function",
    visible: "Controls followed the Disclose investigation, November 2023.",
    established: "One use outside the legal framework.",
    extent: "Logs expired after 365 days. The count rests on the services’ declarations.",
    correction: "Formal notices, November 2024. Execution not established.",
  },
];

const OPEN_ITEMS: string[] = [
  "Full judgment of the Administrative Court of Appeal in Stockholm, case 7678-21, 7 November 2022.",
  "Documents filed after 10 February 2021 in IMY case DI-2020-2719, the COC follow-up on DIO21006, and any CNIL closure of decision MED-2024-150.",
  "COC follow-up on DIO19005, including the fate of the stored snapshots.",
  "IGPN annual report 2023, p. 35, and the Senate record of 1 April 2026.",
  "Systematic completion of the register of institutional controls for all three countries.",
  "Independent review by a specialist in EU police data protection law and an audit-methods researcher.",
];

const SOURCES: { label: string; href: string }[] = [
  { label: "Datainspektionen (IMY), decision DI-2020-2719, 10 February 2021", href: "https://www.imy.se/link/5d5e59d4e64c4dcd909c0f7d42606960.aspx" },
  { label: "IMY, case history including the appeal judgments", href: "https://www.imy.se/tillsyner/polismyndigheten/" },
  { label: "Datainspektionen, prior consultation DI-2019-10508, 23 October 2019", href: "https://www.imy.se/globalassets/dokument/ovrigt/2019-10-23-polisen-forhandssamrad.pdf" },
  { label: "COC, supervisory report DIO21006 on Clearview AI, 4 February 2022", href: "https://www.controleorgaan.be/files/DIO21006_Toezichtrapport_Clearview_N_00050443.pdf" },
  { label: "COC, report DIO19005 on facial recognition at Brussels Airport, 16 September 2019", href: "https://www.controleorgaan.be/files/DIO19005_Onderzoek_LPABRUNAT_Gezichtsherkenning_Publiek_N.PDF" },
  { label: "COC, activity report 2022", href: "https://www.controleorgaan.be/files/Activiteitenverslag_COC_2022.pdf" },
  { label: "Belgian Chamber, DOC 55 2716/001, hearing of the COC, 23 May 2022", href: "https://www.lachambre.be/FLWB/PDF/55/2716/55K2716001.pdf" },
  { label: "IGA, IGPN and IGGN, inspection report on BriefCam, February 2024", href: "https://www.vie-publique.fr/files/rapport/pdf/296273_0.pdf" },
  { label: "CNIL, formal notices on BriefCam, 5 December 2024", href: "https://cnil.fr/fr/utilisation-briefcam-logiciels-analyse-video-par-etat-communes-la-cnil-prononce-plusieurs-mises-en-demeure" },
  { label: "IGPN, annual report 2024", href: "https://www.vie-publique.fr/files/rapport/pdf/300479.pdf" },
];

export default function PoliceFacialRecognitionResearchPage() {
  return (
    <div style={{ minHeight: "100vh", background: "#0d1b35", color: "#e8edf5" }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(reportJsonLd) }}
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
          AEGIS Research Paper 01 · Expert Review Edition
        </p>
        <h1 style={{ fontSize: 34, fontWeight: 800, color: "#fff", lineHeight: 1.15, marginBottom: 12 }}>{TITLE}</h1>
        <p style={{ fontSize: 18, lineHeight: 1.45, color: "rgba(255,255,255,0.7)", marginBottom: 18 }}>{SUBTITLE}</p>
        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", marginBottom: 24 }}>
          {AUTHOR} ·{" "}
          <a href={`https://orcid.org/${ORCID}`} target="_blank" rel="noopener noreferrer" style={aStyle}>
            ORCID {ORCID}
          </a>{" "}
          · Version 1.0 · 27 October 2026
          {DOI ? (
            <>
              {" "}·{" "}
              <a href={doiUrl} target="_blank" rel="noopener noreferrer" style={aStyle}>
                DOI {DOI}
              </a>
            </>
          ) : null}
        </p>

        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 32 }}>
          <a
            href={PDF_PATH}
            style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "#4f7cff", color: "#fff", borderRadius: 9, textDecoration: "none" }}
          >
            Read the full paper (PDF, 10 pages)
          </a>
          <a
            href="#cite"
            style={{ display: "inline-block", padding: "11px 22px", fontSize: 14, fontWeight: 600, background: "transparent", color: "#4f7cff", border: "1px solid rgba(79,124,255,0.4)", borderRadius: 9, textDecoration: "none" }}
          >
            How to cite
          </a>
        </div>

        <div style={{ border: "1px solid rgba(167,139,250,0.3)", borderRadius: 14, padding: 22, background: "linear-gradient(180deg, rgba(167,139,250,0.07), rgba(255,255,255,0.02))", marginBottom: 28 }}>
          <p style={{ fontSize: 16, lineHeight: 1.65, color: "rgba(255,255,255,0.9)", marginBottom: 12 }}>
            <strong>In all four documented cases, the supervisor acted after a public report.</strong> Once informed,
            supervisors investigated, established breaches, imposed corrective measures and, in Belgium, halted a
            deployment. What the public record cannot show is how far each use went, or whether the corrections were
            carried out.
          </p>
          <p style={{ fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.7)" }}>
            The paper does not claim that European biometric supervision is failing. It separates three propositions that
            are often merged: a safeguard exists, it operated, and its effectiveness can be demonstrated.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 40 }}>
          <Stat value="3" label="Member States: Sweden, Belgium, France" color="#fff" />
          <Stat value="4" label="Established cases, reconstructed from primary sources" color="#fff" />
          <Stat value="4 of 4" label="Supervisory actions that followed a public report" color="#e8b84b" />
          <Stat value="0 of 4" label="Corrections with publicly verified implementation, in the record assembled" color="#ff5c5c" />
        </div>

        <h2 style={h2Style}>The question</h2>
        <p style={pStyle}>
          When potentially unlawful biometric processing occurs, what makes it visible to oversight authorities, what
          evidence allows its extent to be independently reconstructed, and how can the implementation of corrective
          measures be demonstrated? Each case is examined in four stages.
        </p>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflow: "hidden", marginBottom: 40 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={thStyle}>Stage</th>
                <th style={thStyle}>Question</th>
              </tr>
            </thead>
            <tbody>
              {STAGES.map(([stage, q]) => (
                <tr key={stage} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={{ ...tdStyle, whiteSpace: "nowrap" }}><strong style={{ color: "#fff" }}>{stage}</strong></td>
                  <td style={{ ...tdStyle, color: "rgba(255,255,255,0.7)" }}>{q}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h2 style={h2Style}>The four cases</h2>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, overflowX: "auto", marginBottom: 12 }}>
          <table style={{ width: "100%", minWidth: 720, borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "rgba(255,255,255,0.04)" }}>
                <th style={thStyle}>Case</th>
                <th style={thStyle}>S1 Visibility</th>
                <th style={thStyle}>S2 Establishment</th>
                <th style={thStyle}>S3 Auditability</th>
                <th style={thStyle}>S4 Correction</th>
              </tr>
            </thead>
            <tbody>
              {CASES.map((c) => (
                <tr key={c.name} style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
                  <td style={tdStyle}><strong style={{ color: "#fff" }}>{c.name}</strong></td>
                  <td style={tdCell}>{c.visible}</td>
                  <td style={tdCell}>{c.established}</td>
                  <td style={tdCell}>{c.extent}</td>
                  <td style={tdCell}>{c.correction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p style={{ ...pStyle, fontSize: 12, color: "rgba(255,255,255,0.5)", marginBottom: 40 }}>
          A separate French allegation, facial matching against the TAJ police records file on NEO mobile devices, is kept
          as an unresolved research lead. No authority has yet established the specific biometric practice. Every entry is
          referenced to a page or paragraph of its primary source in the paper.
        </p>

        <h2 style={h2Style}>Five findings</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 40 }}>
          {FINDINGS.map((f, i) => (
            <div key={f.title} style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)" }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 8 }}>
                {i + 1}. {f.title}
              </h3>
              <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>{f.text}</p>
            </div>
          ))}
        </div>

        <h2 style={h2Style}>What this paper does not claim</h2>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)", marginBottom: 40 }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)", marginBottom: 10 }}>
            The cases were selected because enough public information existed to reconstruct them, which biases the corpus
            towards publicised controversies. The register of institutional controls is incomplete. The study has no access
            to compliance correspondence, vendor records, inspection annexes or internal police audit trails. Live
            identification, retrospective matching, verification and general video analytics are not interchangeable.
          </p>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.65)" }}>
            The pilot cannot estimate the prevalence of unlawful biometric processing or the detection rate of European
            supervisors. Insufficient public evidence implies neither compliance nor failure.
          </p>
        </div>

        <h2 style={h2Style}>Open items before a definitive edition</h2>
        <ol style={{ fontSize: 13, lineHeight: 1.7, color: "rgba(255,255,255,0.65)", paddingLeft: 20, marginBottom: 12 }}>
          {OPEN_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ol>
        <p style={{ ...pStyle, marginBottom: 40 }}>
          Critical observations, additional evidence and institutional perspectives are welcome, including those that
          contradict the findings. Corrections must cite a primary source.
        </p>

        <h2 id="cite" style={h2Style}>How to cite</h2>
        <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 18, background: "rgba(255,255,255,0.02)", marginBottom: 40 }}>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: "rgba(255,255,255,0.8)", fontFamily: "'JetBrains Mono', monospace", wordBreak: "break-word" }}>
            {citation}
          </p>
        </div>

        <h2 style={h2Style}>Main primary sources</h2>
        <ul style={{ fontSize: 13, lineHeight: 1.8, color: "rgba(255,255,255,0.65)", paddingLeft: 18, marginBottom: 12 }}>
          {SOURCES.map((s) => (
            <li key={s.href}>
              <a href={s.href} target="_blank" rel="noopener noreferrer" style={aStyle}>{s.label}</a>
            </li>
          ))}
        </ul>
        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6, marginBottom: 40 }}>
          The full reference list, with page and paragraph numbers, is in the paper. Evidence collected up to 27 October 2026.
        </p>

        <p style={{ fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6 }}>
          Related: <Link href="/iso-42001-vs-eu-ai-act" style={aStyle}>ISO 42001 vs the EU AI Act</Link> ·{" "}
          <Link href="/rights-graph" style={aStyle}>the EU high-risk systems map</Link> ·{" "}
          <Link href="/methodology" style={aStyle}>AEGIS methodology</Link>
        </p>
      </main>
    </div>
  );
}

const h2Style: React.CSSProperties = { fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 };
const pStyle: React.CSSProperties = { fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.65)", maxWidth: 760, marginBottom: 16 };
const thStyle: React.CSSProperties = { textAlign: "left", padding: "12px 14px", fontSize: 11, fontWeight: 700, letterSpacing: 0.5, textTransform: "uppercase", color: "rgba(255,255,255,0.5)" };
const tdStyle: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top" };
const tdCell: React.CSSProperties = { padding: "12px 14px", verticalAlign: "top", color: "rgba(255,255,255,0.65)", lineHeight: 1.55 };
const aStyle: React.CSSProperties = { color: "#4f7cff", textDecoration: "none" };

function Stat({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ border: "1px solid rgba(255,255,255,0.08)", borderRadius: 12, padding: 16, background: "rgba(255,255,255,0.02)" }}>
      <div style={{ fontSize: 30, fontWeight: 800, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.55)", marginTop: 6, lineHeight: 1.3 }}>{label}</div>
    </div>
  );
}
