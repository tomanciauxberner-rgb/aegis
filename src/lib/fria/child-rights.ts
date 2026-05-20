// Child-specific rights taxonomy for FRIA — the differentiation layer.
// Grounded in UN CRC, EU Charter Art. 24, AI Act Annex III(3), GDPR Art. 8.

export interface ChildAgeBand {
  code: string;
  label: string;
  range: string;
  cognitiveProfile: string;
  consentNote: string;
}

export const CHILD_AGE_BANDS: ChildAgeBand[] = [
  {
    code: "early_0_5",
    label: "Early childhood",
    range: "0–5",
    cognitiveProfile: "Pre-literate; no capacity to understand data processing or give consent. Fully dependent on guardians.",
    consentNote: "Consent exercised entirely by holder of parental responsibility.",
  },
  {
    code: "childhood_6_9",
    label: "Childhood",
    range: "6–9",
    cognitiveProfile: "Developing literacy; concrete thinking; highly suggestible; cannot assess long-term consequences.",
    consentNote: "Parental consent required; child assent has no legal weight.",
  },
  {
    code: "pre_teen_10_12",
    label: "Pre-teen",
    range: "10–12",
    cognitiveProfile: "Emerging abstract reasoning; susceptible to social influence and persuasive design; limited risk assessment.",
    consentNote: "Below GDPR Art. 8 threshold in all Member States; parental consent required.",
  },
  {
    code: "young_teen_13_15",
    label: "Young teenager",
    range: "13–15",
    cognitiveProfile: "Identity formation; heightened sensitivity to peer validation; impulsivity; vulnerable to manipulation and addictive design.",
    consentNote: "Crosses GDPR Art. 8 threshold in some Member States (13–15) but not others (16) — jurisdiction-dependent.",
  },
  {
    code: "older_teen_16_17",
    label: "Older teenager",
    range: "16–17",
    cognitiveProfile: "Near-adult reasoning but ongoing prefrontal development; still legally a minor under UN CRC.",
    consentNote: "Above GDPR Art. 8 threshold in all Member States, but remains a child under UN CRC and Charter Art. 24.",
  },
];

export interface ChildRightFramework {
  code: string;
  framework: string;
  article: string;
  label: string;
  description: string;
}

export const CHILD_RIGHTS_FRAMEWORKS: ChildRightFramework[] = [
  { code: "charter_24", framework: "EU Charter", article: "Art. 24", label: "Rights of the child", description: "Best interests of the child must be a primary consideration in all actions." },
  { code: "uncrc_3", framework: "UN CRC", article: "Art. 3", label: "Best interests", description: "Best interests of the child a primary consideration." },
  { code: "uncrc_12", framework: "UN CRC", article: "Art. 12", label: "Right to be heard", description: "The child's views must be given due weight." },
  { code: "uncrc_16", framework: "UN CRC", article: "Art. 16", label: "Privacy", description: "Protection from arbitrary interference with privacy." },
  { code: "uncrc_17", framework: "UN CRC", article: "Art. 17", label: "Access to information", description: "Access to appropriate information and protection from harmful material." },
  { code: "uncrc_19", framework: "UN CRC", article: "Art. 19", label: "Protection from harm", description: "Protection from all forms of violence, abuse and exploitation." },
  { code: "uncrc_32", framework: "UN CRC", article: "Art. 32", label: "Economic exploitation", description: "Protection from economic exploitation, incl. data exploitation." },
  { code: "ai_act_annex3_3", framework: "AI Act", article: "Annex III(3)", label: "Education high-risk", description: "AI in education/vocational training is high-risk; mandatory FRIA." },
  { code: "ai_act_5_1b", framework: "AI Act", article: "Art. 5(1)(b)", label: "Exploitation of vulnerability", description: "Prohibited: exploiting vulnerabilities due to age." },
  { code: "gdpr_8", framework: "GDPR", article: "Art. 8", label: "Child consent", description: "Conditions for child consent in information society services." },
  { code: "dsa_28", framework: "DSA", article: "Art. 28", label: "Minors protection", description: "Platforms must ensure high privacy/safety for minors." },
];

export interface ChildVulnerability {
  code: string;
  label: string;
  description: string;
}

export const CHILD_VULNERABILITIES: ChildVulnerability[] = [
  { code: "persuasive_design", label: "Persuasive / addictive design", description: "Engagement-maximising patterns exploiting developmental impulsivity." },
  { code: "profiling", label: "Profiling & behavioural prediction", description: "Building behavioural profiles of a developing person." },
  { code: "manipulation", label: "Manipulation / dark patterns", description: "Influencing choices in ways a child cannot recognise or resist." },
  { code: "automated_decision", label: "Automated decisions about the child", description: "Scoring, ranking or sorting affecting educational or life outcomes." },
  { code: "data_permanence", label: "Data permanence", description: "Data collected in childhood persisting into adult life." },
  { code: "age_inappropriate", label: "Age-inappropriate content exposure", description: "Exposure to content unsuitable for the developmental stage." },
  { code: "consent_bypass", label: "Consent / age-assurance bypass", description: "Inadequate age verification enabling under-age access." },
  { code: "social_pressure", label: "Social comparison & peer pressure amplification", description: "Mechanics amplifying social validation needs." },
  { code: "self_image", label: "Impact on self-image / mental health", description: "Effects on body image, self-esteem, wellbeing." },
  { code: "isolation", label: "Isolation from trusted adults", description: "Designs that reduce oversight by parents/educators." },
];

export const CHILD_POPULATION_CODES = CHILD_AGE_BANDS.map((b) => b.code);

export function isChildPopulation(code: string): boolean {
  return CHILD_POPULATION_CODES.includes(code) || code === "youth_16_24";
}
