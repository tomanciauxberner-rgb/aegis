import { Suspense } from "react";
import { StudioWizard } from "@/components/fria-studio/studio-wizard";

export const dynamic = "force-dynamic";

export default function FriaStudioPage() {
  return (
    <div style={{ maxWidth: 980, margin: "0 auto", padding: "32px 24px 64px" }}>
      <div style={{ marginBottom: 28 }}>
        <p style={{
          fontSize: 11,
          fontFamily: "var(--font-mono), monospace",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "#4f7cff",
          marginBottom: 10,
        }}>
          FRIA Studio · Article 27
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 700, color: "#e8eaf0", margin: "0 0 10px", letterSpacing: "-0.02em" }}>
          Fundamental Rights Impact Assessment
        </h1>
        <p style={{ fontSize: 14, color: "rgba(255,255,255,0.55)", lineHeight: 1.6, maxWidth: 680 }}>
          A structured first draft of an EU AI Act Article 27 FRIA across any Annex III domain.
          Select your domain, walk the system lifecycle, see rights exposure as a heatmap, and
          attach the evidence that makes each control defensible. Auto-saved and versioned — a
          starting point for expert completion, not a substitute for it.
        </p>
      </div>

      <Suspense fallback={null}>
        <StudioWizard />
      </Suspense>
    </div>
  );
}
