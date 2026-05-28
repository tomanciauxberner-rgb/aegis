// ═══════════════════════════════════════════════════════════════
// AI Act Knowledge Base — structured, sourced regulatory facts.
// This is the FACTUAL SUBSTRATE the reasoning engine reasons over.
// Every entry is grounded in a cited source. The engine may reason
// over these facts but must NOT invent regulatory content beyond them.
// Verified May 2026 against primary sources + Commission guidelines
// of 19 May 2026.
// ═══════════════════════════════════════════════════════════════

export interface SourceRef {
  id: string;
  label: string;
  url: string;
}

export const KB_SOURCES: SourceRef[] = [
  { id: "aiact_art6", label: "AI Act Article 6 — Classification rules", url: "https://artificialintelligenceact.eu/article/6/" },
  { id: "aiact_annex3", label: "AI Act Annex III — High-risk use cases", url: "https://artificialintelligenceact.eu/annex/3/" },
  { id: "ec_guidelines_2026", label: "Commission Guidelines on high-risk classification (19 May 2026)", url: "https://www.dataprotectionreport.com/2026/05/is-my-use-case-a-high-risk-ai-system-applying-the-commissions-guidelines-and-next-steps/" },
  { id: "omnibus_wc", label: "White & Case — Digital Omnibus deal", url: "https://www.whitecase.com/insight-alert/eu-agrees-digital-omnibus-deal-simplify-ai-rules" },
  { id: "omnibus_gibson", label: "Gibson Dunn — Omnibus postponed deadlines", url: "https://www.gibsondunn.com/eu-ai-act-omnibus-agreement-postponed-high-risk-deadlines-and-other-key-changes/" },
  { id: "iapp_deployer", label: "IAPP — Deployer evidence gaps", url: "https://iapp.org/news/a/eu-ai-act-deployer-evidence-gaps-smes-will-miss-before-2-aug-2026" },
  { id: "aiact_art26", label: "AI Act Article 26 — Deployer obligations", url: "https://artificialintelligenceact.eu/article/26/" },
  { id: "aiact_art50", label: "AI Act Article 50 — Transparency obligations", url: "https://artificialintelligenceact.eu/article/50/" },
];

// ── ANNEX III — the eight high-risk areas ───────────────────────
export interface AnnexIIICategory {
  code: string;
  point: string;
  label: string;
  scope: string;
  examples: string[];
  notableNuances: string[];
  sourceIds: string[];
}

export const ANNEX_III_KB: AnnexIIICategory[] = [
  {
    code: "biometrics", point: "Annex III(1)", label: "Biometrics",
    scope: "Remote biometric identification, biometric categorisation according to sensitive attributes, and emotion recognition — to the extent permitted (some uses are outright prohibited under Article 5).",
    examples: ["Remote biometric identification systems", "Biometric categorisation by sensitive/protected attributes", "Emotion recognition systems"],
    notableNuances: [
      "Biometric verification whose sole purpose is to confirm a person is who they claim to be is excluded from this point.",
      "Emotion recognition in workplaces and educational institutions is PROHIBITED under Article 5, not merely high-risk.",
    ],
    sourceIds: ["aiact_annex3", "ec_guidelines_2026"],
  },
  {
    code: "critical_infra", point: "Annex III(2)", label: "Critical infrastructure",
    scope: "AI as a safety component in the management and operation of critical digital infrastructure, road traffic, or supply of water, gas, heating, electricity.",
    examples: ["Safety components for power grid management", "Water supply control systems", "Road-traffic safety management"],
    notableNuances: ["The system must be a safety component; administrative or billing tools attached to infrastructure are typically out of scope."],
    sourceIds: ["aiact_annex3"],
  },
  {
    code: "education", point: "Annex III(3)", label: "Education & vocational training",
    scope: "Access/admission decisions, evaluation of learning outcomes, assessment of appropriate education level, and monitoring/detecting prohibited behaviour during tests.",
    examples: ["Admission or assignment scoring", "Automated exam grading", "Reading-ability assessment for children", "Proctoring / cheating detection"],
    notableNuances: [
      "Systems assessing children's abilities are a focus of FRA's December 2025 high-risk report.",
      "Evaluation of learning outcomes that materially influences a learner's path is squarely in scope.",
    ],
    sourceIds: ["aiact_annex3", "ec_guidelines_2026"],
  },
  {
    code: "employment", point: "Annex III(4)", label: "Employment & worker management",
    scope: "Recruitment/selection (targeted ads, screening, evaluating candidates), and decisions on terms, promotion, termination, task allocation, and monitoring/evaluating performance.",
    examples: ["CV-screening / candidate ranking", "Interview-analysis tools", "Promotion or termination decision support", "Worker performance monitoring"],
    notableNuances: [
      "Recruitment systems that rank or score candidates almost always involve profiling — which forecloses the Article 6(3) exception.",
      "The largest deployer volume of any Annex III area; deployer evidence gaps (Art. 26) are widest here per IAPP.",
    ],
    sourceIds: ["aiact_annex3", "iapp_deployer"],
  },
  {
    code: "essential", point: "Annex III(5)", label: "Essential private & public services",
    scope: "Eligibility for public assistance/benefits, creditworthiness/credit scoring, risk assessment and pricing in life & health insurance, and emergency-call dispatching/triage.",
    examples: ["Credit scoring / creditworthiness", "Benefits eligibility determination", "Insurance risk pricing (life/health)", "Emergency dispatch prioritisation"],
    notableNuances: [
      "Credit scoring is explicitly named; fraud-detection in financial services is a noted exception in some readings.",
      "These systems evaluate individuals and typically involve profiling — exception rarely available.",
    ],
    sourceIds: ["aiact_annex3", "ec_guidelines_2026"],
  },
  {
    code: "law_enforcement", point: "Annex III(6)", label: "Law enforcement",
    scope: "Risk assessment of individuals (offending/re-offending or victimhood), polygraph-type tools, evidence reliability evaluation, and profiling in the course of detection/investigation.",
    examples: ["Individual risk-of-offending assessment", "Evidence-reliability evaluation", "Investigative profiling"],
    notableNuances: ["Predictive policing based SOLELY on profiling is PROHIBITED under Article 5, not merely high-risk."],
    sourceIds: ["aiact_annex3", "ec_guidelines_2026"],
  },
  {
    code: "migration", point: "Annex III(7)", label: "Migration, asylum & border control",
    scope: "Polygraph-type tools, risk assessments of persons entering, assistance in examining asylum/visa applications, and detection/recognition of persons in border management.",
    examples: ["Visa/asylum application assessment support", "Border risk assessment", "Identity/document verification in migration"],
    notableNuances: ["A politically sensitive area; supervisory scrutiny is high."],
    sourceIds: ["aiact_annex3"],
  },
  {
    code: "justice", point: "Annex III(8)", label: "Justice & democratic processes",
    scope: "Assisting a judicial authority in researching/interpreting facts and law and applying it, and influencing the outcome of elections/referenda or voting behaviour.",
    examples: ["Judicial decision-support / legal research applied to a case", "Systems influencing voting behaviour"],
    notableNuances: ["Tools used purely for administrative/ancillary court tasks are generally out of scope."],
    sourceIds: ["aiact_annex3"],
  },
];

// ── ARTICLE 6(3) — the exception filter ─────────────────────────
export const ARTICLE_6_3 = {
  principle: "An Annex III system is NOT high-risk where it does not pose a significant risk of harm to health, safety or fundamental rights, including by not materially influencing the outcome of decision-making.",
  conditions: [
    { code: "a", label: "Narrow procedural task", note: "Performs a narrow, clearly-defined procedural task (e.g. sorting documents by format)." },
    { code: "b", label: "Improve a completed human activity", note: "Merely improves the result of a previously completed human activity (e.g. polishing tone/style); must not change the outcome, rights, or legal/economic position of those affected." },
    { code: "c", label: "Detect patterns / deviations", note: "Detects decision-making patterns or deviations, NOT meant to replace or influence the human assessment without proper human review." },
    { code: "d", label: "Preparatory task", note: "Performs a preparatory task to an assessment (e.g. indexing, search, translation) before the actual assessment process." },
  ],
  hardRule: "NOTWITHSTANDING any condition, a system is ALWAYS high-risk if it performs profiling of natural persons (automated processing of personal data to evaluate, analyse or predict personal aspects). Correct GDPR profiling classification must precede AI Act classification.",
  interpretation: [
    "The Commission Guidelines of 19 May 2026 state the four derogations must be interpreted NARROWLY.",
    "Human oversight does NOT remove a system from scope — it is a compliance requirement (Art. 14), not an exception.",
    "Splitting a high-risk function into modules to fit each into a filter condition does NOT work; modules serving a high-risk use case are assessed as one system.",
    "A provider claiming the exception must document the assessment (Art. 6(4)) and still register the system (Art. 49(2)).",
  ],
  sourceIds: ["aiact_art6", "ec_guidelines_2026"],
};

// ── OMNIBUS DEADLINES (agreed 7 May 2026, pending adoption) ──────
export const OMNIBUS_DEADLINES = {
  status: "Provisional political agreement reached 7 May 2026, confirmed by Council 13 May 2026. NOT yet formally adopted/published. Until publication in the Official Journal, the original 2 Aug 2026 high-risk deadline remains legally operative.",
  byCategory: {
    standalone_annex3: { agreed: "2 December 2027", original: "2 August 2026", note: "Stand-alone Annex III high-risk systems deferred ~16 months." },
    embedded_annex1: { agreed: "2 August 2028", original: "2 August 2026", note: "High-risk AI embedded as a safety component of a regulated product." },
    transparency_art50: { agreed: "2 December 2026", original: "2 August 2026", note: "Art. 50 transparency / watermarking — 3-month grace period." },
    gpai: { agreed: "Already applicable (2 Aug 2025)", original: "2 August 2025", note: "GPAI model obligations not deferred." },
    prohibitions_art5: { agreed: "Already applicable (2 Feb 2025)", original: "2 February 2025", note: "Art. 5 prohibitions + Art. 4 AI-literacy already in force; Omnibus adds CSAM/nudifier bans." },
  },
  sourceIds: ["omnibus_wc", "omnibus_gibson"],
};

// ── ARTICLE 26 — deployer obligations (evidence gaps) ────────────
export const DEPLOYER_OBLIGATIONS_ART26 = {
  summary: "Article 26 imposes obligations on DEPLOYERS that are distinct from provider obligations. Vendor CE-marking / conformity assessment is NOT a substitute for the deployer's own evidence.",
  duties: [
    "Use the system in accordance with the provider's instructions for use.",
    "Assign human oversight to competent, trained persons (Art. 26(2)).",
    "Ensure input data is relevant and sufficiently representative for the intended purpose (where the deployer controls it).",
    "Monitor operation and inform the provider/authority of risks or serious incidents.",
    "Keep automatically generated logs where under the deployer's control.",
    "Inform affected workers / their representatives before putting a high-risk system into service at work.",
    "Where applicable, carry out a Fundamental Rights Impact Assessment (Art. 27) before deployment.",
  ],
  commonGap: "IAPP flags the most frequent and dangerous misconception: deployers assuming vendor certification covers them. It does not — the deployer must hold its own documented evidence.",
  sourceIds: ["aiact_art26", "iapp_deployer"],
};

// ── ARTICLE 50 — transparency ───────────────────────────────────
export const TRANSPARENCY_ART50 = {
  summary: "Article 50 imposes transparency duties regardless of high-risk status, depending on the system type.",
  triggers: [
    "Systems interacting directly with people must disclose they are AI (unless obvious).",
    "Providers of systems generating synthetic audio/image/video/text must mark outputs as artificially generated (machine-readable).",
    "Deployers of emotion-recognition or biometric categorisation must inform exposed persons.",
    "Deployers generating deep fakes or AI text on matters of public interest must disclose it.",
  ],
  deadline: "Marking obligations apply from 2 December 2026 under the Omnibus (3-month grace).",
  sourceIds: ["aiact_art50", "omnibus_wc"],
};

// Compact serialisation for the reasoning prompt (token-efficient).
export function buildKnowledgeContext(): string {
  const annex = ANNEX_III_KB.map((c) =>
    `${c.point} ${c.label}: ${c.scope} Nuances: ${c.notableNuances.join(" ")}`
  ).join("\n");

  const ex = `Article 6(3) exception. ${ARTICLE_6_3.principle} Conditions (any one, interpreted narrowly): ${ARTICLE_6_3.conditions.map((c) => `(${c.code}) ${c.label} — ${c.note}`).join(" ")} HARD RULE: ${ARTICLE_6_3.hardRule} ${ARTICLE_6_3.interpretation.join(" ")}`;

  const dl = `Omnibus deadlines (${OMNIBUS_DEADLINES.status}). ` +
    Object.entries(OMNIBUS_DEADLINES.byCategory).map(([k, v]) => `${k}: agreed ${v.agreed} (was ${v.original}) — ${v.note}`).join(" ");

  const dep = `Article 26 deployer duties: ${DEPLOYER_OBLIGATIONS_ART26.summary} Duties: ${DEPLOYER_OBLIGATIONS_ART26.duties.join("; ")}. Common gap: ${DEPLOYER_OBLIGATIONS_ART26.commonGap}`;

  const tr = `Article 50 transparency: ${TRANSPARENCY_ART50.summary} Triggers: ${TRANSPARENCY_ART50.triggers.join("; ")}. Deadline: ${TRANSPARENCY_ART50.deadline}`;

  return `=== ANNEX III HIGH-RISK AREAS ===\n${annex}\n\n=== ARTICLE 6(3) EXCEPTION ===\n${ex}\n\n=== OMNIBUS DEADLINES ===\n${dl}\n\n=== ARTICLE 26 DEPLOYER ===\n${dep}\n\n=== ARTICLE 50 TRANSPARENCY ===\n${tr}`;
}
