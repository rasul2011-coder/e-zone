import { NextRequest, NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { getAdminSession } from '@/lib/admin/auth'
import { eq } from 'drizzle-orm'

// GET /api/admin/groups  — all groups (optionally ?courseId=N)
export async function GET(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const courseId = req.nextUrl.searchParams.get('courseId')

  let rows
  if (courseId) {
    rows = await db
      .select({
        id:        schema.courseSchedule.id,
        courseId:  schema.courseSchedule.courseId,
        branchId:  schema.courseSchedule.branchId,
        dayOfWeek: schema.courseSchedule.dayOfWeek,
        startTime: schema.courseSchedule.startTime,
        endTime:   schema.courseSchedule.endTime,
        format:    schema.courseSchedule.format,
        isActive:  schema.courseSchedule.isActive,
        teacherId: schema.courseSchedule.teacherId,
        startDate: schema.courseSchedule.startDate,
        endDate:   schema.courseSchedule.endDate,
        courseName: schema.courses.name,
        branchName: schema.branches.name,
      })
      .from(schema.courseSchedule)
      .leftJoin(schema.courses,  (t) => eq(t.courseId, schema.courses.id))
      .leftJoin(schema.branches, (t) => eq(t.branchId, schema.branches.id))
      .where(eq(schema.courseSchedule.courseId, Number(courseId)))
      .orderBy(schema.courseSchedule.dayOfWeek, schema.courseSchedule.startTime)
  } else {
    rows = await db
      .select({
        id:        schema.courseSchedule.id,
        courseId:  schema.courseSchedule.courseId,
        branchId:  schema.courseSchedule.branchId,
        dayOfWeek: schema.courseSchedule.dayOfWeek,
        startTime: schema.courseSchedule.startTime,
        endTime:   schema.courseSchedule.endTime,
        format:    schema.courseSchedule.format,
        isActive:  schema.courseSchedule.isActive,
        teacherId: schema.courseSchedule.teacherId,
        startDate: schema.courseSchedule.startDate,
        endDate:   schema.courseSchedule.endDate,
        courseName: schema.courses.name,
        branchName: schema.branches.name,
      })
      .from(schema.courseSchedule)
      .leftJoin(schema.courses,  (t) => eq(t.courseId, schema.courses.id))
      .leftJoin(schema.branches, (t) => eq(t.branchId, schema.branches.id))
      .orderBy(schema.courseSchedule.courseId, schema.courseSchedule.dayOfWeek)
  }

  return NextResponse.json({ data: rows })
}

// POST /api/admin/groups  — create a new group
export async function POST(req: NextRequest) {
  const session = await getAdminSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await req.json()

  if (!body.courseId || !body.branchId || !body.dayOfWeek || !body.startTime || !body.endTime) {
    return NextResponse.json({ error: 'Обязательные поля: courseId, branchId, dayOfWeek, startTime, endTime' }, { status: 400 })
  }

  const [inserted] = await db.insert(schema.courseSchedule).values({
    courseId:  Number(body.courseId),
    branchId:  Number(body.branchId),
    dayOfWeek: Number(body.dayOfWeek),
    startTime: body.startTime,
    endTime:   body.endTime,
    format:    body.format ?? 'offline',
    isActive:  body.isActive ?? true,
    teacherId: body.teacherId ? Number(body.teacherId) : null,
    startDate: body.startDate ?? null,
    endDate:   body.endDate ?? null,
  }).returning()

  return NextResponse.json({ data: inserted })
}
