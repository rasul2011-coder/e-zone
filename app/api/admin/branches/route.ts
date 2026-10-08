import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'

export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const rows = await db
    .select()
    .from(schema.branches)
    .orderBy(schema.branches.sortOrder, schema.branches.name)

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
    .replace(/[^a-z0-9-]/g, '') + '-' + Date.now()

  const [inserted] = await db.insert(schema.branches).values({
    name:         body.name,
    slug,
    address:      body.address,
    phone:        body.phone,
    email:        body.email ?? null,
    workingHours: body.workingHours ?? 'Пн–Сб: 09:00–20:00',
    description:  body.description ?? '',
    isActive:     body.isActive ?? true,
    sortOrder:    body.sortOrder ?? 0,
    createdAt:    now,
    updatedAt:    now,
  }).returning()

  return NextResponse.json({ data: inserted })
}
