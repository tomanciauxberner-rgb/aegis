export type PolicySignalType =
  | "research_project" | "opinion_or_guidance"
  | "consultation_open" | "consultation_closed"
  | "bill_introduced" | "bill_adopted"
  | "parliamentary_question" | "position_paper"
  | "work_programme" | "stakeholder_event";

export type PolicySignalStatus =
  | "upcoming" | "open" | "in_progress" | "closed" | "adopted" | "withdrawn";

export interface PolicySignalItem {
  id: string;
  sourceId: string;
  signalType: PolicySignalType;
  status: PolicySignalStatus;
  titleOriginal: string;
  titleEn: string;
  summaryEn: string;
  signalDate: string;
  deadlineDate: string | null;
  jurisdiction: string;
  countryCodes: string[];
  themes: string[];
  legalFrameworks: string[];
  relevanceScore: number;
  whyItMatters: string | null;
  stakeholders: string[];
  sourceUrl: string;
  sourceName: string;
  sourceAcronym: string | null;
}

export interface PolicySignalsResponse {
  items: PolicySignalItem[];
  total: number;
  limit: number;
  offset: number;
}
