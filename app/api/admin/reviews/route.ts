import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.reviews)
    .orderBy(schema.reviews.sortOrder, desc(schema.reviews.createdAt))

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (!body.name || !body.text) {
    return NextResponse.json({ error: 'Имя и текст обязательны' }, { status: 400 })
  }

  const [inserted] = await db.insert(schema.reviews).values({
    name:        body.name,
    photo:       body.photo ?? null,
    text:        body.text,
    rating:      body.rating ?? 5,
    courseId:    body.courseId ? Number(body.courseId) : null,
    branchId:    body.branchId ? Number(body.branchId) : null,
    isPublished: body.isPublished ?? false,
    sortOrder:   body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ data: inserted })
}
