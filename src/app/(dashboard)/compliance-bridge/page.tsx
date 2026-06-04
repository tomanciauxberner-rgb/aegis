import { ComplianceBridgeApp } from "@/components/compliance-bridge/compliance-bridge-app";

export const dynamic = "force-dynamic";

export default function ComplianceBridgePage() {
  return (
    <div style={{ maxWidth: 1040, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{ fontSize: 11, fontFamily: "var(--font-mono), monospace", letterSpacing: "0.2em", textTransform: "uppercase", color: "#4f7cff", marginBottom: 10 }}>
          Compliance Bridge · Cross-framework
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#e8eaf0", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          ISO 42001 × EU AI Act
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 720 }}>
          A source-verified crosswalk between ISO/IEC 42001 and the EU AI Act. Click any clause or article to
          light up its connections. Reverse Compliance answers the question every certified organisation asks:
          &ldquo;I hold ISO 42001 — how much of the AI Act does that actually cover, and what is missing?&rdquo;
        </p>
      </div>

      <ComplianceBridgeApp />
    </div>
  );
}
