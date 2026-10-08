import { NextRequest, NextResponse } from 'next/server'
import { eq } from 'drizzle-orm'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'

const COLOR_KEYS = ['brand_primary', 'brand_accent', 'brand_navy', 'brand_navy_mid'] as const

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.siteSettings)

  const colors: Record<string, string> = {}
  for (const key of COLOR_KEYS) {
    const row = rows.find(r => r.key === key)
    colors[key] = row?.value ?? ''
  }

  return NextResponse.json({ data: colors })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = (await req.json()) as Record<string, string>

  for (const key of COLOR_KEYS) {
    const value = body[key]
    if (!value) continue

    const existing = await db
      .select()
      .from(schema.siteSettings)
      .where(eq(schema.siteSettings.key, key))
      .limit(1)

    if (existing.length > 0) {
      await db
        .update(schema.siteSettings)
        .set({ value })
        .where(eq(schema.siteSettings.key, key))
    } else {
      await db.insert(schema.siteSettings).values({
        key,
        value,
        type: 'color',
        description: `Brand color: ${key}`,
      })
    }
  }

  return NextResponse.json({ ok: true })
}
