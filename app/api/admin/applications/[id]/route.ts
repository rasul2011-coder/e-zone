import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { eq } from 'drizzle-orm'

// PATCH /api/admin/applications/:id  — change status
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  const body = await req.json() as { statusId?: number }

  if (!body.statusId) {
    return NextResponse.json({ error: 'statusId required' }, { status: 400 })
  }

  // Record history
  const [current] = await db
    .select({ statusId: schema.applications.statusId })
    .from(schema.applications)
    .where(eq(schema.applications.id, Number(id)))
    .limit(1)

  if (!current) return NextResponse.json({ error: 'Not found' }, { status: 404 })

  await db
    .update(schema.applications)
    .set({ statusId: body.statusId, updatedAt: new Date() })
    .where(eq(schema.applications.id, Number(id)))

  await db.insert(schema.applicationHistory).values({
    applicationId: Number(id),
    adminId:       session.adminId,
    oldStatusId:   current.statusId,
    newStatusId:   body.statusId,
    createdAt:     new Date(),
  })

  return NextResponse.json({ ok: true })
}

// DELETE /api/admin/applications/:id
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { id } = await params
  await db.delete(schema.applications).where(eq(schema.applications.id, Number(id)))
  return NextResponse.json({ ok: true })
}
