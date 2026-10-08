import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { desc } from 'drizzle-orm'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.courses)
    .orderBy(schema.courses.sortOrder, desc(schema.courses.createdAt))

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()
  const now = new Date()

  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')

  const [inserted] = await db.insert(schema.courses).values({
    name:             body.name,
    slug:             slug + '-' + Date.now(),
    shortDescription: body.shortDescription ?? '',
    description:      body.description ?? '',
    price:            body.price ?? null,
    currency:         'KGS',
    duration:         body.duration ?? null,
    ageFrom:          body.ageFrom ? Number(body.ageFrom) : null,
    ageTo:            body.ageTo ? Number(body.ageTo) : null,
    isActive:         body.isActive ?? true,
    isFeatured:       body.isFeatured ?? false,
    sortOrder:        body.sortOrder ?? 0,
    createdAt:        now,
    updatedAt:        now,
  }).returning()

  return NextResponse.json({ data: inserted })
}
