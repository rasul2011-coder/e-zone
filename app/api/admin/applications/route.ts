import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { eq, desc, ilike, or, and } from 'drizzle-orm'

// GET /api/admin/applications?page=1&limit=20&search=&status=
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const page   = Math.max(1, Number(searchParams.get('page')  ?? 1))
  const limit  = Math.min(100, Number(searchParams.get('limit') ?? 20))
  const search = searchParams.get('search')?.trim() ?? ''
  const status = searchParams.get('status')?.trim() ?? ''
  const offset = (page - 1) * limit

  const conditions = []
  if (search) {
    conditions.push(
      or(
        ilike(schema.applications.name,  `%${search}%`),
        ilike(schema.applications.phone, `%${search}%`),
        ilike(schema.applications.email ?? schema.applications.phone, `%${search}%`),
      )
    )
  }
  if (status) {
    conditions.push(eq(schema.applications.statusId, Number(status)))
  }

  const where = conditions.length > 0 ? and(...conditions) : undefined

  const [rows, statuses, total] = await Promise.all([
    db.select({
      id:              schema.applications.id,
      name:            schema.applications.name,
      phone:           schema.applications.phone,
      email:           schema.applications.email,
      comment:         schema.applications.comment,
      preferredTime:   schema.applications.preferredTime,
      source:          schema.applications.source,
      statusId:        schema.applications.statusId,
      courseId:        schema.applications.courseId,
      branchId:        schema.applications.branchId,
      courseName:      schema.applications.courseName,
      isPaid:          schema.applications.isPaid,
      paymentAmount:   schema.applications.paymentAmount,
      paymentReceipt:  schema.applications.paymentReceipt,
      age:             schema.applications.age,
      role:            schema.applications.role,
      createdAt:       schema.applications.createdAt,
    })
    .from(schema.applications)
    .where(where)
    .orderBy(desc(schema.applications.createdAt))
    .limit(limit)
    .offset(offset),

    db.select().from(schema.applicationStatuses).orderBy(schema.applicationStatuses.id),

    db.select({ id: schema.applications.id })
      .from(schema.applications)
      .where(where),
  ])

  return NextResponse.json({
    data:     rows,
    statuses,
    total:    total.length,
    page,
    limit,
    pages:    Math.ceil(total.length / limit),
  })
}
