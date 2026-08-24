// Regulatory Scenario Engine.
// All regulatory logic is DETERMINISTIC and SOURCED. No generated probabilities.
//
// STATUS: Regulation (EU) 2026/1744 (Digital Omnibus on AI) was adopted on
// 8 July 2026, published in the Official Journal on 24 July 2026 and entered
// into force on 27 July 2026. The deferred application dates are fixed calendar
// dates: the conditional standards-readiness trigger in the Commission proposal
// of November 2025 was removed by Parliament and Council during negotiation.
//
// Primary source: EUR-Lex, ELI http://data.europa.eu/eli/reg/2026/1744/oj
// (CELEX 32026R1744). Verified 24 August 2026.
//
// Each deadline carries a `confidence` marker distinguishing what is confirmed
// against the Official Journal from what rests on convergent secondary reporting.

export const SOURCES = [
  { id: "oj", label: "Regulation (EU) 2026/1744 (Digital Omnibus on AI) — Official Journal, 24 July 2026", url: "http://data.europa.eu/eli/reg/2026/1744/oj" },
  { id: "aiact", label: "Regulation (EU) 2024/1689 (AI Act) — Official Journal, 12 July 2024", url: "http://data.europa.eu/eli/reg/2024/1689/oj" },
  { id: "ec", label: "European Commission — Navigating the AI Act", url: "https://digital-strategy.ec.europa.eu/en/faqs/navigating-ai-act" },
  { id: "gibson", label: "Gibson Dunn — commentary on the Omnibus (secondary)", url: "https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/" },
  { id: "wc", label: "White & Case — commentary on the Omnibus (secondary)", url: "https://www.whitecase.com/insight-alert/eu-agrees-digital-omnibus-deal-simplify-ai-rules" },
  { id: "iapp", label: "IAPP — deployer evidence gaps (secondary)", url: "https://iapp.org/news/a/eu-ai-act-deployer-evidence-gaps-smes-will-miss-before-2-aug-2026" },
  { id: "aesia", label: "AESIA (Spain) — 16 practical guides (Dec 2025)", url: "https://www.legalnodes.com/article/eu-ai-act-2026-updates-compliance-requirements-and-business-risks" },
];

export type DeployerRole = "provider" | "deployer" | "both";
export type SystemNature = "standalone" | "embedded_product" | "gpai" | "transparency_only" | "unsure";
export type DeadlineConfidence = "official_journal" | "convergent_secondary";

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
  likelihood: "baseline" | "in-force" | "contingent" | "interpretive";
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
  confidenceLevel: DeadlineConfidence;
  scenarios: Scenario[];
  divergences: DivergencePoint[];
  robustActions: string[];
  caveat: string;
}

// Article 27 FRIA does not cover all of Annex III. It applies to bodies governed
// by public law, private entities providing public services, and deployers of
// Annex III(5)(b) creditworthiness and (5)(c) life/health insurance systems.
const FRIA_ALWAYS_IN_SCOPE = new Set(["essential"]);

// ── Deadline resolution (sourced, deterministic) ────────────────
function resolveDeadline(
  nature: SystemNature,
  annexArea: string,
): { agreed: string; original: string; note: string; confidence: DeadlineConfidence } {
  if (nature === "transparency_only") {
    return {
      agreed: "2 August 2026 (in application)",
      original: "2 August 2026",
      note: "Article 50 transparency obligations applied from 2 August 2026 and were NOT deferred by the Omnibus. Only the Article 50(2) machine-readable marking requirement carries a grace period to 2 December 2026, and only for systems already placed on the market before 2 August 2026. New systems comply on placement.",
      confidence: "convergent_secondary",
    };
  }
  if (nature === "embedded_product") {
    return {
      agreed: "2 August 2028",
      original: "2 August 2026",
      note: "High-risk AI embedded as a safety component of a regulated product (Annex I) applies from 2 August 2028 under Regulation (EU) 2026/1744. This is a fixed calendar date.",
      confidence: "convergent_secondary",
    };
  }
  if (nature === "gpai") {
    return {
      agreed: "Already applicable (since 2 August 2025)",
      original: "2 August 2025",
      note: "GPAI model obligations, including systemic-risk models under Article 51, have been in application since 2 August 2025 and were not deferred.",
      confidence: "official_journal",
    };
  }
  if (nature === "standalone" && annexArea !== "none") {
    return {
      agreed: "2 December 2027",
      original: "2 August 2026",
      note: "Stand-alone Annex III high-risk obligations, including Article 26 deployer duties and the Article 27 FRIA where it applies, run from 2 December 2027. High-risk systems already in use by public authorities before that date have until 2 August 2030.",
      confidence: "convergent_secondary",
    };
  }
  return {
    agreed: "Depends on classification",
    original: "2 August 2026",
    note: "If the system is not Annex III high-risk, core high-risk obligations may not apply. Article 50 transparency may still apply, and Article 4 on AI literacy applies in its form as amended by the Omnibus.",
    confidence: "convergent_secondary",
  };
}

export function runScenarioEngine(input: ScenarioInput): ScenarioResult {
  const { nature, annexArea, role } = input;
  const dl = resolveDeadline(nature, annexArea);
  const isHighRisk = nature === "standalone" && annexArea !== "none";
  const friaClearlyInScope = isHighRisk && FRIA_ALWAYS_IN_SCOPE.has(annexArea);

  const scenarios: Scenario[] = [];

  // Scenario A — the enacted baseline
  scenarios.push({
    id: "in_force",
    label: "Enacted timeline (Regulation (EU) 2026/1744)",
    trigger: "The Digital Omnibus on AI entered into force on 27 July 2026, amending the application dates in Article 113 of the AI Act. These are fixed calendar dates.",
    likelihood: "in-force",
    deadline: dl.agreed,
    deadlineNote: dl.note,
    exposure: "This is the operative timeline, not a projection. The AI Act remains in force throughout: Article 5 prohibitions and Article 4 on AI literacy already apply, and the deferral of high-risk obligations is not a pause on governance.",
    sourceIds: ["oj", "aiact", "ec"],
  });

  // Scenario B — Article 27 FRIA scope
  if (isHighRisk) {
    scenarios.push({
      id: "fria_scope",
      label: friaClearlyInScope
        ? "Article 27 FRIA applies to your deployment"
        : "Article 27 FRIA scope is unsettled for your deployment",
      trigger: friaClearlyInScope
        ? "Annex III(5) covers essential public and private services. Deployers of creditworthiness systems under (5)(b) and life or health insurance pricing systems under (5)(c) are expressly named in Article 27, alongside bodies governed by public law and private entities providing public services."
        : "Article 27 does not cover every Annex III deployment. It reaches bodies governed by public law, private entities providing public services, and deployers of Annex III(5)(b) and (5)(c) systems. Whether your deployment falls inside depends on your legal status and on whether your activity qualifies as a public service.",
      likelihood: "interpretive",
      deadline: dl.agreed,
      deadlineNote: "Scope, not calendar, is the variable here. A deployment held to be a public service acquires the full FRIA obligation on the same date.",
      exposure: friaClearlyInScope
        ? "High and determinate: the FRIA is a documented precondition to deployment, not a filing. Absence of one is directly observable by a supervisory authority."
        : "Depends on characterisation. Preparing a FRIA where the obligation is arguable costs far less than being held to one without a record.",
      sourceIds: ["aiact", "ec"],
    });
  }

  // Scenario C — Strict national interpretation
  scenarios.push({
    id: "strict",
    label: "Strict national interpretation",
    trigger: `A protective supervisory authority reads borderline scope expansively, pulling your system into Annex III${annexArea === "none" ? " despite an arguable exemption" : ""}.`,
    likelihood: "interpretive",
    deadline: dl.agreed,
    deadlineNote: "Classification, not calendar, is the risk here. A stricter reading can reclassify a system you believed was out of scope.",
    exposure: "Medium-high: reclassification means the full high-risk obligation stack applies. The cost is the gap between what you prepared for and what is then required.",
    sourceIds: ["ec", "aesia"],
  });

  // Scenario D — Pro-innovation / sandbox
  scenarios.push({
    id: "proinnovation",
    label: "Pro-innovation / sandbox path",
    trigger: "You operate within a regulatory sandbox (Art. 57-61) or a Member State applies the AI Act's SME and innovation measures (Art. 62).",
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
        { stance: "Vendor certification is largely sufficient", basis: "A common assumption among mid-market deployers, flagged by IAPP as the single most frequent and dangerous misconception.", weight: "minority" },
      ],
    });

    divergences.push({
      question: "Who exactly must carry out an Article 27 FRIA?",
      positions: [
        { stance: "Only the categories named in Article 27", basis: "Bodies governed by public law, private entities providing public services, and deployers of Annex III(5)(b) and (5)(c) systems. A literal reading of the enacting terms.", weight: "majority" },
        { stance: "Any Annex III deployer in practice", basis: "Some authorities and civil society read the fundamental-rights logic of the AI Act as extending beyond the named categories, particularly where a private deployment performs a function citizens cannot avoid.", weight: "contested" },
      ],
    });
  }

  if (annexArea === "none") {
    divergences.push({
      question: "Is the system actually outside Annex III?",
      positions: [
        { stance: "Out of scope", basis: "If the use case matches none of the Annex III areas and no exception is misapplied.", weight: "contested" },
        { stance: "In scope on a broad reading", basis: "Borderline functions (profiling, scoring, decision-support) are frequently reclassified by protective authorities.", weight: "contested" },
      ],
    });
  }

  // Robust actions — valuable regardless of classification
  const robustActions = [
    "Review your Article 4 AI-literacy measures against the provision as amended by the Omnibus, which frames it as taking measures to support the development of AI literacy rather than guaranteeing a level of it.",
    isHighRisk
      ? "Build your own Article 26 deployer evidence file. Do not rely on the provider's conformity assessment alone."
      : "Document your classification reasoning so a 'not high-risk' position is defensible if challenged.",
    friaClearlyInScope
      ? "Start the Fundamental Rights Impact Assessment now. It is a precondition to deployment for your category, and the record is what a supervisory authority will look for."
      : "Run a Fundamental Rights Impact Assessment even where the obligation is arguable. It is the cheapest evidence you can hold if your characterisation is challenged.",
    "Map your system against the AESIA practical guides as a concrete public starting point.",
    nature === "transparency_only" || nature === "standalone"
      ? "Article 50 transparency already applies. If your system was placed on the market before 2 August 2026, the Article 50(2) marking grace period runs to 2 December 2026."
      : "Track whether your product falls under Annex I safety law, which carries the later 2 August 2028 date.",
  ];

  return {
    headline: isHighRisk
      ? `Your stand-alone Annex III system falls under the enacted deadline of ${dl.agreed}.`
      : `Your system's timeline depends on classification: ${dl.agreed}.`,
    personalDeadline: dl.agreed,
    deadlineConfidence:
      dl.confidence === "official_journal"
        ? "Confirmed against the Official Journal. Regulation (EU) 2026/1744, in force since 27 July 2026."
        : "Regulation (EU) 2026/1744 is in force since 27 July 2026 (confirmed at EUR-Lex). This specific date rests on convergent reporting of the enacted text rather than a direct reading of the consolidated Article 113. Verify against the consolidated text before reliance.",
    confidenceLevel: dl.confidence,
    scenarios,
    divergences,
    robustActions,
    caveat: "This is regulatory scenario intelligence, not legal advice. Every scenario is grounded in cited public sources and reflects the position as of 24 August 2026. A qualified professional should validate any decision before you act on it.",
  };
}
