import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { eq } from 'drizzle-orm'

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json()

  await db
    .update(schema.courseSchedule)
    .set(body)
    .where(eq(schema.courseSchedule.id, Number(id)))

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(schema.courseSchedule).where(eq(schema.courseSchedule.id, Number(id)))
  return NextResponse.json({ ok: true })
}
