import type { SignalDetail } from "./alerts";

export interface RecommendationInput {
  alertId: string;
  country: string;
  groupId: string;
  sector: string;
  convergenceScore: number;
  severity: string;
  signalDetails: SignalDetail[];
}

export interface RecommendationGenerated {
  situation: string;
  evidenceBase: SignalDetail[];
  euContext: string;
  refNumber: string;
}

export interface RecommendationDraft extends RecommendationGenerated {
  alertId: string;
  country: string;
  groupId: string;
  sector: string;
  convergenceScore: number;
  severity: string;
  addressee: string;
  legalBasis: string;
  actionRequested: string;
  deadline: string;
}

export interface RecommendationRecord extends RecommendationDraft {
  id: string;
  createdAt: string;
  exportedAt: string | null;
}

export interface RecommendationSavePayload {
  alertId: string;
  country: string;
  groupId: string;
  sector: string;
  convergenceScore: number;
  severity: string;
  situation: string;
  evidenceBase: SignalDetail[];
  euContext: string;
  addressee: string;
  legalBasis: string;
  actionRequested: string;
  deadline: string;
  refNumber: string;
}
