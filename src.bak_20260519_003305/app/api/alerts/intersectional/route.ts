import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { rateLimit } from '@/lib/rate-limit'
import type { IntersectionalProfile, IntersectionalResponse, GroupId, SectorId } from '@/types/intersectional'
import { INTERSECTIONAL_MULTIPLIERS } from '@/types/intersectional'
import type { AlertSeverity, ConvergenceAlert } from '@/types/alerts'

function computeAmplification(groups: GroupId[]): number {
  if (groups.length < 2) return 1.0
  let max = 1.0
  for (let i = 0; i < groups.length; i++) {
    for (let j = i + 1; j < groups.length; j++) {
      const key1 = `${groups[i]}+${groups[j]}`
      const key2 = `${groups[j]}+${groups[i]}`
      const m = INTERSECTIONAL_MULTIPLIERS[key1] ?? INTERSECTIONAL_MULTIPLIERS[key2] ?? 1.2
      if (m > max) max = m
    }
  }
  return max
}

function severityFromScore(score: number): AlertSeverity {
  if (score >= 5) return 'critical'
  if (score >= 3) return 'elevated'
  return 'watch'
}

function buildIntersectionalNote(groups: GroupId[], sectors: SectorId[], country: string): string | null {
  if (groups.length < 2) return null
  const groupLabels = groups.slice(0, 3).join(', ')
  const sectorLabel = sectors[0] ?? 'multiple sectors'
  return `Compound discrimination risk detected for ${groupLabels} in ${country} — ${sectorLabel} most affected`
}

export async function GET(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = rateLimit(identifier, 20)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const countryFilter = searchParams.get('country')
  const minAxes = parseInt(searchParams.get('min_axes') ?? '2', 10)

  try {
    const supabase = await createClient()

    let query = supabase
      .from('active_alerts_ranked')
      .select('*')
      .eq('is_active', true)
      .gte('convergence_score', 1)

    if (countryFilter) {
      query = query.eq('country', countryFilter.toUpperCase())
    }

    const { data, error } = await query

    if (error) {
      console.error('[intersectional] Supabase error:', error)
      return NextResponse.json({ error: 'Database error' }, { status: 500 })
    }

    const alerts = (data ?? []) as ConvergenceAlert[]

    const byCountrySector = new Map<string, ConvergenceAlert[]>()
    for (const alert of alerts) {
      const key = `${alert.country}::${alert.sector}`
      const existing = byCountrySector.get(key) ?? []
      existing.push(alert)
      byCountrySector.set(key, existing)
    }

    const profileMap = new Map<string, IntersectionalProfile>()

    for (const [key, sectorAlerts] of byCountrySector.entries()) {
      if (sectorAlerts.length < 2) continue

      const [country, sector] = key.split('::')
      const profileKey = country

      const existing = profileMap.get(profileKey)

      const axes = sectorAlerts.map(a => ({
        group_id:         a.group_id as GroupId,
        sector:           a.sector as SectorId,
        convergence_score: a.convergence_score,
        severity:         a.severity,
        signal_count:     a.signal_ids?.length ?? 1,
        headline:         a.headline,
      }))

      const groups = [...new Set(sectorAlerts.map(a => a.group_id as GroupId))]
      const rawScore = sectorAlerts.reduce((sum, a) => sum + a.convergence_score, 0)
      const amplification = computeAmplification(groups)
      const compoundScore = Math.round(rawScore * amplification * 10) / 10

      if (existing) {
        const mergedAxes = [...existing.axes, ...axes]
        const mergedGroups = [...new Set([...existing.affected_groups, ...groups])] as GroupId[]
        const mergedSectors = [...new Set([...existing.affected_sectors, sector as SectorId])] as SectorId[]
        const mergedRaw = existing.compound_score / existing.amplification_factor + rawScore
        const newAmp = computeAmplification(mergedGroups)
        const newCompound = Math.round(mergedRaw * newAmp * 10) / 10

        profileMap.set(profileKey, {
          ...existing,
          axes: mergedAxes,
          compound_score: newCompound,
          compound_severity: severityFromScore(newCompound),
          amplification_factor: newAmp,
          affected_sectors: mergedSectors,
          affected_groups: mergedGroups,
          intersectional_note: buildIntersectionalNote(mergedGroups, mergedSectors, country),
        })
      } else {
        const sectors = [...new Set(sectorAlerts.map(a => a.sector as SectorId))]
        profileMap.set(profileKey, {
          id: `intersect-${country}-${Date.now()}`,
          country,
          axes,
          compound_score: compoundScore,
          compound_severity: severityFromScore(compoundScore),
          amplification_factor: amplification,
          affected_sectors: sectors,
          affected_groups: groups,
          intersectional_note: buildIntersectionalNote(groups, sectors, country),
        })
      }
    }

    const profiles = Array.from(profileMap.values())
      .filter(p => p.affected_groups.length >= minAxes)
      .sort((a, b) => b.compound_score - a.compound_score)

    const topSectors = profiles
      .flatMap(p => p.affected_sectors)
      .reduce<Record<string, number>>((acc, s) => { acc[s] = (acc[s] ?? 0) + 1; return acc }, {})

    const sortedSectors = Object.entries(topSectors)
      .sort((a, b) => b[1] - a[1])
      .map(([s]) => s as SectorId)

    const response: IntersectionalResponse = {
      profiles,
      total:       profiles.length,
      critical:    profiles.filter(p => p.compound_severity === 'critical').length,
      elevated:    profiles.filter(p => p.compound_severity === 'elevated').length,
      watch:       profiles.filter(p => p.compound_severity === 'watch').length,
      top_country: profiles[0]?.country ?? null,
      top_sectors: sortedSectors.slice(0, 3),
    }

    return NextResponse.json(response, {
      headers: {
        'Cache-Control': 'no-store',
        'X-Profiles-Total': String(profiles.length),
      },
    })
  } catch (err) {
    console.error('[intersectional] Unexpected error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
