export type Court = 'CJEU' | 'ECHR' | 'national' | 'DPA'

export type CaseRelevance = 'binding' | 'persuasive' | 'illustrative'

export interface JurisprudenceCase {
  id: string
  court: Court
  name: string
  citation: string
  year: number
  country: string | null
  summary: string
  holding: string
  relevance: CaseRelevance
  rights_categories: string[]
  ai_act_articles: string[]
  sectors: string[]
  keywords: string[]
  url: string | null
}

export interface JurisprudenceResponse {
  cases: JurisprudenceCase[]
  total: number
  by_court: Record<Court, number>
  matched_categories: string[]
}

export const COURT_LABELS: Record<Court, string> = {
  CJEU:     'Court of Justice EU',
  ECHR:     'European Court of Human Rights',
  national: 'National court',
  DPA:      'Data Protection Authority',
}

export const COURT_COLORS: Record<Court, string> = {
  CJEU:     '#4f7cff',
  ECHR:     '#a07cff',
  national: '#e8b84b',
  DPA:      '#5ce8a0',
}

export const RELEVANCE_LABELS: Record<CaseRelevance, string> = {
  binding:      'Binding',
  persuasive:   'Persuasive',
  illustrative: 'Illustrative',
}
