import type { AlertSeverity } from './alerts'

export type GroupId =
  | 'african_descent'
  | 'roma'
  | 'muslims'
  | 'lgbtiq'
  | 'women'
  | 'disabilities'
  | 'migrants'
  | 'jews'
  | 'children'

export type SectorId =
  | 'employment'
  | 'education'
  | 'housing'
  | 'healthcare'
  | 'law_enforcement'
  | 'essential_services'
  | 'online'
  | 'justice'

export interface IntersectionalAxis {
  group_id: GroupId
  sector: SectorId
  convergence_score: number
  severity: AlertSeverity
  signal_count: number
  headline: string | null
}

export interface IntersectionalProfile {
  id: string
  country: string
  axes: IntersectionalAxis[]
  compound_score: number
  compound_severity: AlertSeverity
  amplification_factor: number
  affected_sectors: SectorId[]
  affected_groups: GroupId[]
  intersectional_note: string | null
}

export interface IntersectionalResponse {
  profiles: IntersectionalProfile[]
  total: number
  critical: number
  elevated: number
  watch: number
  top_country: string | null
  top_sectors: SectorId[]
}

export const GROUP_LABELS: Record<GroupId | string, string> = {
  african_descent: 'African descent',
  roma:            'Roma',
  muslims:         'Muslims',
  lgbtiq:          'LGBTIQ',
  women:           'Women',
  disabilities:    'Disabilities',
  migrants:        'Migrants',
  jews:            'Jews',
  children:        'Children',
}

export const GROUP_COLORS: Record<GroupId | string, string> = {
  african_descent: '#ef4444',
  roma:            '#f97316',
  muslims:         '#eab308',
  lgbtiq:          '#8b5cf6',
  women:           '#ec4899',
  disabilities:    '#06b6d4',
  migrants:        '#10b981',
  jews:            '#3b82f6',
  children:        '#f59e0b',
}

export const SECTOR_LABELS: Record<SectorId | string, string> = {
  employment:         'Employment',
  education:          'Education',
  housing:            'Housing',
  healthcare:         'Healthcare',
  law_enforcement:    'Law enforcement',
  essential_services: 'Essential services',
  online:             'Online / Digital',
  justice:            'Justice',
}

export const INTERSECTIONAL_MULTIPLIERS: Record<string, number> = {
  'women+african_descent':  1.6,
  'women+disabilities':     1.5,
  'women+migrants':         1.5,
  'african_descent+migrants': 1.5,
  'roma+disabilities':      1.6,
  'children+disabilities':  1.7,
  'children+migrants':      1.6,
  'lgbtiq+migrants':        1.5,
  'muslims+women':          1.5,
}
