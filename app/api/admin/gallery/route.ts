import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.gallery)
    .orderBy(schema.gallery.sortOrder, desc(schema.gallery.createdAt))

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (!body.image) {
    return NextResponse.json({ error: 'URL изображения обязателен' }, { status: 400 })
  }

  const [inserted] = await db.insert(schema.gallery).values({
    title:       body.title ?? null,
    image:       body.image,
    description: body.description ?? null,
    category:    body.category ?? null,
    isPublished: body.isPublished ?? true,
    sortOrder:   body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ data: inserted })
}
