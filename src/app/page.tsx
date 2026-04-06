import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

export default function HomePage() {
  return (
    <>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
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
        .content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          width: 100%;
          max-width: 860px;
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
          font-size: 38px;
          font-weight: 700;
          color: #e8eaf0;
          line-height: 1.3;
          margin-bottom: 20px;
          letter-spacing: -0.01em;
        }
        .sub {
          font-size: 17px;
          color: #7aaac8;
          line-height: 1.8;
          max-width: 620px;
          margin-bottom: 56px;
        }

        .pillars {
          display: grid;
          grid-template-columns: 1fr 1px 1fr 1px 1fr;
          gap: 0;
          width: 100%;
          background: rgba(30,58,95,0.3);
          border: 1px solid #1e3a5f;
          border-radius: 16px;
          overflow: hidden;
          margin-bottom: 40px;
        }
        .pillar {
          padding: 32px 32px;
          text-align: left;
        }
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
          font-size: 18px;
          font-weight: 700;
          color: #e8eaf0;
          margin-bottom: 12px;
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

        .crossref-section {
          width: 100%;
          margin-bottom: 40px;
        }
        .crossref-label {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: #4a7fa5;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .crossref-label::before {
          content: "";
          display: inline-block;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #ff5c5c;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .crossref-card {
          background: rgba(20, 40, 70, 0.6);
          border: 1px solid #1e3a5f;
          border-radius: 14px;
          padding: 28px 32px;
          text-align: left;
        }
        .crossref-headline {
          font-size: 15px;
          font-weight: 600;
          color: #e8eaf0;
          margin-bottom: 20px;
          font-family: var(--font-mono), monospace;
          letter-spacing: 0.03em;
        }
        .crossref-rows {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: 20px;
        }
        .crossref-row {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          background: rgba(10, 25, 50, 0.5);
          border: 1px solid #1a3255;
          border-radius: 10px;
          flex-wrap: wrap;
        }
        .country-badge {
          font-family: var(--font-mono), monospace;
          font-size: 11px;
          font-weight: 700;
          color: #7aaac8;
          background: rgba(79,124,255,0.1);
          border: 1px solid rgba(79,124,255,0.2);
          padding: 3px 9px;
          border-radius: 5px;
          min-width: 34px;
          text-align: center;
        }
        .signal-tag {
          font-size: 12px;
          color: #a0bdd4;
          flex: 1;
        }
        .severity-badge {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: 0.08em;
          padding: 3px 9px;
          border-radius: 5px;
        }
        .sev-high { background: rgba(255,92,92,0.12); color: #ff7070; border: 1px solid rgba(255,92,92,0.25); }
        .sev-med  { background: rgba(255,183,0,0.1);  color: #f0b429; border: 1px solid rgba(255,183,0,0.2);  }
        .article-ref {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #2a5080;
          letter-spacing: 0.06em;
        }
        .crossref-cta-line {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #4f7cff;
          font-family: var(--font-mono), monospace;
          letter-spacing: 0.05em;
        }

        .stats-row {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 40px;
          margin-bottom: 48px;
          flex-wrap: wrap;
        }
        .stat-item { text-align: center; }

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
          margin-bottom: 20px;
        }
        .cta:hover { background: #3a6aee; transform: translateY(-2px); }

        .data-sources {
          display: flex;
          align-items: center;
          gap: 6px;
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #2a5080;
          letter-spacing: 0.1em;
          flex-wrap: wrap;
          justify-content: center;
          margin-bottom: 48px;
        }
        .ds-sep { color: #1e3a5f; }

        .footer-text {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #1e3a5f;
          letter-spacing: 0.1em;
          text-align: center;
          margin-top: auto;
        }

        @media (max-width: 700px) {
          .pillars { grid-template-columns: 1fr; }
          .pillar-divider { display: none; }
          .headline { font-size: 28px; }
          .stats-row { gap: 24px; }
        }
      `}</style>

      <main className="landing">
        <div className="grid-bg" />
        <div className="glow" />

        <div className="content">
          <Image src="/logo.png" alt="Aegis" width={220} height={257} priority />

          <p className="tagline">Fundamental Rights · AI Compliance · EU27</p>

          <h1 className="headline">
            Deploy AI with discrimination<br />awareness built in
          </h1>

          <p className="sub">
            AEGIS is the only platform that automatically cross-references your AI deployments
            with real discrimination data by country — so you know your risk before regulators do.
          </p>

          <div className="pillars">
            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(255,92,92,0.1)", color: "#ff5c5c", border: "1px solid rgba(255,92,92,0.25)" }}>
                Intelligence
              </span>
              <h2 className="pillar-title">Early Warning<br />Signal System</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Live discrimination signals across EU27</li>
                <li className="pillar-item">FRA 2024 · Eurostat · UN Treaty Body data</li>
                <li className="pillar-item">Country briefings generated in seconds</li>
                <li className="pillar-item">Exportable intelligence reports</li>
              </ul>
            </div>

            <div className="pillar-divider" />

            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(79,124,255,0.1)", color: "#4f7cff", border: "1px solid rgba(79,124,255,0.25)" }}>
                Compliance
              </span>
              <h2 className="pillar-title">EU AI Act<br />FRIA Platform</h2>
              <ul className="pillar-items">
                <li className="pillar-item">AI systems registry & Annex III classification</li>
                <li className="pillar-item">Contextual FRIA based on real deployment profile</li>
                <li className="pillar-item">FRA data pre-loaded by country & sector</li>
                <li className="pillar-item">Audit-ready export — deadline Aug 2, 2026</li>
              </ul>
            </div>

            <div className="pillar-divider" />

            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(0,200,130,0.1)", color: "#00c882", border: "1px solid rgba(0,200,130,0.2)" }}>
                Ingestion
              </span>
              <h2 className="pillar-title">AI-Powered<br />Data Pipeline</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Paste any FRA or UN report as text</li>
                <li className="pillar-item">Claude extracts discrimination signals automatically</li>
                <li className="pillar-item">Structured data inserted into live DB instantly</li>
                <li className="pillar-item">Historical trend analysis across years</li>
              </ul>
            </div>
          </div>

          <div className="crossref-section">
            <p className="crossref-label">Live cross-reference — example output</p>
            <div className="crossref-card">
              <p className="crossref-headline">
                Recruitment Screening Tool · deployed in HU · BG · FR · Employment sector
              </p>
              <div className="crossref-rows">
                <div className="crossref-row">
                  <span className="country-badge">HU</span>
                  <span className="signal-tag">Roma employment discrimination — 38% reported rate (FRA 2024)</span>
                  <span className="severity-badge sev-high">HIGH RISK</span>
                  <span className="article-ref">Art. 9 EU AI Act</span>
                </div>
                <div className="crossref-row">
                  <span className="country-badge">HU</span>
                  <span className="signal-tag">LGBTIQ workplace exclusion — convergent signals (FRA 2024)</span>
                  <span className="severity-badge sev-med">MODERATE</span>
                  <span className="article-ref">Art. 9 EU AI Act</span>
                </div>
                <div className="crossref-row">
                  <span className="country-badge">BG</span>
                  <span className="signal-tag">Roma labour market barriers — 42% discrimination rate (FRA 2024)</span>
                  <span className="severity-badge sev-high">HIGH RISK</span>
                  <span className="article-ref">Art. 9 EU AI Act</span>
                </div>
                <div className="crossref-row">
                  <span className="country-badge">FR</span>
                  <span className="signal-tag">4 affected groups flagged — African descent, Roma, LGBTIQ, disability</span>
                  <span className="severity-badge sev-med">MODERATE</span>
                  <span className="article-ref">Art. 9 EU AI Act</span>
                </div>
              </div>
              <p className="crossref-cta-line">
                → Initiate FRIA for all flagged deployments
              </p>
            </div>
          </div>

          <div className="stats-row">
            {[
              { value: "27", label: "EU Member States" },
              { value: "75+", label: "Active alerts" },
              { value: "FRA 2024", label: "Latest dataset" },
              { value: "Aug 2026", label: "AI Act deadline" },
            ].map((s) => (
              <div key={s.label} className="stat-item">
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: 26, fontWeight: 700, color: "#e8eaf0" }}>{s.value}</p>
                <p style={{ fontFamily: "var(--font-mono), monospace", fontSize: 11, color: "#4a7fa5", letterSpacing: "0.1em", marginTop: 4 }}>{s.label}</p>
              </div>
            ))}
          </div>

          <Link href="/login" className="cta">
            ACCESS PLATFORM <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>

          <div className="data-sources">
            <span>POWERED BY</span>
            <span className="ds-sep">·</span>
            <span>FRA FUNDAMENTAL RIGHTS AGENCY</span>
            <span className="ds-sep">·</span>
            <span>EUROSTAT</span>
            <span className="ds-sep">·</span>
            <span>UN TREATY BODY DATA</span>
            <span className="ds-sep">·</span>
            <span>EU AI ACT 2024</span>
          </div>
        </div>

        <p className="footer-text">© 2026 AEGIS · THINKLANCE AI</p>
      </main>
    </>
  );
}
