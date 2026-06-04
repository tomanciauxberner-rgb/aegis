/**
 * Explain Why — generic explanation engine.
 *
 * A single, reusable contract that any scored view (Compliance DNA,
 * FRIA Studio, Compliance Bridge) can produce. The deterministic layer is
 * computed from the underlying engines — it is sourced and never invented.
 * An optional narrative layer (via Claude) can elaborate on top, but it
 * never alters the numbers.
 *
 * The shape answers four questions a reviewer always asks:
 *   Why this score?  →  reasons[]
 *   How to fix it?   →  remediations[]
 *   What will it take? → effort + timeEstimate per remediation
 *   What's the payoff? → scoreImpact per remediation
 */

export type Effort = "low" | "medium" | "high";

export interface ExplainReason {
  code: string;
  label: string;          // what is missing / driving the score
  detail: string;         // the specific obligation, evidence or mapping involved
  reference?: string;     // article / clause citation if applicable
}

export interface ExplainRemediation {
  code: string;
  action: string;         // what to do
  effort: Effort;
  timeEstimate: string;   // human-readable, e.g. "2–3 weeks"
  scoreImpactPts: number; // estimated points gained on the relevant metric
  reference?: string;
}

export interface Explanation {
  subject: string;        // what is being explained, e.g. "AI Act coverage: 62%"
  currentValue: string;   // current metric value
  reasons: ExplainReason[];
  remediations: ExplainRemediation[];
  projectedValue?: string; // value if all remediations applied
}

export const EFFORT_META: Record<Effort, { label: string; color: string; rank: number }> = {
  low:    { label: "Low effort", color: "#34d399", rank: 1 },
  medium: { label: "Medium effort", color: "#e8b84b", rank: 2 },
  high:   { label: "High effort", color: "#ff5c5c", rank: 3 },
};

/**
 * Orders remediations by best return on effort:
 * highest score impact per unit of effort first.
 */
export function prioritiseRemediations(remediations: ExplainRemediation[]): ExplainRemediation[] {
  return [...remediations].sort((a, b) => {
    const ra = a.scoreImpactPts / EFFORT_META[a.effort].rank;
    const rb = b.scoreImpactPts / EFFORT_META[b.effort].rank;
    return rb - ra;
  });
}

export function totalProjectedGain(remediations: ExplainRemediation[]): number {
  return remediations.reduce((s, r) => s + r.scoreImpactPts, 0);
}

/**
 * Builds the structured prompt for the optional Claude deep-dive.
 * The model is given the deterministic facts and asked only to narrate —
 * explicitly instructed not to invent or alter figures.
 */
export function buildNarrativePrompt(explanation: Explanation): string {
  const reasons = explanation.reasons
    .map((r) => `- ${r.label}${r.reference ? ` (${r.reference})` : ""}: ${r.detail}`)
    .join("\n");
  const remediations = prioritiseRemediations(explanation.remediations)
    .map((r) => `- ${r.action} [${r.effort} effort, ${r.timeEstimate}, +${r.scoreImpactPts} pts]${r.reference ? ` (${r.reference})` : ""}`)
    .join("\n");

  return [
    "You are a compliance analyst explaining a scored result to a non-specialist.",
    "Use ONLY the facts provided. Do not invent obligations, figures, deadlines or articles.",
    "Do not change any number. Be concise, concrete and neutral.",
    "",
    `Subject: ${explanation.subject}`,
    `Current value: ${explanation.currentValue}`,
    explanation.projectedValue ? `Projected if all actions taken: ${explanation.projectedValue}` : "",
    "",
    "Why the score is what it is:",
    reasons || "- (no specific gaps recorded)",
    "",
    "Recommended actions (already prioritised by return on effort):",
    remediations || "- (none)",
    "",
    "Write 2–3 short paragraphs: (1) why the score sits where it does, (2) the highest-leverage next step and why, (3) one caution about what the score does NOT capture. No headings.",
  ].filter(Boolean).join("\n");
}
