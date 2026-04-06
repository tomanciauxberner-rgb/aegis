import Link from "next/link";
import { Plus, FileCheck } from "lucide-react";

export default function AssessmentsPage() {
  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold mb-1">
            FRIA Assessments
          </h1>
          <p className="text-sm text-text-muted">
            Fundamental Rights Impact Assessments — Article 27 EU AI Act
          </p>
        </div>
        <Link
          href="/assessments/new"
          className="flex items-center gap-2 px-4 py-2 bg-accent text-white text-sm font-medium rounded hover:bg-accent/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New assessment
        </Link>
      </div>

      <div className="bg-surface border border-border rounded-lg p-12 text-center">
        <FileCheck className="w-10 h-10 text-text-dim mx-auto mb-4" />
        <h2 className="text-lg font-semibold mb-2">No assessments yet</h2>
        <p className="text-sm text-text-muted max-w-md mx-auto">
          Register an AI system first, then start a FRIA assessment. Aegis will
          pre-load risk indicators from FRA data for your deployment country and
          sector.
        </p>
      </div>
    </div>
  );
}
