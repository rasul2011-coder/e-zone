import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { eq } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [contacts, siteSettings] = await Promise.all([
    db.select().from(schema.contacts).limit(1),
    db.select().from(schema.siteSettings)
      .orderBy(schema.siteSettings.key),
  ])

  return NextResponse.json({ contacts: contacts[0] ?? null, siteSettings })
}

export async function PATCH(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json() as {
    contacts?: Record<string, string>
    siteSettings?: Array<{ key: string; value: string }>
  }

  if (body.contacts) {
    const existing = await db.select().from(schema.contacts).limit(1)
    if (existing.length > 0) {
      await db.update(schema.contacts)
        .set(body.contacts)
        .where(eq(schema.contacts.id, existing[0].id))
    } else {
      await db.insert(schema.contacts).values(body.contacts as never)
    }
  }

  if (body.siteSettings) {
    for (const item of body.siteSettings) {
      const existing = await db
        .select()
        .from(schema.siteSettings)
        .where(eq(schema.siteSettings.key, item.key))
        .limit(1)

      if (existing.length > 0) {
        await db.update(schema.siteSettings)
          .set({ value: item.value })
          .where(eq(schema.siteSettings.key, item.key))
      } else {
        await db.insert(schema.siteSettings).values({
          key: item.key, value: item.value, type: 'string',
        })
      }
    }
  }

  return NextResponse.json({ ok: true })
}
