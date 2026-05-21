import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

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

const POPULATIONS = [
  "Roma & Travellers",
  "People of African Descent",
  "LGBTIQ+",
  "Muslims",
  "Jewish Communities",
  "Women",
  "Persons with Disabilities",
  "Migrants & Refugees",
];

const ROADMAP = [
  "FRIA methodology validation",
  "Dataset coverage expansion",
  "Civic space indicators",
  "Children's digital rights",
  "Publication-ready visualisations",
];

const UPDATES = [
  { tag: "Intelligence", color: "#4f7cff", title: "Children Digital Rights Index", desc: "Composite EU-27 ranking across enforcement, app compliance, EdTech risk and framework maturity." },
  { tag: "Intelligence", color: "#4f7cff", title: "Enforcement Intelligence", desc: "Cross-border DPA enforcement patterns linked to CJEU / ECHR case law." },
  { tag: "Intelligence", color: "#e8b84b", title: "Compliance Gap Engine", desc: "Systemic age-of-consent violations: declared app ages vs GDPR Art. 8 per country." },
  { tag: "Intelligence", color: "#e8b84b", title: "Deployment Risk Atlas", desc: "Risk-scored national EdTech systems with one-click FRIA generation." },
  { tag: "FRIA", color: "#34d399", title: "Minors-specialised FRIA engine", desc: "Age bands, Charter Art. 24, UN CRC and developmental vulnerabilities — persisted and exportable." },
  { tag: "Platform", color: "#a78bfa", title: "Document ingestion", desc: "Upload PDF / DOCX reports — structured data extracted automatically for review." },
];

export default function HomePage() {
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
          margin-bottom: 8px;
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
        .footer-text {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #1e3a5f;
          letter-spacing: 0.1em;
          text-align: center;
        }
        @media (max-width: 700px) {
          .open-banner { padding: 12px 16px; gap: 8px; }
          .open-mission { font-size: 11px; }
          .landing { padding: 48px 16px 40px; }
          .pillars { grid-template-columns: 1fr; }
          .updates-grid { grid-template-columns: 1fr; }
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
        </div>
      </div>

      <main className="landing">
        <div className="grid-bg" />
        <div className="glow" />
        <div className="glow2" />

        <div className="content">
          <Image src="/logo.png" alt="Aegis" width={180} height={210} priority />

          <p className="tagline">Fundamental Rights Intelligence · EU AI Act FRIA · EU27</p>

          <h1 className="headline">
            Fundamental rights intelligence,<br /><em>turned into AI Act compliance.</em>
          </h1>

          <p className="sub">
            AEGIS is an open, non-profit platform that turns fundamental rights intelligence
            across the EU into action — from live monitoring of enforcement, policy and risk,
            to ready-to-file EU AI Act Impact Assessments. Today its sharpest edge is
            children&apos;s digital rights.
          </p>

          <div className="stats-row">
            {[
              { value: "27", label: "EU Member States" },
              { value: "5", label: "Intelligence Modules" },
              { value: "Art. 27", label: "FRIA Engine" },
              { value: "Open", label: "Non-profit · AGPL" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <p className="stat-value">{s.value}</p>
                <p className="stat-label">{s.label}</p>
              </div>
            ))}
          </div>

          {/* ── LATEST UPDATES ── */}
          <div className="updates">
            <div className="updates-head">
              <span className="updates-badge">● Latest updates</span>
              <span className="updates-sub">Recently shipped</span>
            </div>
            <div className="updates-grid">
              {UPDATES.map((u) => (
                <div key={u.title} className="update-card">
                  <span className="update-tag" style={{ color: u.color, border: `1px solid ${u.color}40`, background: `${u.color}14` }}>{u.tag}</span>
                  <p className="update-title">{u.title}</p>
                  <p className="update-desc">{u.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── THREE PILLARS ── */}
          <div className="pillars">
            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(255,92,92,0.1)", color: "#ff5c5c", border: "1px solid rgba(255,92,92,0.25)" }}>
                Intelligence
              </span>
              <h2 className="pillar-title">Children&apos;s Rights<br />Intelligence</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Children Digital Rights Index — composite EU-27 ranking</li>
                <li className="pillar-item">Cross-border DPA enforcement patterns + linked case law</li>
                <li className="pillar-item">Compliance gaps: app ages vs GDPR Art. 8 per country</li>
                <li className="pillar-item">EdTech Deployment Risk Atlas — Annex III national systems</li>
                <li className="pillar-item">Forward Signal — open consultations &amp; policy windows</li>
              </ul>
            </div>

            <div className="pillar-divider" />

            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.25)" }}>
                FRIA
              </span>
              <h2 className="pillar-title">FRIA Engine<br />for Minors</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Article 27 Fundamental Rights Impact Assessments</li>
                <li className="pillar-item">Child age bands with developmental cognitive profiles</li>
                <li className="pillar-item">Charter Art. 24, UN CRC &amp; AI Act Annex III mapping</li>
                <li className="pillar-item">One-click generation from any EdTech system</li>
                <li className="pillar-item">Auto-saved, versioned, exportable legal document</li>
              </ul>
            </div>

            <div className="pillar-divider" />

            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(79,124,255,0.1)", color: "#4f7cff", border: "1px solid rgba(79,124,255,0.25)" }}>
                Open
              </span>
              <h2 className="pillar-title">Open Contributive<br />Platform</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Non-profit, open-source — offered to the rights community</li>
                <li className="pillar-item">Upload PDF / DOCX reports — AI structures the data</li>
                <li className="pillar-item">Verified, sourced landmark decisions with attribution</li>
                <li className="pillar-item">Built for institutional experts to enrich and validate</li>
                <li className="pillar-item">Every data point links back to its primary source</li>
              </ul>
            </div>
          </div>

          {/* ── SIGNAL MONITOR DEMO ── */}
          <div className="demo-block">
            <div className="demo-header">
              <div>
                <p className="demo-title">Early Warning System — live convergence detection</p>
                <p className="demo-sub">Three signal types converge on the same country × group × sector = alert triggered</p>
              </div>
              <span className="pillar-tag" style={{ background: "rgba(255,92,92,0.1)", color: "#ff5c5c", border: "1px solid rgba(255,92,92,0.25)" }}>
                Signal Monitor
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
              {[
                { country: "Country A", level: "ELEVATED", levelColor: "#e8b84b", levelBg: "rgba(232,184,75,0.1)", levelBorder: "rgba(232,184,75,0.25)", signals: ["📊 Discrimination rate 38% (+5pp)", "⚖️ 2 AI systems declared", "🚨 Algorithmic bias documented"], tag: "3/3 signal types · Employment", tagColor: "#e8b84b", tagBg: "rgba(232,184,75,0.06)", tagBorder: "rgba(232,184,75,0.15)" },
                { country: "Country B", level: "ELEVATED", levelColor: "#e8b84b", levelBg: "rgba(232,184,75,0.1)", levelBorder: "rgba(232,184,75,0.25)", signals: ["📊 Discrimination rate 45% (+9pp)", "⚖️ 7 Annex III systems declared", "🚨 Recruitment bias case"], tag: "3/3 signal types · Employment", tagColor: "#e8b84b", tagBg: "rgba(232,184,75,0.06)", tagBorder: "rgba(232,184,75,0.15)" },
                { country: "Country C", level: "WATCH", levelColor: "#4f7cff", levelBg: "rgba(79,124,255,0.1)", levelBorder: "rgba(79,124,255,0.25)", signals: ["📊 Poverty rate 82%", "⚖️ AI systems in deployment", "🚨 Proxy discrimination flagged"], tag: "3/3 signal types · Essential services", tagColor: "#4f7cff", tagBg: "rgba(79,124,255,0.06)", tagBorder: "rgba(79,124,255,0.15)" },
              ].map((c) => (
                <div key={c.country} className="demo-example">
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                    <p className="demo-country" style={{ margin: 0 }}>
                      <span style={{ width: 16, height: 16, borderRadius: "50%", background: "#1e3a5f", display: "inline-block" }} /> {c.country}
                    </p>
                    <span className="pillar-tag" style={{ background: c.levelBg, color: c.levelColor, border: `1px solid ${c.levelBorder}`, margin: 0, fontSize: 9 }}>{c.level}</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                    {c.signals.map((s) => (
                      <div key={s} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 11, color: "#7aaac8" }}>
                        <span style={{ fontSize: 13 }}>{s.slice(0, 2)}</span> {s.slice(3)}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 10, padding: "6px 10px", background: c.tagBg, border: `1px solid ${c.tagBorder}`, borderRadius: 6, fontSize: 10, color: c.tagColor, fontFamily: "var(--font-mono), monospace" }}>
                    {c.tag}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── CROSS-REFERENCE DEMO ── */}
          <div className="demo-block">
            <div className="demo-header">
              <div>
                <p className="demo-title">What happens when you register an AI system?</p>
                <p className="demo-sub">AEGIS cross-references your deployment against real discrimination signals</p>
              </div>
              <span className="pillar-tag" style={{ background: "rgba(232,184,75,0.1)", color: "#e8b84b", border: "1px solid rgba(232,184,75,0.25)" }}>
                Cross-Reference
              </span>
            </div>
            <div className="demo-example">
              <p className="demo-country">
                <span style={{ fontSize: 18 }}>🤖</span> Your AI Recruitment Tool → deployed in EU Member State
              </p>
              <div className="demo-signal">
                <span className="demo-dot" style={{ background: "#e8b84b" }} />
                <span>Population A — Employment discrimination rate above EU average</span>
                <span className="demo-delta" style={{ color: "#ff5c5c" }}>+7pp vs EU</span>
              </div>
              <div className="demo-signal">
                <span className="demo-dot" style={{ background: "#e8b84b" }} />
                <span>Population B — Employment discrimination rate above EU average</span>
                <span className="demo-delta" style={{ color: "#ff5c5c" }}>+2pp vs EU</span>
              </div>
              <div className="demo-signal">
                <span className="demo-dot" style={{ background: "#ff5c5c" }} />
                <span>Documented incident — Algorithmic screening bias against minority applicants</span>
                <span className="demo-delta" style={{ color: "#4a7fa5" }}>2023</span>
              </div>
              <div className="demo-signal">
                <span className="demo-dot" style={{ background: "#4f7cff" }} />
                <span>Legislative — High-risk AI systems declared in employment sector</span>
                <span className="demo-delta" style={{ color: "#4a7fa5" }}>2024</span>
              </div>
              <div className="demo-rec">
                ⚠ WARNING: Your AI system operates in a context where two population groups
                face elevated discrimination in employment. EU AI Act Art. 9 requires documented
                risk mitigation. Consider enhanced bias testing for affected populations.
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

          <p className="section-label" style={{ marginTop: 32 }}>Population groups covered</p>
          <div className="pop-grid">
            {POPULATIONS.map((p) => (
              <span key={p} className="pop-tag">{p}</span>
            ))}
          </div>

          {/* ── CTA ── */}
          <Link href="/login" className="cta">
            ACCESS PLATFORM <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>
        </div>

        <p className="footer-text">© 2026 AEGIS · THINKLANCE AI</p>
      </main>
    </>
  );
}
