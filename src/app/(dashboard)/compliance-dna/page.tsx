import { ComplianceDnaApp } from "@/components/compliance-dna/compliance-dna-app";

export const dynamic = "force-dynamic";

export default function ComplianceDnaPage() {
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>
          Compliance DNA · Multi-regime
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#e8eaf0", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Compliance genome & exposure
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 720 }}>
          Coverage across AI Act, GDPR, NIS2, DORA, CRA and ISO 42001 — scored by legal force, not a single
          opaque number. The Risk-to-Fine view bounds exposure to the real Article-level ceilings of each
          regime; it never invents a figure. Board Mode condenses it to one page for leadership.
        </p>
      </div>

      <ComplianceDnaApp />
    </div>
  );
}
