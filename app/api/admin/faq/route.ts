import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.faq)
    .orderBy(schema.faq.sortOrder, schema.faq.id)

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (!body.question || !body.answer) {
    return NextResponse.json({ error: 'Вопрос и ответ обязательны' }, { status: 400 })
  }

  const [inserted] = await db.insert(schema.faq).values({
    question:    body.question,
    answer:      body.answer,
    category:    body.category ?? null,
    isPublished: body.isPublished ?? true,
    sortOrder:   body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ data: inserted })
}
