import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import type { AlertsResponse, ConvergenceAlert } from '@/types/alerts'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ country: string }> }
) {
  const { country } = await params
  const countryCode = country.toUpperCase().replace(/[^A-Z]/g, '')

  if (!countryCode || countryCode.length !== 2) {
    return NextResponse.json({ error: 'Invalid country code' }, { status: 400 })
  }

  const identifier = request.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = rateLimit(identifier, 30)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  try {
    const supabase = await createClient()

    const { data, error } = await supabase
      .from('active_alerts_ranked')
      .select('*')
      .eq('country', countryCode)
      .eq('is_active', true)
      .order('convergence_score', { ascending: false })

    if (error) {
      console.error('[alerts/country] Supabase error:', error)
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
        'X-Country': countryCode,
      },
    })
  } catch (error) {
    console.error('[alerts/country] Unexpected error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
