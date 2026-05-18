export type ChildrenRiskDomain =
  | "algorithmic_profiling"
  | "education_ai"
  | "consent_mechanisms"
  | "content_recommenders"
  | "biometric_surveillance"
  | "social_scoring"
  | "targeted_advertising"
  | "platform_design";

export type ChildrenRiskLevel = "low" | "medium" | "high" | "critical";

export type ChildrenLegalBasis =
  | "dsa_art28"
  | "dsa_art39"
  | "gdpr_art8"
  | "gdpr_art22"
  | "ai_act_annex3"
  | "ai_act_art9"
  | "crc_art3"
  | "crc_art16";

export interface ChildrenIncident {
  id: string;
  country: string;
  flag: string;
  title: string;
  domain: ChildrenRiskDomain;
  platform?: string;
  legalBases: ChildrenLegalBasis[];
  severity: ChildrenRiskLevel;
  date: string;
  summary: string;
  outcome: string;
  source: string;
  url: string;
}

export interface ChildrenCountryProfile {
  countryCode: string;
  countryName: string;
  dsmaBodies: string[];
  dsaComplianceStatus: "compliant" | "partial" | "non_compliant" | "unknown";
  gdprChildAgeConsent: number;
  riskScore: number;
  riskLevel: ChildrenRiskLevel;
}

export const DOMAIN_LABELS: Record<ChildrenRiskDomain, string> = {
  algorithmic_profiling:  "Algorithmic profiling",
  education_ai:           "AI in education",
  consent_mechanisms:     "Consent mechanisms",
  content_recommenders:   "Content recommenders",
  biometric_surveillance: "Biometric surveillance",
  social_scoring:         "Social scoring",
  targeted_advertising:   "Targeted advertising",
  platform_design:        "Platform design",
};

export const LEGAL_LABELS: Record<ChildrenLegalBasis, { label: string; color: string }> = {
  dsa_art28:      { label: "DSA Art.28",      color: "#8b5cf6" },
  dsa_art39:      { label: "DSA Art.39",      color: "#8b5cf6" },
  gdpr_art8:      { label: "GDPR Art.8",      color: "#4f7cff" },
  gdpr_art22:     { label: "GDPR Art.22",     color: "#4f7cff" },
  ai_act_annex3:  { label: "AI Act Annex III",color: "#e8b84b" },
  ai_act_art9:    { label: "AI Act Art.9",    color: "#e8b84b" },
  crc_art3:       { label: "CRC Art.3",       color: "#5ce8a0" },
  crc_art16:      { label: "CRC Art.16",      color: "#5ce8a0" },
};

export const GDPR_AGES: Record<string, { age: number; flag: string; name: string }> = {
  AT: { age: 14, flag: "🇦🇹", name: "Austria" },
  BE: { age: 13, flag: "🇧🇪", name: "Belgium" },
  BG: { age: 14, flag: "🇧🇬", name: "Bulgaria" },
  HR: { age: 16, flag: "🇭🇷", name: "Croatia" },
  CY: { age: 14, flag: "🇨🇾", name: "Cyprus" },
  CZ: { age: 15, flag: "🇨🇿", name: "Czechia" },
  DK: { age: 13, flag: "🇩🇰", name: "Denmark" },
  EE: { age: 13, flag: "🇪🇪", name: "Estonia" },
  FI: { age: 13, flag: "🇫🇮", name: "Finland" },
  FR: { age: 15, flag: "🇫🇷", name: "France" },
  DE: { age: 16, flag: "🇩🇪", name: "Germany" },
  GR: { age: 15, flag: "🇬🇷", name: "Greece" },
  HU: { age: 16, flag: "🇭🇺", name: "Hungary" },
  IE: { age: 16, flag: "🇮🇪", name: "Ireland" },
  IT: { age: 14, flag: "🇮🇹", name: "Italy" },
  LV: { age: 13, flag: "🇱🇻", name: "Latvia" },
  LT: { age: 14, flag: "🇱🇹", name: "Lithuania" },
  LU: { age: 16, flag: "🇱🇺", name: "Luxembourg" },
  MT: { age: 13, flag: "🇲🇹", name: "Malta" },
  NL: { age: 16, flag: "🇳🇱", name: "Netherlands" },
  PL: { age: 16, flag: "🇵🇱", name: "Poland" },
  PT: { age: 13, flag: "🇵🇹", name: "Portugal" },
  RO: { age: 16, flag: "🇷🇴", name: "Romania" },
  SK: { age: 16, flag: "🇸🇰", name: "Slovakia" },
  SI: { age: 15, flag: "🇸🇮", name: "Slovenia" },
  ES: { age: 14, flag: "🇪🇸", name: "Spain" },
  SE: { age: 13, flag: "🇸🇪", name: "Sweden" },
};
