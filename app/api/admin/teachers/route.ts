import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.teachers)
    .orderBy(schema.teachers.sortOrder, schema.teachers.name)

  return NextResponse.json({ data: rows })
}

export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  const slug = body.name
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

  const [inserted] = await db.insert(schema.teachers).values({
    name:            body.name,
    slug,
    photo:           body.photo ?? null,
    position:        body.position ?? null,
    specialization:  body.specialization ?? null,
    experienceYears: body.experienceYears ? Number(body.experienceYears) : null,
    qualification:   body.qualification ?? null,
    languages:       body.languages ?? null,
    bio:             body.bio ?? null,
    isActive:        body.isActive ?? true,
    sortOrder:       body.sortOrder ?? 0,
  }).returning()

  return NextResponse.json({ data: inserted })
}
