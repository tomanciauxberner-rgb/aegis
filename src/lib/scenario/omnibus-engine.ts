// Regulatory Scenario Engine — Omnibus.
// All regulatory logic is DETERMINISTIC and SOURCED. No generated probabilities.
// Sources (verified May 2026): Gibson Dunn, White & Case, Latham & Watkins,
// Inside Privacy, DLA Piper, European Commission. See SOURCES below.

export const SOURCES = [
  { id: "ec", label: "European Commission — Navigating the AI Act", url: "https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act" },
  { id: "gibson", label: "Gibson Dunn — Omnibus Agreement (May 2026)", url: "https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/" },
  { id: "wc", label: "White & Case — EU agrees Digital Omnibus deal", url: "https://www.whitecase.com/insight-alert/eu-agrees-digital-omnibus-deal-simplify-ai-rules" },
  { id: "iapp", label: "IAPP — Deployer evidence gaps before 2 Aug 2026", url: "https://iapp.org/news/a/eu-ai-act-deployer-evidence-gaps-smes-will-miss-before-2-aug-2026" },
  { id: "aesia", label: "AESIA (Spain) — 16 practical guides (Dec 2025)", url: "https://www.legalnodes.com/article/eu-ai-act-2026-updates-compliance-requirements-and-business-risks" },
];

export type DeployerRole = "provider" | "deployer" | "both";
export type SystemNature = "standalone" | "embedded_product" | "gpai" | "transparency_only" | "unsure";

export interface AnnexIIIArea {
  code: string;
  label: string;
  note: string;
}

export const ANNEX_III_AREAS: AnnexIIIArea[] = [
  { code: "biometrics",    label: "Biometrics & categorisation", note: "Annex III(1)" },
  { code: "critical_infra",label: "Critical infrastructure",     note: "Annex III(2)" },
  { code: "education",     label: "Education & vocational training", note: "Annex III(3) — incl. systems assessing children" },
  { code: "employment",    label: "Employment, HR & worker management", note: "Annex III(4)" },
  { code: "essential",     label: "Essential private & public services (credit, insurance, benefits)", note: "Annex III(5)" },
  { code: "law_enforcement",label: "Law enforcement",            note: "Annex III(6)" },
  { code: "migration",     label: "Migration, asylum & border control", note: "Annex III(7)" },
  { code: "justice",       label: "Administration of justice & democratic processes", note: "Annex III(8)" },
  { code: "none",          label: "None of these / not high-risk", note: "May fall outside Annex III" },
];

export interface ScenarioInput {
  role: DeployerRole;
  nature: SystemNature;
  annexArea: string;
  country: string;
  description?: string;
}

export interface Scenario {
  id: string;
  label: string;
  trigger: string;
  likelihood: "baseline" | "agreed-but-pending" | "contingent" | "interpretive";
  deadline: string;
  deadlineNote: string;
  exposure: string;
  sourceIds: string[];
}

export interface DivergencePoint {
  question: string;
  positions: { stance: string; basis: string; weight: "majority" | "minority" | "contested" | "emerging" }[];
}

export interface ScenarioResult {
  headline: string;
  personalDeadline: string;
  deadlineConfidence: string;
  scenarios: Scenario[];
  divergences: DivergencePoint[];
  robustActions: string[];
  caveat: string;
}

// ── Deadline resolution (sourced, deterministic) ────────────────
function resolveDeadline(nature: SystemNature, annexArea: string): { agreed: string; original: string; note: string } {
  if (nature === "transparency_only") {
    return {
      agreed: "2 December 2026",
      original: "2 August 2026",
      note: "Article 50 transparency / watermarking obligations were moved to 2 Dec 2026 under the Omnibus (a 3-month grace period). Applies to AI generating audio, image, video or text.",
    };
  }
  if (nature === "embedded_product") {
    return {
      agreed: "2 August 2028",
      original: "2 August 2026",
      note: "High-risk AI embedded as a safety component of a regulated product (Annex I) is deferred to 2 Aug 2028 under the Omnibus agreement.",
    };
  }
  if (nature === "gpai") {
    return {
      agreed: "Already applicable (since 2 Aug 2025)",
      original: "2 August 2025",
      note: "GPAI model obligations (incl. systemic-risk models under Art. 51) are already in application and were not deferred by the Omnibus.",
    };
  }
  if (nature === "standalone" && annexArea !== "none") {
    return {
      agreed: "2 December 2027",
      original: "2 August 2026",
      note: "Stand-alone Annex III high-risk obligations (Articles 9–17 provider, Article 26 deployer) are deferred to 2 Dec 2027 under the Omnibus agreement.",
    };
  }
  return {
    agreed: "Depends on classification",
    original: "2 August 2026",
    note: "If the system is not Annex III high-risk, core high-risk obligations may not apply — but Article 4 AI-literacy (since 2 Feb 2025) and possibly Article 50 transparency still do.",
  };
}

export function runScenarioEngine(input: ScenarioInput): ScenarioResult {
  const { nature, annexArea, role } = input;
  const dl = resolveDeadline(nature, annexArea);
  const isHighRisk = nature === "standalone" && annexArea !== "none";

  const scenarios: Scenario[] = [];

  // Scenario A — Omnibus formally adopted (the agreed baseline)
  scenarios.push({
    id: "adopted",
    label: "Omnibus adopted before 2 Aug 2026",
    trigger: "The provisional agreement of 7 May 2026 is formally adopted and published in the Official Journal before 2 August 2026.",
    likelihood: "agreed-but-pending",
    deadline: dl.agreed,
    deadlineNote: dl.note,
    exposure: "Lowest immediate pressure: you gain runway to the deferred date. But the AI Act is in force — Article 5 prohibitions and Article 4 AI-literacy already apply, and pausing governance is explicitly discouraged.",
    sourceIds: ["gibson", "wc", "ec"],
  });

  // Scenario B — Omnibus fails / not adopted in time
  scenarios.push({
    id: "failed",
    label: "Omnibus NOT adopted before 2 Aug 2026",
    trigger: "Formal adoption slips past 2 August 2026. Until publication in the Official Journal, the original AI Act timeline applies as written.",
    likelihood: "contingent",
    deadline: isHighRisk ? "2 August 2026" : dl.agreed,
    deadlineNote: "If adoption slips, the original 2 Aug 2026 high-risk deadline becomes legally operative with no transition. This is the core regulatory-timing risk.",
    exposure: isHighRisk
      ? "Highest: if you planned around 2027 and adoption fails, you face the full Article 9–17 / Article 26 obligations on 2 Aug 2026 with a severely compressed window. Penalties reach €15M or 3% of global turnover; misclassification can trigger recalls or deployment suspension."
      : "Limited for non-Annex-III systems, but Article 4 and Article 50 still bite.",
    sourceIds: ["dla", "iapp", "ec"],
  });

  // Scenario C — Strict national interpretation
  scenarios.push({
    id: "strict",
    label: "Strict national interpretation",
    trigger: `A protective supervisory authority (the kind seen in several Member States) reads borderline scope expansively — pulling your system into Annex III${annexArea === "none" ? " despite an arguable exemption" : ""}.`,
    likelihood: "interpretive",
    deadline: dl.agreed,
    deadlineNote: "Classification, not calendar, is the risk here. A stricter reading can reclassify a system you believed was out of scope.",
    exposure: "Medium-high: reclassification means the full high-risk obligation stack applies. The cost is the gap between what you prepared for and what's then required.",
    sourceIds: ["ec", "aesia"],
  });

  // Scenario D — Pro-innovation / sandbox
  scenarios.push({
    id: "proinnovation",
    label: "Pro-innovation / sandbox path",
    trigger: "You operate within a regulatory sandbox (Art. 57–61) or a Member State applies the AI Act's SME and innovation measures (Art. 62).",
    likelihood: "interpretive",
    deadline: dl.agreed,
    deadlineNote: "Sandbox participation can provide supervised runway and clearer expectations, but does not remove the underlying obligations.",
    exposure: "Lower, with caveats: supervised testing reduces enforcement surprise but requires active engagement with the national competent authority.",
    sourceIds: ["ec"],
  });

  // Role-specific divergences
  const divergences: DivergencePoint[] = [];

  if (isHighRisk) {
    divergences.push({
      question: role === "deployer" || role === "both"
        ? "Does the provider's conformity assessment cover your obligations as a deployer?"
        : "Where does the provider obligation end and the deployer obligation begin?",
      positions: [
        { stance: "Deployer must hold its own evidence", basis: "Article 26 imposes distinct deployer duties; vendor CE-marking and technical documentation are not a substitute for the deployer's own records (IAPP).", weight: "majority" },
        { stance: "Vendor certification is largely sufficient", basis: "A common assumption among mid-market deployers — flagged by IAPP as the single most frequent and dangerous misconception.", weight: "minority" },
      ],
    });
  }

  divergences.push({
    question: "Should you plan for 2 December 2027 or 2 August 2026?",
    positions: [
      { stance: "Plan for 2 Aug 2026 until the Omnibus is published", basis: "DLA Piper, IAPP and the Commission stress that a proposal is not law; planning around an unenacted extension is a material risk.", weight: "majority" },
      { stance: "Plan for the deferred date now", basis: "Several firms treat the 7 May agreement as the 'operative planning baseline', given strong political momentum toward adoption.", weight: "emerging" },
    ],
  });

  if (annexArea === "none") {
    divergences.push({
      question: "Is the system actually outside Annex III?",
      positions: [
        { stance: "Out of scope", basis: "If the use case matches none of the Annex III areas and no exception is misapplied.", weight: "contested" },
        { stance: "In scope on a broad reading", basis: "Borderline functions (profiling, scoring, decision-support) are frequently reclassified by protective authorities.", weight: "contested" },
      ],
    });
  }

  // Robust actions — valuable under BOTH timelines
  const robustActions = [
    "Confirm your Article 4 AI-literacy measures now — these have applied since 2 Feb 2025 regardless of any deferral.",
    isHighRisk
      ? "Build your own Article 26 deployer evidence file — do not rely on the provider's conformity assessment alone."
      : "Document your classification reasoning so a 'not high-risk' position is defensible if challenged.",
    "Run a Fundamental Rights Impact Assessment now — it is required for many Annex III deployers and is valuable evidence whatever the final deadline.",
    "Map your system against the AESIA practical guides as a concrete public starting point.",
    nature === "transparency_only" || nature === "standalone"
      ? "Prepare Article 50 transparency / marking for the 2 Dec 2026 date — this was only lightly deferred."
      : "Track whether your product falls under Annex I safety law, which carries the later 2 Aug 2028 date.",
  ];

  return {
    headline: isHighRisk
      ? `Your stand-alone Annex III system has an agreed deadline of ${dl.agreed} — but it is not yet law.`
      : `Your system's timeline depends on classification: ${dl.agreed}.`,
    personalDeadline: dl.agreed,
    deadlineConfidence: "Agreed on 7 May 2026, pending formal adoption. 2 August 2026 remains legally operative until the Omnibus is published in the Official Journal.",
    scenarios,
    divergences,
    robustActions,
    caveat: "This is regulatory scenario intelligence, not legal advice. Every scenario is grounded in cited public sources and reflects the position as of May 2026. A qualified professional should validate any decision before you act on it.",
  };
}
