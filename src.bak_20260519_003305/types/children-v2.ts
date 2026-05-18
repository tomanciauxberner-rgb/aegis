export type ChildrenSeverity = "critical" | "high" | "medium" | "low" | "informational";

export type DpaOutcome =
  | "fine" | "warning" | "injunction" | "dismissed" | "ongoing" | "settled" | "guidance";

export type EdtechRiskTier = "annex3" | "prohibited" | "limited" | "minimal" | "unknown";

export type AppStorePlatform = "ios" | "android";

export type ChildrenLegalBasis =
  | "gdpr_art8" | "gdpr_art22" | "gdpr_art35"
  | "dsa_art28" | "dsa_art34" | "dsa_art35" | "dsa_art39"
  | "ai_act_annex3" | "ai_act_art5" | "ai_act_art27"
  | "uncrc_art3" | "uncrc_art16" | "uncrc_art17"
  | "charter_art24";

export interface DpaDecisionExtracted {
  external_id: string;
  decision_date: string;
  published_date: string | null;
  title_original: string;
  title_en: string;
  summary_en: string;
  outcome: DpaOutcome;
  fine_amount_eur: number | null;
  respondent_name: string | null;
  respondent_sector: string | null;
  legal_bases: ChildrenLegalBasis[];
  age_range_affected: string | null;
  severity: ChildrenSeverity;
  source_url: string;
  affects_minors: boolean;
}

export interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}
