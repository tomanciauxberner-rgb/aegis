import type {
  ChildrenSeverity,
  DpaOutcome,
  EdtechRiskTier,
  AppStorePlatform,
  ChildrenLegalBasis,
} from "./children-v2";

export interface OverviewResponse {
  decisions: {
    total: number;
    critical: number;
    high: number;
    countries_covered: number;
    total_fines_eur: number;
  };
  apps: {
    total: number;
    vlops_count: number;
    rated_under_12: number;
  };
  edtech: {
    total: number;
    annex3_count: number;
    countries_mapped: number;
  };
  ingest_runs: Array<{
    pipeline: string;
    completed_at: string;
    inserted: number;
    errors: number;
  }>;
  generated_at: string;
}

export interface DpaDecisionItem {
  id: string;
  countryCode: string;
  decisionDate: string;
  publishedDate: string | null;
  titleOriginal: string;
  titleEn: string;
  summaryEn: string;
  outcome: DpaOutcome;
  fineAmountEur: number | null;
  respondentName: string | null;
  respondentSector: string | null;
  legalBases: ChildrenLegalBasis[];
  ageRangeAffected: string | null;
  severity: ChildrenSeverity;
  sourceUrl: string;
  languageOriginal: string;
  isVerified: boolean;
  dpaAcronym: string | null;
  dpaNameEn: string;
}

export interface DecisionsResponse {
  items: DpaDecisionItem[];
  total: number;
  limit: number;
  offset: number;
}

export type ComplianceGap = "ok" | "borderline" | "violation" | "unknown";

export interface AppItem {
  appId: string;
  bundleId: string;
  name: string;
  publisher: string | null;
  category: string | null;
  declaredMinAge: number | null;
  isVlop: boolean;
  vlopDesignationDate: string | null;
  dsaTransparencyUrl: string | null;
  countryCode: string;
  platform: AppStorePlatform;
  chartCategory: string;
  rank: number;
  observedAt: string;
  legal_age_gdpr_art8: number | null;
  compliance_gap: ComplianceGap;
}

export interface AppsResponse {
  items: AppItem[];
  total: number;
  observed_at: string | null;
}

export interface EdtechItem {
  id: string;
  countryCode: string;
  systemName: string;
  vendor: string | null;
  deploymentScope: string;
  studentsAffected: number | null;
  aiFeatures: string[];
  annex3Categories: string[];
  riskTier: EdtechRiskTier;
  legalStatus: string | null;
  sourceUrl: string | null;
  description: string;
  lastVerified: string;
}

export interface EdtechResponse {
  items: EdtechItem[];
  total: number;
}

export interface GdprAgeItem {
  countryCode: string;
  ageConsent: number;
  legalSource: string;
  sourceUrl: string;
  lastVerified: string;
  notes: string | null;
}

export interface GdprAgeResponse {
  items: GdprAgeItem[];
  total: number;
}
