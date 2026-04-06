import { FriaWizard } from "@/components/fria/wizard";

export default function NewAssessmentPage() {
  return (
    <div>
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">
          New FRIA Assessment
        </h1>
        <p className="text-sm text-text-muted">
          Fundamental Rights Impact Assessment — Article 27, EU AI Act
        </p>
      </div>
      <FriaWizard />
    </div>
  );
}
