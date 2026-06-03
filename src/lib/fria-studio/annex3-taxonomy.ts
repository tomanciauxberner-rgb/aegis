/**
 * Annex III AI Act — complete taxonomy for FRIA Studio.
 * Each domain maps to: fundamental rights, legal obligations,
 * vulnerable populations, and prohibited-use triggers.
 * Every reference is sourced to a specific article or instrument.
 */

export type RiskLevel = "unacceptable" | "high" | "limited" | "minimal";
export type LegalForce = "binding" | "interpretive" | "best_practice";

export interface LegalRef {
  instrument: string;
  article: string;
  label: string;
  force: LegalForce;
}

export interface FundamentalRight {
  code: string;
  label: string;
  charter?: string;
  echr?: string;
  description: string;
}

export interface VulnerablePopulation {
  code: string;
  label: string;
  rationale: string;
}

export interface ProhibitedTrigger {
  code: string;
  label: string;
  article: string;
  description: string;
}

export interface Annex3Domain {
  code: string;
  annexRef: string;
  label: string;
  description: string;
  defaultRiskLevel: RiskLevel;
  fundamentalRights: FundamentalRight[];
  legalRefs: LegalRef[];
  vulnerablePopulations: VulnerablePopulation[];
  prohibitedTriggers: ProhibitedTrigger[];
  exampleSystems: string[];
}

export const FUNDAMENTAL_RIGHTS: Record<string, FundamentalRight> = {
  human_dignity: {
    code: "human_dignity",
    label: "Human dignity",
    charter: "Art. 1",
    echr: "Art. 3",
    description: "Inviolable dignity of the person; no system may treat a person as mere data.",
  },
  privacy: {
    code: "privacy",
    label: "Right to privacy",
    charter: "Art. 7",
    echr: "Art. 8",
    description: "Respect for private and family life, home and communications.",
  },
  data_protection: {
    code: "data_protection",
    label: "Personal data protection",
    charter: "Art. 8",
    description: "Right to protection of personal data, purpose limitation, access and rectification.",
  },
  non_discrimination: {
    code: "non_discrimination",
    label: "Non-discrimination & equality",
    charter: "Art. 21",
    echr: "Art. 14",
    description: "Prohibition of discrimination on any ground.",
  },
  fair_trial: {
    code: "fair_trial",
    label: "Right to a fair trial",
    charter: "Art. 47",
    echr: "Art. 6",
    description: "Effective judicial protection and fair hearing.",
  },
  presumption_innocence: {
    code: "presumption_innocence",
    label: "Presumption of innocence",
    charter: "Art. 48",
    echr: "Art. 6(2)",
    description: "Everyone is presumed innocent until proven guilty.",
  },
  freedom_expression: {
    code: "freedom_expression",
    label: "Freedom of expression",
    charter: "Art. 11",
    echr: "Art. 10",
    description: "Freedom to hold opinions and receive and impart information.",
  },
  freedom_movement: {
    code: "freedom_movement",
    label: "Freedom of movement",
    charter: "Art. 45",
    description: "Right to move and reside freely within the EU.",
  },
  asylum: {
    code: "asylum",
    label: "Right to asylum",
    charter: "Art. 18",
    description: "Right to asylum in accordance with the Geneva Convention.",
  },
  work: {
    code: "work",
    label: "Right to work & fair conditions",
    charter: "Art. 15–16, 31",
    description: "Freedom to work, right to fair working conditions.",
  },
  social_security: {
    code: "social_security",
    label: "Social security & assistance",
    charter: "Art. 34",
    description: "Right to social security benefits and social assistance.",
  },
  healthcare: {
    code: "healthcare",
    label: "Right to healthcare",
    charter: "Art. 35",
    description: "Right to preventive healthcare and medical treatment.",
  },
  education: {
    code: "education",
    label: "Right to education",
    charter: "Art. 14",
    description: "Right to education and to access vocational and continuing training.",
  },
  child_rights: {
    code: "child_rights",
    label: "Rights of the child",
    charter: "Art. 24",
    description: "Best interests of the child as a primary consideration.",
  },
  disability_rights: {
    code: "disability_rights",
    label: "Rights of persons with disabilities",
    charter: "Art. 26",
    description: "Right to integration and participation in community life.",
  },
  effective_remedy: {
    code: "effective_remedy",
    label: "Right to an effective remedy",
    charter: "Art. 47",
    echr: "Art. 13",
    description: "Right to an effective remedy before a tribunal.",
  },
  liberty: {
    code: "liberty",
    label: "Right to liberty and security",
    charter: "Art. 6",
    echr: "Art. 5",
    description: "Protection against arbitrary detention or restriction of movement.",
  },
};

export const ANNEX3_DOMAINS: Annex3Domain[] = [
  {
    code: "biometric",
    annexRef: "Annex III(1)",
    label: "Biometric identification & categorisation",
    description: "Remote biometric identification systems in public spaces; emotion recognition; biometric categorisation inferred from protected attributes.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.data_protection,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.human_dignity,
      FUNDAMENTAL_RIGHTS.freedom_expression,
      FUNDAMENTAL_RIGHTS.freedom_movement,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Art. 5(1)(h)", label: "Real-time RBI in public spaces for law enforcement — conditional prohibition", force: "binding" },
      { instrument: "AI Act", article: "Annex III(1)", label: "High-risk: remote biometric ID, biometric categorisation, emotion recognition", force: "binding" },
      { instrument: "AI Act", article: "Art. 5(1)(f)–(g)", label: "Prohibited: workplace/education emotion recognition; sensitive-attribute categorisation", force: "binding" },
      { instrument: "GDPR", article: "Art. 9", label: "Special category data — biometric data", force: "binding" },
      { instrument: "EU Charter", article: "Art. 7–8", label: "Privacy and data protection", force: "binding" },
      { instrument: "CJEU", article: "C-311/18 (Schrems II)", label: "Biometric data transfer safeguards", force: "interpretive" },
    ],
    vulnerablePopulations: [
      { code: "ethnic_minorities", label: "Ethnic and racial minorities", rationale: "Higher false positive rates documented in facial recognition for darker skin tones (NIST FRVT)." },
      { code: "women", label: "Women", rationale: "Gender-based misclassification bias in commercial systems." },
      { code: "migrants", label: "Migrants and asylum seekers", rationale: "Disproportionate targeting in border/law enforcement contexts." },
      { code: "protesters", label: "Protesters and activists", rationale: "Chilling effect on freedom of assembly and expression." },
    ],
    prohibitedTriggers: [
      { code: "realtime_rbi_public", label: "Real-time RBI in publicly accessible spaces for law enforcement", article: "Art. 5(1)(h)", description: "Prohibited except for exhaustive 5(1)(h)(i)–(iii) objectives, subject to the Art. 5(2)–(7) authorisation regime." },
      { code: "emotion_recognition_work", label: "Emotion recognition in workplace or education", article: "Art. 5(1)(f)", description: "Prohibited except where intended for medical or safety reasons." },
      { code: "biometric_categorisation_protected", label: "Biometric categorisation inferring race, political opinion, religion, sexual orientation", article: "Art. 5(1)(g)", description: "Prohibited; does not cover labelling/filtering of lawfully acquired datasets." },
    ],
    exampleSystems: [
      "Facial recognition at transit hubs",
      "Emotion analysis in call centres",
      "Workplace attendance via biometrics",
      "Retail crowd analytics",
    ],
  },
  {
    code: "critical_infrastructure",
    annexRef: "Annex III(2)",
    label: "Critical infrastructure management",
    description: "AI systems managing safety components of critical infrastructure: energy, water, transport, digital infrastructure.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.human_dignity,
      FUNDAMENTAL_RIGHTS.healthcare,
      FUNDAMENTAL_RIGHTS.liberty,
      FUNDAMENTAL_RIGHTS.social_security,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(2)", label: "High-risk: safety components of critical infrastructure", force: "binding" },
      { instrument: "NIS2", article: "Art. 21", label: "Cybersecurity risk management for critical entities", force: "binding" },
      { instrument: "CRA", article: "Art. 13", label: "Vulnerability handling for connected products", force: "binding" },
      { instrument: "AI Act", article: "Art. 9", label: "Risk management system obligation", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "elderly", label: "Elderly persons", rationale: "Heightened dependence on healthcare and utility infrastructure." },
      { code: "disabled", label: "Persons with disabilities", rationale: "Disproportionate impact of infrastructure failures." },
      { code: "low_income", label: "Low-income households", rationale: "Limited capacity to absorb energy or water supply disruptions." },
    ],
    prohibitedTriggers: [],
    exampleSystems: [
      "Smart grid load balancing AI",
      "Water treatment anomaly detection",
      "Air traffic control decision support",
      "Railway switch management",
    ],
  },
  {
    code: "education",
    annexRef: "Annex III(3)",
    label: "Education & vocational training",
    description: "Per Annex III(3): AI determining access/admission to educational institutions; evaluating learning outcomes (incl. steering the learning process); assessing the appropriate level of education a person will receive; and monitoring/detecting prohibited behaviour of students during tests.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.education,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.child_rights,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.data_protection,
      FUNDAMENTAL_RIGHTS.human_dignity,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(3)", label: "High-risk: educational access, performance assessment, behaviour detection", force: "binding" },
      { instrument: "AI Act", article: "Art. 5(1)(b)", label: "Prohibited: exploiting vulnerabilities of age", force: "binding" },
      { instrument: "GDPR", article: "Art. 8", label: "Age of consent for information society services (13–16 per Member State)", force: "binding" },
      { instrument: "UN CRC", article: "Art. 3", label: "Best interests of the child — primary consideration", force: "interpretive" },
      { instrument: "EU Charter", article: "Art. 24", label: "Rights of the child", force: "binding" },
      { instrument: "DSA", article: "Art. 28", label: "Minors protection on platforms", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "children", label: "Children (all age bands)", rationale: "Developmental vulnerability; data collected in childhood persists." },
      { code: "learning_disabilities", label: "Students with learning disabilities", rationale: "Risk of systematic under-scoring; bias in behavioural detection." },
      { code: "ethnic_minorities", label: "Ethnic minority students", rationale: "Documented bias in predictive analytics and behavioural monitoring." },
      { code: "low_income_students", label: "Students from low-income households", rationale: "Digital divide affects algorithmic performance equity." },
    ],
    prohibitedTriggers: [
      { code: "exploit_age_vulnerability", label: "Exploiting vulnerabilities of age or disability", article: "Art. 5(1)(b)", description: "Prohibited: exploiting vulnerabilities due to age, disability or socio-economic situation to materially distort behaviour causing significant harm." },
    ],
    exampleSystems: [
      "Automated admission scoring",
      "Proctoring and cheating detection",
      "Adaptive learning platforms with behavioural profiling",
      "Dropout prediction systems",
    ],
  },
  {
    code: "employment",
    annexRef: "Annex III(4)",
    label: "Employment & workforce management",
    description: "AI for recruitment, selection, promotion, task allocation, monitoring and performance evaluation of workers.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.work,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.data_protection,
      FUNDAMENTAL_RIGHTS.human_dignity,
      FUNDAMENTAL_RIGHTS.freedom_expression,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(4)", label: "High-risk: recruitment, promotion, task allocation, monitoring", force: "binding" },
      { instrument: "GDPR", article: "Art. 22", label: "Right not to be subject to solely automated decisions", force: "binding" },
      { instrument: "GDPR", article: "Art. 9", label: "Special category data in employment", force: "binding" },
      { instrument: "EU Directive", article: "2006/54/EC Art. 2", label: "Equal treatment in employment — indirect discrimination", force: "binding" },
      { instrument: "AI Act", article: "Art. 9", label: "Risk management system including bias testing", force: "binding" },
      { instrument: "AI Act", article: "Art. 12", label: "Logging obligations for recruitment AI", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "women", label: "Women", rationale: "Training data encoding historical hiring bias; documented cases in CV screening." },
      { code: "ethnic_minorities", label: "Ethnic minorities", rationale: "Name-based and proxy discrimination in automated screening." },
      { code: "older_workers", label: "Older workers (50+)", rationale: "Age proxies in performance scoring algorithms." },
      { code: "disabled_workers", label: "Workers with disabilities", rationale: "Monitoring systems may penalise disability-related work patterns." },
      { code: "gig_workers", label: "Platform/gig workers", rationale: "Algorithmic management without transparency or recourse." },
    ],
    prohibitedTriggers: [],
    exampleSystems: [
      "CV screening and ranking",
      "Video interview analysis",
      "Productivity monitoring and scoring",
      "Promotion recommendation engines",
      "Emotion detection in workplace",
    ],
  },
  {
    code: "essential_services",
    annexRef: "Annex III(5)",
    label: "Essential private & public services",
    description: "AI systems evaluating creditworthiness, setting insurance premiums, granting public benefits, or assessing emergency response priority.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.social_security,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.data_protection,
      FUNDAMENTAL_RIGHTS.effective_remedy,
      FUNDAMENTAL_RIGHTS.human_dignity,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(5)", label: "High-risk: creditworthiness, insurance pricing, social benefits, emergency dispatch", force: "binding" },
      { instrument: "GDPR", article: "Art. 22", label: "Right not to be subject to solely automated decisions with legal effect", force: "binding" },
      { instrument: "CRD IV", article: "Art. 18", label: "Credit assessment transparency", force: "binding" },
      { instrument: "EU Charter", article: "Art. 34", label: "Social security and assistance", force: "binding" },
      { instrument: "AI Act", article: "Art. 14", label: "Human oversight — mandatory for decisions on natural persons", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "roma", label: "Roma and Travellers", rationale: "Proxy discrimination via postcode or informal employment patterns." },
      { code: "ethnic_minorities", label: "Ethnic minorities", rationale: "Documented redlining patterns in credit and insurance AI." },
      { code: "low_income", label: "Low-income households", rationale: "Feedback loops: denied credit → lower score → denied again." },
      { code: "single_parents", label: "Single parents", rationale: "Disproportionate denial in benefit eligibility scoring." },
      { code: "disabled", label: "Persons with disabilities", rationale: "Disability-correlated proxies affecting insurance and benefit AI." },
    ],
    prohibitedTriggers: [
      { code: "social_scoring", label: "Social scoring leading to detrimental treatment", article: "Art. 5(1)(c)", description: "Prohibited: evaluating/classifying persons over time based on social behaviour or personal traits, leading to detrimental treatment in unrelated contexts or that is unjustified/disproportionate." },
    ],
    exampleSystems: [
      "Automated credit scoring",
      "Algorithmic insurance pricing",
      "Welfare benefit eligibility AI",
      "Emergency response triage algorithm",
    ],
  },
  {
    code: "law_enforcement",
    annexRef: "Annex III(6)",
    label: "Law enforcement",
    description: "AI for individual risk assessment, polygraph, crime analytics, facial recognition, evidence evaluation in criminal proceedings.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.presumption_innocence,
      FUNDAMENTAL_RIGHTS.fair_trial,
      FUNDAMENTAL_RIGHTS.liberty,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.effective_remedy,
      FUNDAMENTAL_RIGHTS.human_dignity,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(6)", label: "High-risk: individual risk assessment, crime analytics, evidence evaluation", force: "binding" },
      { instrument: "AI Act", article: "Art. 5(1)(h)", label: "Real-time RBI — conditional prohibition for law enforcement", force: "binding" },
      { instrument: "EU Charter", article: "Art. 47–48", label: "Fair trial and presumption of innocence", force: "binding" },
      { instrument: "LED", article: "Art. 11", label: "Automated processing in law enforcement", force: "binding" },
      { instrument: "ECHR", article: "Art. 6", label: "Right to a fair trial", force: "binding" },
      { instrument: "ECHR", article: "Art. 5", label: "Right to liberty", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "ethnic_minorities", label: "Ethnic minorities", rationale: "Documented over-policing and false positive bias in predictive policing tools." },
      { code: "migrants", label: "Migrants and asylum seekers", rationale: "Disproportionate targeting in border/immigration enforcement AI." },
      { code: "youth", label: "Young people", rationale: "Risk assessment tools applied to minors have heightened rights implications." },
      { code: "homeless", label: "Homeless persons", rationale: "Spatial data proxies in crime prediction disproportionately affect homeless populations." },
    ],
    prohibitedTriggers: [
      { code: "realtime_rbi_le", label: "Real-time RBI for law enforcement without authorisation", article: "Art. 5(1)(h)", description: "Permitted only for exhaustive objectives in 5(1)(h)(i)–(iii) under the Art. 5(2)–(7) authorisation regime." },
      { code: "predictive_policing_individual", label: "Criminal risk prediction based solely on profiling", article: "Art. 5(1)(d)", description: "Prohibited: assessing the risk of a person committing an offence based solely on profiling or personality traits." },
    ],
    exampleSystems: [
      "Recidivism risk scoring",
      "Predictive policing platforms",
      "Lie detection / polygraph AI",
      "Automated evidence analysis",
    ],
  },
  {
    code: "migration",
    annexRef: "Annex III(7)",
    label: "Migration, asylum & border control",
    description: "Per Annex III(7): polygraphs; risk assessment (security, irregular migration, health) of persons entering a Member State; assistance in examining asylum/visa/residence applications and associated complaints; detection, recognition or identification of persons (except verification of travel documents).",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.asylum,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.human_dignity,
      FUNDAMENTAL_RIGHTS.freedom_movement,
      FUNDAMENTAL_RIGHTS.fair_trial,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.effective_remedy,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(7)", label: "High-risk: visa/asylum, document fraud detection, irregular migration prediction", force: "binding" },
      { instrument: "EU Charter", article: "Art. 18", label: "Right to asylum", force: "binding" },
      { instrument: "EU Charter", article: "Art. 19", label: "Protection in case of removal, expulsion or extradition", force: "binding" },
      { instrument: "ECHR", article: "Art. 3", label: "Prohibition of torture — non-refoulement", force: "binding" },
      { instrument: "Geneva Convention", article: "Art. 33", label: "Non-refoulement", force: "binding" },
      { instrument: "EURODAC", article: "Reg. 2024/1358", label: "Biometric data of migrants", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "asylum_seekers", label: "Asylum seekers", rationale: "Automated rejection may violate non-refoulement; limited legal recourse." },
      { code: "stateless", label: "Stateless persons", rationale: "Absence of documentation creates systematic misclassification risk." },
      { code: "unaccompanied_minors", label: "Unaccompanied minors", rationale: "Children rights plus heightened vulnerability in migration context." },
      { code: "trafficking_victims", label: "Trafficking victims", rationale: "Risk of misidentification as irregular migrants." },
    ],
    prohibitedTriggers: [],
    exampleSystems: [
      "Migration/security risk scoring of entrants",
      "Asylum/visa application examination aids",
      "Polygraph-type tools at borders",
      "Person identification systems (excluding travel-document verification)",
    ],
  },
  {
    code: "justice",
    annexRef: "Annex III(8)",
    label: "Administration of justice & democratic processes",
    description: "Per Annex III(8): (a) AI assisting a judicial authority in researching and interpreting facts and law and applying the law, or in alternative dispute resolution; (b) AI intended to influence the outcome of an election or referendum or voting behaviour (excluding purely administrative campaign-logistics tools to whose output natural persons are not directly exposed).",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.fair_trial,
      FUNDAMENTAL_RIGHTS.presumption_innocence,
      FUNDAMENTAL_RIGHTS.effective_remedy,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.freedom_expression,
      FUNDAMENTAL_RIGHTS.human_dignity,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(8)(a)", label: "High-risk: AI assisting judicial authorities in interpreting facts/law and applying law", force: "binding" },
      { instrument: "AI Act", article: "Annex III(8)(b)", label: "High-risk: AI intended to influence elections, referenda or voting behaviour", force: "binding" },
      { instrument: "EU Charter", article: "Art. 47", label: "Right to an effective remedy and to a fair trial", force: "binding" },
      { instrument: "EU Charter", article: "Art. 11", label: "Freedom of expression and information", force: "binding" },
      { instrument: "ECHR", article: "Art. 6", label: "Right to a fair trial", force: "binding" },
      { instrument: "AI Act", article: "Art. 14", label: "Human oversight obligation for high-risk AI", force: "binding" },
      { instrument: "AI Act", article: "Art. 50(4)", label: "Transparency: labelling of AI-generated or manipulated content (deep fakes / public-interest text)", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "unrepresented", label: "Unrepresented litigants", rationale: "Cannot challenge AI-assisted judicial reasoning without legal knowledge." },
      { code: "ethnic_minorities", label: "Ethnic minorities", rationale: "Historical sentencing disparities may be encoded in training data." },
      { code: "low_income", label: "Low-income defendants", rationale: "Reduced capacity to contest AI-assisted decisions." },
      { code: "first_voters", label: "First-time and low-media-literacy voters", rationale: "Heightened susceptibility to targeted or AI-generated political messaging." },
    ],
    prohibitedTriggers: [
      { code: "subliminal_manipulation", label: "Subliminal or manipulative techniques distorting behaviour", article: "Art. 5(1)(a)", description: "Prohibited: AI deploying subliminal, purposefully manipulative or deceptive techniques that materially distort behaviour and cause significant harm." },
    ],
    exampleSystems: [
      "Judicial fact/law research and interpretation aids",
      "AI in alternative dispute resolution",
      "Systems designed to influence voting behaviour",
      "AI-generated election content directly exposed to voters",
    ],
  },
];

export function getDomainByCode(code: string): Annex3Domain | undefined {
  return ANNEX3_DOMAINS.find((d) => d.code === code);
}

export function getDomainRights(domainCode: string): FundamentalRight[] {
  return getDomainByCode(domainCode)?.fundamentalRights ?? [];
}

export function getDomainLegalRefs(domainCode: string): LegalRef[] {
  return getDomainByCode(domainCode)?.legalRefs ?? [];
}

export function getBindingRefs(domainCode: string): LegalRef[] {
  return getDomainLegalRefs(domainCode).filter((r) => r.force === "binding");
}

export function checkProhibitedTriggers(domainCode: string): ProhibitedTrigger[] {
  return getDomainByCode(domainCode)?.prohibitedTriggers ?? [];
}
