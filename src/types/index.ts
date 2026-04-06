export type RiskLevel = "minimal" | "low" | "medium" | "high" | "critical";

export type FriaStatus = "draft" | "in_review" | "published" | "archived";

export type UserRole = "owner" | "admin" | "analyst" | "viewer";

export type AiRiskCategory =
  | "biometrics"
  | "critical_infrastructure"
  | "education"
  | "employment"
  | "essential_services"
  | "law_enforcement"
  | "migration"
  | "justice";

export interface CountryRiskProfile {
  countryCode: string;
  countryName: string;
  indicators: {
    code: string;
    name: string;
    value: number;
    year: number;
    population?: string;
    source: string;
    riskSignal: RiskLevel;
  }[];
  overallRiskSignal: RiskLevel;
}

export interface FriaWizardState {
  step: number;
  systemId: string;
  context: {
    deploymentDescription: string;
    operationalFrequency: string;
    duration: string;
    humanOversightMeasures: string;
  };
  affectedGroups: {
    populationCode: string;
    estimatedSize: string;
    vulnerabilityLevel: RiskLevel;
    specificConcerns: string;
  }[];
  risks: {
    id: string;
    rightsCategoryCode: string;
    title: string;
    description: string;
    likelihood: RiskLevel;
    severity: RiskLevel;
    dataEvidence: {
      indicatorId: string;
      value: number;
      country: string;
      year: number;
      source: string;
    }[];
  }[];
  mitigations: {
    id: string;
    riskId: string;
    title: string;
    description: string;
    responsible: string;
    deadline: string;
  }[];
  dpiaReference: string;
  dpiaOverlapNotes: string;
}

export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}
