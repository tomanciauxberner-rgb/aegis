export type SignalType = 'statistical' | 'legislative' | 'incident'
export type AlertSeverity = 'critical' | 'elevated' | 'watch'

export interface SignalDetail {
  signal_type: SignalType
  title: string
  summary: string | null
  delta_pp: number | null
  source: string | null
  year: number | null
}

export interface ConvergenceAlert {
  id: string
  country: string
  group_id: string
  sector: string
  convergence_score: 1 | 2 | 3
  severity: AlertSeverity
  has_statistical: boolean
  has_legislative: boolean
  has_incident: boolean
  signal_ids: string[]
  headline: string | null
  last_computed_at: string
  is_active: boolean
  signal_details: SignalDetail[]
}

export interface AlertsResponse {
  alerts: ConvergenceAlert[]
  total: number
  critical: number
  elevated: number
  watch: number
}
