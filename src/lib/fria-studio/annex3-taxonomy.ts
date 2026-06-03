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
      { instrument: "AI Act", article: "Art. 5(1)(d)", label: "Real-time RBI in public spaces — conditional prohibition", force: "binding" },
      { instrument: "AI Act", article: "Annex III(1)", label: "High-risk: post-hoc RBI + emotion recognition + biometric categorisation", force: "binding" },
      { instrument: "AI Act", article: "Art. 5(1)(b)", label: "Prohibited: subliminal manipulation", force: "binding" },
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
      { code: "realtime_rbi_public", label: "Real-time RBI in publicly accessible spaces", article: "Art. 5(1)(d)", description: "Prohibited except for narrow law-enforcement exceptions under Art. 5(2)–(3)." },
      { code: "emotion_recognition_work", label: "Emotion recognition in workplace or education", article: "Art. 5(1)(f)", description: "Prohibited unless for specific medical or safety reasons." },
      { code: "biometric_categorisation_protected", label: "Biometric categorisation inferring race, religion, sexual orientation", article: "Art. 5(1)(g)", description: "Prohibited." },
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
    description: "AI determining access to educational institutions, scoring student performance, monitoring and detecting prohibited behaviour.",
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
      { code: "exploit_age_vulnerability", label: "Exploiting vulnerability due to age", article: "Art. 5(1)(b)", description: "Any system designed to influence minors by exploiting developmental vulnerabilities." },
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
      { code: "social_scoring_public", label: "General-purpose social scoring by public authorities", article: "Art. 5(1)(c)", description: "Prohibited: scoring natural persons across contexts leading to unjustified treatment." },
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
      { instrument: "AI Act", article: "Art. 5(1)(d)", label: "Real-time RBI — conditional prohibition", force: "binding" },
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
      { code: "realtime_rbi_le", label: "Real-time RBI for law enforcement without authorisation", article: "Art. 5(2)–(3)", description: "Permitted only under judicial/administrative authorisation for specific serious crimes." },
      { code: "predictive_policing_individual", label: "Predictive policing based solely on profiling", article: "Art. 5(1)(d) recital 42", description: "Profiling individuals as potential criminals without objective basis is prohibited." },
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
    description: "AI assessing immigration risk, processing asylum applications, detecting document fraud, predicting irregular migration.",
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
      "Automated visa risk scoring",
      "Asylum claim processing AI",
      "Travel document fraud detection",
      "Border crossing behaviour analytics",
    ],
  },
  {
    code: "justice",
    annexRef: "Annex III(8)",
    label: "Administration of justice & democratic processes",
    description: "AI assisting courts in researching facts and law, applying the law, alternative dispute resolution.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.fair_trial,
      FUNDAMENTAL_RIGHTS.presumption_innocence,
      FUNDAMENTAL_RIGHTS.effective_remedy,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.human_dignity,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(8)", label: "High-risk: judicial research and law application AI", force: "binding" },
      { instrument: "EU Charter", article: "Art. 47", label: "Right to effective judicial protection", force: "binding" },
      { instrument: "ECHR", article: "Art. 6", label: "Right to a fair trial", force: "binding" },
      { instrument: "AI Act", article: "Art. 14", label: "Human oversight — courts must retain final decision authority", force: "binding" },
      { instrument: "Venice Commission", article: "CDL-AD(2022)026", label: "Rule of law standards for AI in justice", force: "interpretive" },
    ],
    vulnerablePopulations: [
      { code: "unrepresented", label: "Unrepresented litigants", rationale: "Cannot challenge AI-assisted judicial reasoning without legal knowledge." },
      { code: "ethnic_minorities", label: "Ethnic minorities", rationale: "Historical sentencing disparities may be encoded in training data." },
      { code: "low_income", label: "Low-income defendants", rationale: "Reduced capacity to contest AI-assisted decisions." },
    ],
    prohibitedTriggers: [],
    exampleSystems: [
      "Sentencing recommendation systems",
      "Legal research and case outcome prediction",
      "Automated mediation platforms",
      "Evidence relevance scoring",
    ],
  },
  {
    code: "democratic",
    annexRef: "Annex III(8b)",
    label: "Democratic processes & elections",
    description: "AI systems influencing political opinion, targeting voters, or generating election-related content at scale.",
    defaultRiskLevel: "high",
    fundamentalRights: [
      FUNDAMENTAL_RIGHTS.freedom_expression,
      FUNDAMENTAL_RIGHTS.non_discrimination,
      FUNDAMENTAL_RIGHTS.human_dignity,
      FUNDAMENTAL_RIGHTS.privacy,
      FUNDAMENTAL_RIGHTS.data_protection,
    ],
    legalRefs: [
      { instrument: "AI Act", article: "Annex III(8b)", label: "High-risk: AI for influencing elections and democratic processes", force: "binding" },
      { instrument: "DSA", article: "Art. 34", label: "Risk assessment for systemic risks incl. electoral processes", force: "binding" },
      { instrument: "EU Charter", article: "Art. 11", label: "Freedom of expression and information", force: "binding" },
      { instrument: "AI Act", article: "Art. 50(3)", label: "Transparency obligation: AI-generated electoral content", force: "binding" },
    ],
    vulnerablePopulations: [
      { code: "first_voters", label: "First-time voters", rationale: "Higher susceptibility to targeted political messaging." },
      { code: "low_media_literacy", label: "Persons with low media literacy", rationale: "Limited capacity to identify AI-generated political content." },
      { code: "minority_voters", label: "Minority communities", rationale: "Micro-targeting may exploit community-specific vulnerabilities." },
    ],
    prohibitedTriggers: [
      { code: "subliminal_political", label: "Subliminal political manipulation", article: "Art. 5(1)(a)", description: "AI deploying techniques below conscious perception to influence political views." },
    ],
    exampleSystems: [
      "Voter micro-targeting platforms",
      "AI-generated campaign content",
      "Deepfake detection / generation in political contexts",
      "Election result prediction with voter influence",
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
