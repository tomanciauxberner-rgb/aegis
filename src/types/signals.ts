export type PopulationGroup =
  | "african_descent"
  | "roma"
  | "muslims"
  | "lgbtiq"
  | "women"
  | "disabilities"
  | "migrants"
  | "jews";

export type Sector =
  | "employment"
  | "education"
  | "housing"
  | "healthcare"
  | "law_enforcement"
  | "essential_services"
  | "online"
  | "justice"
  | "gender_violence";

export type SignalSeverity = "critical" | "high" | "medium" | "low";

export type DataSourceId =
  | "fra_eumidis2"
  | "fra_being_black"
  | "fra_lgbtiq3"
  | "fra_roma2"
  | "fra_roma3"
  | "fra_muslims"
  | "fra_hate_crime"
  | "fra_online_hate"
  | "fra_antisemitism"
  | "fra_frr2025"
  | "fra_gbv"
  | "fra_disability"
  | "algorithmwatch"
  | "eurostat";

export interface DataSource {
  id: DataSourceId;
  label: string;
  url: string;
  year: number;
  publisher: string;
}

export interface FraDataPoint {
  country: string;
  group: PopulationGroup;
  sector: Sector;
  indicator: string;
  value: number;
  unit: "percent" | "rate_per_100k" | "index";
  year: number;
  source: DataSourceId;
  note?: string;
}

export interface AlgorithmicIncident {
  id: string;
  title: string;
  country: string;
  sector: Sector;
  groups: PopulationGroup[];
  severity: SignalSeverity;
  date: string;
  summary: string;
  source: string;
  sourceUrl: string;
}

export interface CountrySignal {
  country: string;
  countryCode: string;
  sector: Sector;
  group: PopulationGroup;
  discriminationRate: number | null;
  harassmentRate: number | null;
  dataYear: number;
  source: DataSourceId;
  incidents: AlgorithmicIncident[];
  trend: "worsening" | "stable" | "improving" | "unknown";
}

export interface SignalFilter {
  countryCode?: string;
  sector?: Sector;
  group?: PopulationGroup;
}
