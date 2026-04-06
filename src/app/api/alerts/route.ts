import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import type { AlertsResponse, ConvergenceAlert } from '@/types/alerts'

export async function GET(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = rateLimit(identifier, 30)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const minScore = parseInt(searchParams.get('min_score') ?? '1', 10)
  const severity = searchParams.get('severity')

  try {
    const supabase = await createClient()

    let query = supabase
      .from('active_alerts_ranked')
      .select('*')
      .gte('convergence_score', minScore)
      .eq('is_active', true)

    if (severity) {
      query = query.eq('severity', severity)
    }

    const { data, error } = await query

    if (error) {
      console.error('[alerts] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const alerts = (data ?? []) as ConvergenceAlert[]
    const response: AlertsResponse = {
      alerts,
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      elevated: alerts.filter(a => a.severity === 'elevated').length,
      watch: alerts.filter(a => a.severity === 'watch').length,
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Alerts-Total': String(alerts.length),
      },
    })
  } catch (error) {
    console.error('[alerts] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
