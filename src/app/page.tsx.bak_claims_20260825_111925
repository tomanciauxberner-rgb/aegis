import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { RequestAccessForm } from "@/components/landing/request-access-form";
import { GraphStatsBand } from "@/components/landing/graph-stats-band";
import { getRightsGraphStats } from "@/lib/rights-graph-stats";

const DOMAINS = [
  { label: "Employment & HR", icon: "💼" },
  { label: "Gender-Based Violence", icon: "⚖️" },
  { label: "Disability Rights", icon: "♿" },
  { label: "Education", icon: "🎓" },
  { label: "Housing", icon: "🏠" },
  { label: "Healthcare", icon: "🏥" },
  { label: "Law Enforcement", icon: "🔒" },
  { label: "Essential Services", icon: "🏛️" },
];

const ROADMAP = [
  "FRIA methodology validation",
  "Dataset coverage expansion",
  "Civic space indicators",
  "Children's digital rights",
  "Publication-ready visualisations",
];

const WHO = [
  { icon: "🏛️", title: "Regulators & oversight bodies", desc: "See enforcement patterns, policy windows and where frameworks are converging across the EU." },
  { icon: "🔬", title: "Researchers & academics", desc: "Sourced, citable data on children's digital rights — every figure links back to its primary source." },
  { icon: "🏫", title: "EdTech & public-sector deployers", desc: "Identify your AI Act obligations and produce a structured first draft of a Fundamental Rights Impact Assessment — a starting point for expert review, not a finished filing." },
  { icon: "🛡️", title: "Child-rights advocates", desc: "Track how AI and platforms affect minors, and where the gaps in protection actually are." },
];

const USE_CASES = [
  {
    color: "#ff5c5c",
    tag: "Divergence Engine",
    icon: "⚡",
    title: "Find where regulators contradict each other",
    steps: [
      "Pick a regulatory question — e.g. lawful basis for AI-assisted credit scoring",
      "Aegis surfaces every on-record position: Commission, EDPB, EDPS, national authorities",
      "Each position linked to its source document, divergences flagged explicitly",
    ],
    outcome: "The regulatory contradictions that didn't exist in one place before — sourced and comparable.",
    link: "/rights-graph/divergence",
  },
  {
    color: "#a78bfa",
    tag: "Compliance Bridge",
    icon: "🌉",
    title: "See what your ISO 42001 certification doesn't cover",
    steps: [
      "Start from ISO/IEC 42001 — the AI management-system standard you may already hold",
      "Aegis maps each clause to the EU AI Act articles it supports, scored High / Partial / Gap",
      "Surfaces the obligations with no ISO 42001 equivalent — conformity assessment, CE marking, EU database, post-market monitoring, incident reporting",
    ],
    outcome: "The honest answer certified organisations need: ISO 42001 ≠ AI Act compliance, and exactly where the gap is — every mapping sourced.",
    link: "/compliance-bridge",
  },
  {
    color: "#34d399",
    tag: "FRIA Gap",
    icon: "📊",
    title: "Measure how many high-risk systems have no FRIA",
    steps: [
      "Browse high-risk AI systems in the graph by sector or Member State",
      "Aegis shows which have a publicly identifiable FRIA — and which don't",
      "Sample size always visible; export the gap data for research or enforcement monitoring",
    ],
    outcome: "A number that doesn't exist anywhere else: the public FRIA coverage rate by sector.",
    link: "/rights-graph/fria-gap",
  },
  {
    color: "#4f7cff",
    tag: "Rights Graph",
    icon: "🗺️",
    title: "Map a real AI system's rights footprint",
    steps: [
      "Enter a deployed EU system — e.g. a border screening tool or HR scoring platform",
      "Aegis surfaces the fundamental rights it touches, documented incidents, and known FRIA status",
      "Cross-references regulatory positions and binding case law by sector — every node sourced",
    ],
    outcome: "A sourced picture of a system's rights exposure in minutes, not weeks of desk research.",
    link: "/rights-graph",
  },
  {
    color: "#e8b84b",
    tag: "Scenario Engine",
    icon: "🧠",
    title: "Classify your AI system under the AI Act",
    steps: [
      "Describe your system — purpose, inputs, outputs, deployment context",
      "Aegis reasons over Annex III, Art. 6(3) and Omnibus deadlines, citing every article it relies on",
      "Marks what it cannot determine as unverified — not a guess, a traceable reasoning chain",
    ],
    outcome: "A cited classification with article references — not a chatbot over a PDF.",
    link: "/ai-act-scenarios",
  },
  {
    color: "#a06bff",
    tag: "Precedent System",
    icon: "⚖️",
    title: "Pull binding case law for your deployment sector",
    steps: [
      "Select a sector — recruitment, healthcare, law enforcement, education, essential services",
      "Aegis returns every relevant ruling: CJEU, ECHR, DPA decisions and national courts",
      "Each case shows the holding and binding force — persuasive or mandatory — matched to your context",
    ],
    outcome: "The jurisprudence your FRIA needs, matched by sector, every ruling sourced.",
    link: "/rights-graph/precedents",
  },
  {
    color: "#4f7cff",
    tag: "Children's Rights Index",
    icon: "🛡️",
    title: "Benchmark children's digital rights across EU-27",
    steps: [
      "Open the composite index — all 27 Member States scored on enforcement, EdTech risk and framework maturity",
      "Drill into any country: DSA Art. 28 enforcement actions, declared age-of-consent gaps, risk atlas",
      "One-click path to a structured FRIA first draft for any flagged EdTech system",
    ],
    outcome: "The only composite EU-27 ranking of children's digital rights — built from primary sources.",
    link: "/children",
  },
  {
    color: "#5cc8e8",
    tag: "Code Radar",
    icon: "📡",
    title: "Track who actually publishes public-sector code",
    steps: [
      "Open the EU27 radar — national open-source catalogues polled on a schedule",
      "Aegis snapshots each catalogue's own aggregates: repositories, organisations, forges",
      "Sources only light up once their endpoint is verified — declared coverage stays visibly pending",
    ],
    outcome: "The follow-through on 'public money, public code' — measured, sourced, over time.",
    link: "/code-radar",
  },
];

const MODULES = [
  { color: "#4f7cff", name: "Rights Index", what: "A composite 0–100 score ranking all EU-27 countries on how well children's digital rights are protected — built live from the modules below." },
  { color: "#ff5c5c", name: "DSA Minors", what: "Commission enforcement of DSA Article 28: investigations into platforms, the protection-of-minors guidelines, and the EU age-verification push." },
  { color: "#4f7cff", name: "Enforcement Intelligence", what: "Cross-border patterns in data-protection enforcement against systems affecting minors, linked to the case law that shapes them." },
  { color: "#e8b84b", name: "Compliance Gaps", what: "Where an app's declared minimum age clashes with the legal age of consent of each country — systemic violations, quantified." },
  { color: "#e8b84b", name: "Risk Atlas", what: "National EdTech systems scored for fundamental-rights risk, each with a one-click path to a structured FRIA first draft." },
  { color: "#34d399", name: "Forward Signal", what: "Upcoming consultations, bills and policy moves ranked by deadline — so you act before the window closes." },
];

const VERTICALS = [
  { code: "graph",     label: "Unified Rights Graph",         status: "live",     desc: "A verified registry of high-risk AI systems — small by design, every entry reviewed and sourced. Maps the rights each system touches, whether a FRIA is known, and where regulators diverge on the same question." },
  { code: "children",  label: "Children's Digital Rights",   status: "live",     desc: "Flagship vertical — index, enforcement, gaps, EdTech atlas, DSA Art. 28." },
  { code: "omnibus",   label: "AI Act × Digital Omnibus",    status: "live",     desc: "Live Regulatory Scenario Engine: reasons over a structured, sourced AI Act knowledge base to classify your specific system — citing the articles it relies on and marking what it cannot determine, rather than guessing." },
  { code: "employment",label: "Employment & HR AI",          status: "next",     desc: "Annex III(4): recruitment, evaluation, workforce-management systems. Where the largest deployer volume sits." },
  { code: "essential", label: "Essential Services AI",       status: "next",     desc: "Annex III(5): credit scoring, insurance, access to public services and emergency response." },
  { code: "public",    label: "Public-sector AI",            status: "scoping",  desc: "AI in justice, law enforcement and migration — the most rights-sensitive uses of all." },
];

export const revalidate = 300;

export default async function HomePage() {
  const stats = await getRightsGraphStats();
  const gap = stats && stats.highRisk > 0 ? stats : null;

  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }

        .open-banner {
          width: 100%;
          background: rgba(7, 21, 37, 0.95);
          border-bottom: 1px solid #1e3a5f;
          padding: 14px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 10px;
          position: relative;
          z-index: 10;
        }
        .open-banner-top {
          display: flex;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .open-badge {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.2em;
          font-weight: 700;
          text-transform: uppercase;
          padding: 4px 10px;
          border-radius: 20px;
          background: rgba(79,124,255,0.08);
          border: 1px solid rgba(79,124,255,0.25);
          color: #4f7cff;
          white-space: nowrap;
        }
        .open-mission {
          font-size: 12px;
          color: #7aaac8;
          line-height: 1.5;
          text-align: center;
          max-width: 620px;
        }
        .open-mission strong {
          color: #a8c4d8;
          font-weight: 500;
        }
        .open-roadmap {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }
        .roadmap-label {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          letter-spacing: 0.15em;
          color: #2a5080;
          text-transform: uppercase;
          white-space: nowrap;
        }
        .roadmap-chip {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          padding: 3px 10px;
          border-radius: 20px;
          background: rgba(0,200,130,0.06);
          border: 1px solid rgba(0,200,130,0.18);
          color: #00c882;
          white-space: nowrap;
        }
        .open-links {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .open-link {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.12em;
          text-decoration: none;
          padding: 5px 14px;
          border-radius: 6px;
          transition: background 0.2s;
        }
        .open-link-gh {
          background: rgba(255,255,255,0.05);
          border: 1px solid #1e3a5f;
          color: #7aaac8;
        }
        .open-link-gh:hover { background: rgba(255,255,255,0.09); }
        .open-link-contribute {
          background: rgba(0,200,130,0.08);
          border: 1px solid rgba(0,200,130,0.25);
          color: #00c882;
        }
        .open-link-contribute:hover { background: rgba(0,200,130,0.14); }
        .open-link-roadmap {
          background: rgba(79,124,255,0.08);
          border: 1px solid rgba(79,124,255,0.25);
          color: #4f7cff;
        }
        .open-link-roadmap:hover { background: rgba(79,124,255,0.14); }

        .landing {
          min-height: 100vh;
          background: #0d1b35;
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 80px 24px 60px;
          position: relative;
          overflow: hidden;
        }
        .grid-bg {
          position: absolute;
          inset: 0;
          opacity: 0.025;
          background-image: radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0);
          background-size: 44px 44px;
          pointer-events: none;
        }
        .glow {
          position: absolute;
          top: -300px;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 800px;
          background: radial-gradient(circle, rgba(79,124,255,0.06) 0%, transparent 70%);
          pointer-events: none;
        }
        .glow2 {
          position: absolute;
          bottom: -400px;
          left: 30%;
          width: 600px;
          height: 600px;
          background: radial-gradient(circle, rgba(255,92,92,0.03) 0%, transparent 70%);
          pointer-events: none;
        }
        .content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 1060px;
        }
        .tagline {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          letter-spacing: 0.25em;
          color: #4a7fa5;
          text-transform: uppercase;
          margin-top: 12px;
          margin-bottom: 40px;
        }
        .headline {
          font-size: 42px;
          font-weight: 700;
          color: #e8eaf0;
          line-height: 1.25;
          margin-bottom: 20px;
          letter-spacing: -0.02em;
        }
        .headline em {
          font-style: normal;
          background: linear-gradient(135deg, #4f7cff, #00c882);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .sub {
          font-size: 17px;
          color: #7aaac8;
          line-height: 1.8;
          max-width: 640px;
          margin-bottom: 48px;
        }
        .stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 48px;
          margin-bottom: 56px;
          flex-wrap: wrap;
        }
        .stat-item { text-align: center; }
        .stat-value {
          font-family: var(--font-mono), monospace;
          font-size: 32px;
          font-weight: 700;
          color: #e8eaf0;
          line-height: 1;
        }
        .stat-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #4a7fa5;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          margin-top: 6px;
        }
        .cta-high {
          margin: 4px 0 44px;
        }
        .block-section {
          width: 100%;
          margin: 0 0 44px;
        }
        .block-label {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 1.5px;
          text-transform: uppercase;
          color: rgba(255,255,255,0.45);
          margin-bottom: 18px;
          text-align: left;
        }
        .block-intro {
          font-size: 14px;
          line-height: 1.6;
          color: rgba(255,255,255,0.6);
          text-align: left;
          margin: -8px 0 20px;
          max-width: 760px;
        }
        .block-intro strong { color: rgba(255,255,255,0.9); font-weight: 600; }
        .who-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }
        .who-card {
          padding: 18px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          background: rgba(255,255,255,0.02);
          text-align: left;
        }
        .who-icon { font-size: 22px; display: block; margin-bottom: 10px; }
        .who-title { font-size: 14px; font-weight: 600; color: #fff; margin: 0 0 6px; }
        .who-desc { font-size: 12px; line-height: 1.5; color: rgba(255,255,255,0.55); margin: 0; }

        .usecases-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          width: 100%;
        }
        .usecase-card {
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
          text-align: left;
          display: flex;
          flex-direction: column;
          gap: 14px;
          transition: border-color 0.2s, background 0.2s;
          text-decoration: none;
        }
        .usecase-card:hover {
          background: rgba(255,255,255,0.04);
        }
        .usecase-head {
          display: flex;
          align-items: flex-start;
          gap: 12px;
        }
        .usecase-icon {
          font-size: 20px;
          flex-shrink: 0;
          line-height: 1;
          margin-top: 3px;
        }
        .usecase-meta {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        .usecase-tag {
          font-family: var(--font-mono), monospace;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 4px;
          display: inline-block;
          align-self: flex-start;
        }
        .usecase-title {
          font-size: 14px;
          font-weight: 700;
          color: #e8eaf0;
          line-height: 1.35;
          margin: 0;
        }
        .usecase-outcome {
          font-size: 12px;
          font-style: italic;
          line-height: 1.5;
          padding-top: 10px;
          border-top: 1px solid rgba(255,255,255,0.06);
        }

        .modules-list {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          overflow: hidden;
        }
        .module-row {
          display: grid;
          grid-template-columns: 12px 160px 1fr;
          align-items: start;
          gap: 14px;
          padding: 16px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          text-align: left;
        }
        .module-row:last-child { border-bottom: none; }
        .module-dot { width: 8px; height: 8px; border-radius: 50%; margin-top: 6px; }
        .module-name { font-size: 13px; font-weight: 600; color: #fff; }
        .module-what { font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }
        .vert-list {
          display: flex;
          flex-direction: column;
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          overflow: hidden;
        }
        .vert-row {
          display: grid;
          grid-template-columns: 96px 200px 1fr;
          align-items: center;
          gap: 14px;
          padding: 14px 18px;
          border-bottom: 1px solid rgba(255,255,255,0.05);
          text-align: left;
        }
        .vert-row:last-child { border-bottom: none; }
        .vert-status {
          font-size: 10px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
          padding: 4px 8px; border-radius: 5px; text-align: center;
        }
        .vert-status-live      { background: rgba(52,211,153,0.18); color: #34d399; }
        .vert-status-building  { background: rgba(79,124,255,0.18); color: #4f7cff; }
        .vert-status-next      { background: rgba(232,184,75,0.18); color: #e8b84b; }
        .vert-status-scoping   { background: rgba(255,255,255,0.06); color: rgba(255,255,255,0.5); }
        .vert-name { font-size: 13px; font-weight: 600; color: #fff; }
        .vert-desc { font-size: 13px; line-height: 1.55; color: rgba(255,255,255,0.6); }
        .vert-cta {
          font-size: 13px; color: rgba(255,255,255,0.55);
          margin-top: 14px; text-align: left;
        }
        .vert-link { color: #4f7cff; text-decoration: none; }
        .vert-link:hover { text-decoration: underline; }
        .update-card-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 8px;
        }
        .update-date {
          font-size: 10px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .updates {
          width: 100%;
          margin: 8px 0 40px;
          padding: 24px;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 14px;
          background: rgba(255,255,255,0.02);
        }
        .updates-head {
          display: flex;
          align-items: baseline;
          justify-content: space-between;
          margin-bottom: 18px;
        }
        .updates-badge {
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
          color: #34d399;
          text-transform: uppercase;
        }
        .updates-sub {
          font-size: 11px;
          color: rgba(255,255,255,0.4);
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        .updates-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
        }
        .update-card {
          padding: 14px;
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 10px;
          background: rgba(255,255,255,0.02);
          text-align: left;
        }
        .update-tag {
          display: inline-block;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          padding: 2px 8px;
          border-radius: 5px;
        }
        .update-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          margin: 0 0 4px;
        }
        .update-desc {
          font-size: 12px;
          line-height: 1.5;
          color: rgba(255,255,255,0.55);
          margin: 0;
        }
        .pillars {
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr;
          background: rgba(30,58,95,0.3);
          border: 1px solid #1e3a5f;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 64px;
        }
        .pillar { padding: 32px 28px; text-align: left; }
        .pillar-divider { background: #1e3a5f; }
        .pillar-tag {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.2em;
          font-weight: 700;
          text-transform: uppercase;
          margin-bottom: 14px;
          display: inline-block;
          padding: 4px 10px;
          border-radius: 6px;
        }
        .pillar-title {
          font-size: 17px;
          font-weight: 700;
          color: #e8eaf0;
          margin-bottom: 14px;
          line-height: 1.3;
        }
        .pillar-items {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .pillar-item {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          font-size: 13px;
          color: #7aaac8;
          line-height: 1.5;
        }
        .pillar-item::before {
          content: "→";
          color: #2a5080;
          flex-shrink: 0;
          margin-top: 1px;
        }
        .section-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.25em;
          color: #4a7fa5;
          text-transform: uppercase;
          margin-bottom: 20px;
        }
        .domains-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          width: 100%;
          margin-bottom: 20px;
        }
        .domain-card {
          background: rgba(30,58,95,0.25);
          border: 1px solid #1e3a5f;
          border-radius: 10px;
          padding: 16px 14px;
          text-align: center;
          transition: border-color 0.2s, transform 0.15s;
        }
        .domain-card:hover { border-color: #4f7cff; transform: translateY(-2px); }
        .domain-icon { font-size: 20px; margin-bottom: 8px; }
        .domain-label { font-size: 12px; font-weight: 600; color: #8ba8c8; line-height: 1.3; }
        .pop-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
          margin-bottom: 64px;
        }
        .pop-tag {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          padding: 6px 14px;
          border-radius: 20px;
          background: rgba(79,124,255,0.06);
          border: 1px solid rgba(79,124,255,0.2);
          color: #7aaac8;
          letter-spacing: 0.04em;
        }
        .demo-block {
          width: 100%;
          background: rgba(15,32,64,0.8);
          border: 1px solid #1e3a5f;
          border-radius: 16px;
          padding: 36px 32px;
          margin-bottom: 64px;
          text-align: left;
        }
        .demo-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 24px;
        }
        .demo-title { font-size: 15px; font-weight: 700; color: #e8eaf0; }
        .demo-sub { font-size: 12px; color: #4a7fa5; font-family: var(--font-mono), monospace; }
        .demo-example {
          background: #0d1b35;
          border: 1px solid #1e3a5f;
          border-radius: 10px;
          padding: 20px 24px;
        }
        .demo-country {
          font-family: var(--font-mono), monospace;
          font-size: 13px;
          font-weight: 700;
          color: #e8eaf0;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .demo-signal {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(30,58,95,0.5);
          font-size: 13px;
          color: #7aaac8;
        }
        .demo-signal:last-child { border-bottom: none; }
        .demo-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
        .demo-delta {
          font-family: var(--font-mono), monospace;
          font-weight: 700;
          font-size: 12px;
          margin-left: auto;
          flex-shrink: 0;
        }
        .demo-rec {
          margin-top: 16px;
          padding: 14px 18px;
          background: rgba(232,184,75,0.06);
          border: 1px solid rgba(232,184,75,0.2);
          border-radius: 8px;
          font-size: 12px;
          color: #e8b84b;
          line-height: 1.6;
          font-family: var(--font-mono), monospace;
        }
        .cta {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 18px 48px;
          background: #4f7cff;
          border-radius: 10px;
          color: #ffffff;
          font-family: var(--font-mono), monospace;
          font-size: 14px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-decoration: none;
          transition: background 0.2s, transform 0.15s;
          margin-bottom: 32px;
        }
        .cta:hover { background: #3a6aee; transform: translateY(-2px); }
        .cta:focus-visible, .open-link:focus-visible, .usecase-card:focus-visible {
          outline: 2px solid #7aaac8;
          outline-offset: 3px;
        }
        .cta-ghost {
          background: transparent;
          border: 1px solid #2a5080;
          color: #aaccdd;
        }
        .cta-ghost:hover {
          background: rgba(79,124,255,0.10);
          border-color: #4f7cff;
          color: #e8eaf0;
          transform: translateY(-2px);
        }
        .footer-text {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #1e3a5f;
          letter-spacing: 0.1em;
          text-align: center;
        }
        .footer-legal {
          margin-top: 10px;
          text-align: center;
          font-size: 12px;
        }
        .footer-legal a {
          color: rgba(255,255,255,0.45);
          text-decoration: none;
        }
        .footer-legal a:hover { color: rgba(255,255,255,0.8); }
        .footer-legal span { color: rgba(255,255,255,0.25); }
        @media (max-width: 700px) {
          .open-banner { padding: 12px 16px; gap: 8px; }
          .open-mission { font-size: 11px; }
          .landing { padding: 48px 16px 40px; }
          .pillars { grid-template-columns: 1fr; }
          .updates-grid { grid-template-columns: 1fr; }
          .who-grid { grid-template-columns: 1fr; }
          .usecases-grid { grid-template-columns: 1fr; }
          .module-row { grid-template-columns: 12px 1fr; }
          .module-row .module-what { grid-column: 2; }
          .vert-row { grid-template-columns: 96px 1fr; }
          .vert-row .vert-desc { grid-column: 2; }
          .pillar-divider { display: none; }
          .pillar { padding: 24px 18px; }
          .headline { font-size: 26px; }
          .sub { font-size: 15px; }
          .domains-grid { grid-template-columns: repeat(2, 1fr); }
          .stats-row { gap: 20px; }
          .stat-value { font-size: 22px; }
          .demo-block { padding: 20px 16px; }
          .demo-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .demo-example { padding: 14px 14px; }
          .demo-signal { font-size: 11px; gap: 8px; }
          .cta { padding: 14px 28px; font-size: 12px; width: 100%; justify-content: center; }
        }
      `}</style>

      {/* ── OPEN SOURCE BANNER ── */}
      <div className="open-banner">
        <div className="open-banner-top">
          <span className="open-badge">Open Source · AGPL v3 · Community Project</span>
          <p className="open-mission">
            <strong>Open infrastructure for EU fundamental rights intelligence</strong> — built with researchers, policy experts and civic technologists, not for profit.
          </p>
        </div>
        <div className="open-roadmap">
          <span className="roadmap-label">Building together →</span>
          {ROADMAP.map((item) => (
            <span key={item} className="roadmap-chip">{item}</span>
          ))}
        </div>
        <div className="open-links">
          <a href="https://github.com/tomanciauxberner-rgb/aegis" target="_blank" rel="noopener noreferrer" className="open-link open-link-gh">
            ★ Star on GitHub
          </a>
          <a href="https://github.com/tomanciauxberner-rgb/aegis/issues" target="_blank" rel="noopener noreferrer" className="open-link open-link-contribute">
            Contribute
          </a>
          <Link href="/roadmap" className="open-link open-link-roadmap">
            Roadmap
          </Link>
        </div>
      </div>

      <style>{`
        .fria-headline {
          font-size: 20px; line-height: 1.5; color: rgba(255,255,255,0.9);
          max-width: 720px; margin: 0 auto 44px; text-align: center;
        }
        .fria-headline strong { color: #ff7676; font-weight: 700; }
        @media (max-width: 720px) { .fria-headline { font-size: 16px; margin-bottom: 32px; } }
      `}</style>

      <main className="landing">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="glow2" />

        <div className="content">
          <Image src="/logo.png" alt="Aegis" width={180} height={210} priority />

          <p className="tagline">Rights Infrastructure for European AI Governance · EU27</p>

          <h1 className="headline">
            Europe&apos;s AI regulators contradict each other.<br /><em>See exactly where — in minutes.</em>
          </h1>

          <p className="sub">
            Commission, EDPB, EDPS and national authorities take conflicting positions on the same AI
            questions — and finding those contradictions takes weeks of legal research. AEGIS puts every
            on-record position in one place, sourced and comparable, free. Behind it sits the same open,
            non-profit layer that maps real high-risk AI systems, the case law that shapes them, and
            whether a FRIA is publicly known.
          </p>

          <div className="stats-row">
            {[
              { value: "27", label: "EU Member States" },
              { value: "Layer", label: "systems × rights × authorities × case law" },
              { value: "Sourced", label: "every node, primary sources" },
              { value: "Open", label: "Non-profit · AGPL" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── PRIMARY CTA (high) ── */}
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center", marginBottom: 12 }}>
            <Link href="/overview" className="cta cta-high" style={{ marginBottom: 0 }}>
              ENTER AEGIS <ArrowRight style={{ width: 18, height: 18 }} />
            </Link>
            <Link href="/rights-graph/divergence" className="cta cta-high cta-ghost" style={{ marginBottom: 0 }}>
              SEE WHERE REGULATORS DIVERGE
            </Link>
          </div>
          <p style={{ fontSize: 13, color: "#aaccdd", marginBottom: 36 }}>
            Every page is open to read — no account, no sign-up.{" "}
            <Link href="/login" style={{ color: "#7aaac8", textDecoration: "none" }}>Contributor sign-in →</Link>
          </p>

          {gap && (
            <p className="fria-headline">
              {gap.friaGap === gap.highRisk
                ? <>Of the {gap.highRisk} high-risk AI systems mapped so far, <strong>none has a publicly identifiable Fundamental Rights Impact Assessment.</strong></>
                : <><strong>{gap.friaGap} of {gap.highRisk}</strong> high-risk AI systems mapped so far have <strong>no publicly identifiable Fundamental Rights Impact Assessment.</strong></>}
            </p>
          )}

          {/* ── WHO IT'S FOR ── */}
          <div className="block-section">
            <p className="block-label">Who it&apos;s for</p>
            <div className="who-grid">
              {WHO.map((w) => (
                <div key={w.title} className="who-card">
                  <span className="who-icon">{w.icon}</span>
                  <p className="who-title">{w.title}</p>
                  <p className="who-desc">{w.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── USE CASES ── */}
          <div className="block-section">
            <p className="block-label">What you can do with Aegis</p>
            <div className="usecases-grid">
              {USE_CASES.map((uc) => (
                <Link key={uc.title} href={uc.link} className="usecase-card" style={{ borderColor: `${uc.color}22` }}>
                  <div className="usecase-head">
                    <span className="usecase-icon">{uc.icon}</span>
                    <div className="usecase-meta">
                      <span
                        className="usecase-tag"
                        style={{ color: uc.color, background: `${uc.color}14`, border: `1px solid ${uc.color}33` }}
                      >
                        {uc.tag}
                      </span>
                      <p className="usecase-title">{uc.title}</p>
                    </div>
                  </div>
                  <p className="usecase-outcome" style={{ color: uc.color }}>
                    → {uc.outcome}
                  </p>
                </Link>
              ))}
            </div>
          </div>

          {/* ── WHERE AEGIS IS GOING ── */}
          <div className="block-section">
            <p className="block-label">Where Aegis is going</p>
            <p className="block-intro">
              Aegis is governance infrastructure, not a product — and its foundation is the Unified Rights Graph: real AI systems, the rights they touch, and where regulators diverge, every node sourced. On that foundation run the AI Act reasoning engine and a children&apos;s-rights vertical covered in depth. The same layer extends across every high-risk domain the EU AI Act regulates. <strong>The community helps prioritise what comes next.</strong>
            </p>
            <GraphStatsBand stats={stats} />
            <div className="vert-list">
              {VERTICALS.map((v) => {
                const cls = `vert-status vert-status-${v.status}`;
                const label = v.status === "live" ? "Live" : v.status === "building" ? "Building" : v.status === "next" ? "Next" : "Scoping";
                return (
                  <div key={v.code} className="vert-row">
                    <span className={cls}>{label}</span>
                    <span className="vert-name">{v.label}</span>
                    <span className="vert-desc">{v.desc}</span>
                  </div>
                );
              })}
            </div>
            <p className="vert-cta">
              Explore the&nbsp;
              <Link href="/rights-graph" className="vert-link">Unified Rights Graph</Link>
              &nbsp;· the&nbsp;
              <Link href="/rights-graph/divergence" className="vert-link">Divergence Engine</Link>
              &nbsp;· the&nbsp;
              <Link href="/rights-graph/fria-gap" className="vert-link">FRIA Gap</Link>
              &nbsp;· the&nbsp;
              <Link href="/rights-graph/exposure" className="vert-link">Exposure view</Link>
              &nbsp;· the&nbsp;
              <Link href="/rights-graph/precedents" className="vert-link">Precedent System</Link>
              &nbsp;· the&nbsp;
              <Link href="/ai-act-scenarios" className="vert-link">Scenario Engine</Link>
              &nbsp;· the&nbsp;
              <Link href="/code-radar" className="vert-link">Code Radar</Link>
              &nbsp;· the&nbsp;
              <Link href="/roadmap" className="vert-link">roadmap</Link>
            </p>
          </div>

          {/* ── WHAT AEGIS DOES ── */}
          <div className="block-section">
            <p className="block-label">Inside the children&apos;s-rights vertical — our deepest layer</p>
            <p className="block-intro">
              The Rights Graph is the foundation of the infrastructure. To prove the method end-to-end, we went deep on one vertical first:
              <strong> children&apos;s digital rights</strong>. Everything below is the children&apos;s-rights vertical in
              detail — an intelligence layer mapping where those rights are at risk across the EU, feeding a FRIA engine
              that produces a structured first draft for expert completion. It is depth on one domain, not the whole of Aegis.
            </p>
            <div className="modules-list">
              {MODULES.map((m) => (
                <div key={m.name} className="module-row">
                  <span className="module-dot" style={{ background: m.color }} />
                  <span className="module-name">{m.name}</span>
                  <span className="module-what">{m.what}</span>
                </div>
              ))}
              <div className="module-row">
                <span className="module-dot" style={{ background: "#34d399" }} />
                <span className="module-name">FRIA Engine</span>
                <span className="module-what">Produce a structured first draft of an EU AI Act Article 27 Fundamental Rights Impact Assessment, specialised for minors — auto-saved, versioned and exportable. A starting point for expert completion, not a substitute for it.</span>
              </div>
              <div className="module-row">
                <span className="module-dot" style={{ background: "#a78bfa" }} />
                <span className="module-name">Contribute</span>
                <span className="module-what">Upload a report or decision (PDF / DOCX) and the platform structures it for review — so field experts shape what Aegis tracks.</span>
              </div>
            </div>
          </div>

          {/* ── DOMAINS COVERED ── */}
          <p className="section-label">Sectors monitored</p>
          <div className="domains-grid">
            {DOMAINS.map((d) => (
              <div key={d.label} className="domain-card">
                <p className="domain-icon">{d.icon}</p>
                <p className="domain-label">{d.label}</p>
              </div>
            ))}
          </div>

          <RequestAccessForm />

          {/* ── CTA ── */}
          <Link href="/overview" className="cta">
            ENTER AEGIS <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </div>

        <p className="footer-text">© 2026 AEGIS · THINKLANCE AI</p>
        <p className="footer-legal">
          <Link href="/legal/privacy">Privacy</Link>
          <span> · </span>
          <Link href="/legal/terms">Terms</Link>
          <span> · </span>
          <Link href="/legal/notice">Legal notice</Link>
          <span> · </span>
          <Link href="/methodology">Methodology</Link>
        </p>
      </main>
    </>
  );
}
