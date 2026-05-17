import { NextRequest, NextResponse } from 'next/server'
import { rateLimit } from '@/lib/rate-limit'
import { getCasesForContext } from '@/lib/jurisprudence/data'
import type { JurisprudenceResponse } from '@/types/jurisprudence'

export async function GET(request: NextRequest) {
  const identifier = request.headers.get('x-forwarded-for') ?? 'anon'
  const { success } = rateLimit(identifier, 30)
  if (!success) {
    return NextResponse.json({ error: 'Rate limit exceeded' }, { status: 429 })
  }

  const { searchParams } = new URL(request.url)
  const categoriesParam = searchParams.get('categories') ?? ''
  const sectorsParam    = searchParams.get('sectors') ?? ''
  const limitParam      = parseInt(searchParams.get('limit') ?? '8', 10)

  const rights_categories = categoriesParam.split(',').map(s => s.trim()).filter(Boolean)
  const sectors           = sectorsParam.split(',').map(s => s.trim()).filter(Boolean)

  if (rights_categories.length === 0 && sectors.length === 0) {
    return NextResponse.json({ error: 'At least one category or sector required' }, { status: 400 })
  }

  const cases = getCasesForContext({ rights_categories, sectors, limit: Math.min(limitParam, 15) })

  const by_court = cases.reduce((acc, c) => {
    acc[c.court] = (acc[c.court] ?? 0) + 1
    return acc
  }, {} as Record<string, number>)

  const matched_categories = [...new Set(
    cases.flatMap(c => c.rights_categories.filter(r => rights_categories.includes(r)))
  )]

  const response: JurisprudenceResponse = {
    cases,
    total: cases.length,
    by_court: by_court as JurisprudenceResponse['by_court'],
    matched_categories,
  }

  return NextResponse.json(response, {
    headers: {
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  })
}
