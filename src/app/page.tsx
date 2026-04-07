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
          max-width: 820px;
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
          margin-bottom: 56px;
        }
        .pillar {
          padding: 32px 30px;
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
          font-size: 17px;
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
        .ds-sep { color: #1a3255; }
        .footer-text {
          font-family: var(--font-mono), monospace;
          font-size: 10px;
          color: #1e3a5f;
          letter-spacing: 0.1em;
          text-align: center;
        }
        @media (max-width: 700px) {
          .pillars { grid-template-columns: 1fr; }
          .pillar-divider { display: none; }
          .headline { font-size: 28px; }
        }
      `}</style>

      <main className="landing">
        <div className="grid-bg" />
        <div className="glow" />

        <div className="content">
          <Image src="/logo.png" alt="Aegis" width={220} height={257} priority />

          <p className="tagline">Fundamental Rights · AI Compliance · EU27</p>

          <h1 className="headline">
            The intelligence layer<br />for responsible AI in Europe
          </h1>

          <p className="sub">
            AEGIS combines fundamental rights signal intelligence with EU AI Act compliance tooling —
            giving organizations a single platform to monitor discrimination risks,
            assess their AI deployments, and demonstrate Article 9 compliance.
          </p>

          <div className="pillars">
            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(255,92,92,0.1)", color: "#ff5c5c", border: "1px solid rgba(255,92,92,0.25)" }}>
                Intelligence
              </span>
              <h2 className="pillar-title">Discrimination<br />Signal Monitor</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Real-time signals across EU27 countries & groups</li>
                <li className="pillar-item">Powered by FRA, Eurostat & UN Treaty Body data</li>
                <li className="pillar-item">Convergence alerts by country, sector & population</li>
                <li className="pillar-item">Exportable country briefings & recommendations</li>
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
                <li className="pillar-item">Contextual FRIA based on deployment profile</li>
                <li className="pillar-item">Discrimination context auto-loaded by country</li>
                <li className="pillar-item">Audit-ready export — deadline August 2, 2026</li>
              </ul>
            </div>

            <div className="pillar-divider" />

            <div className="pillar">
              <span className="pillar-tag" style={{ background: "rgba(0,200,130,0.1)", color: "#00c882", border: "1px solid rgba(0,200,130,0.2)" }}>
                Cross-Reference
              </span>
              <h2 className="pillar-title">AI × Discrimination<br />Risk Context</h2>
              <ul className="pillar-items">
                <li className="pillar-item">Maps AI deployments to discrimination signals</li>
                <li className="pillar-item">Risk context by country, sector & affected group</li>
                <li className="pillar-item">Direct link to applicable EU AI Act obligations</li>
                <li className="pillar-item">Triggers FRIA automatically when thresholds met</li>
              </ul>
            </div>
          </div>

          <Link href="/login" className="cta">
            ACCESS PLATFORM <ArrowRight style={{ width: 18, height: 18 }} />
          </Link>

          <div className="data-sources">
            <span>DATA SOURCES</span>
            <span className="ds-sep">·</span>
            <span>FRA FUNDAMENTAL RIGHTS AGENCY</span>
            <span className="ds-sep">·</span>
            <span>EUROSTAT</span>
            <span className="ds-sep">·</span>
            <span>UN TREATY BODY</span>
            <span className="ds-sep">·</span>
            <span>EU AI ACT</span>
          </div>
        </div>

        <p className="footer-text">© 2026 AEGIS · THINKLANCE AI</p>
      </main>
    </>
  );
}
