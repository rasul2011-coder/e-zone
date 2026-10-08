import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { inArray } from 'drizzle-orm'

const COLOR_KEYS = ['brand_primary', 'brand_accent', 'brand_navy', 'brand_navy_mid']

// Public — no auth — called from layout to inject CSS vars
export async function GET() {
  try {
    const rows = await db
      .select()
      .from(schema.siteSettings)
      .where(inArray(schema.siteSettings.key, COLOR_KEYS))

    const colors: Record<string, string> = {}
    for (const row of rows) {
      colors[row.key] = row.value
    }
    return NextResponse.json({ data: colors }, {
      headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' },
    })
  } catch {
    return NextResponse.json({ data: {} })
  }
}
