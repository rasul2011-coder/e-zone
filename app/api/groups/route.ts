import { NextResponse } from 'next/server'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

// Public endpoint — no auth needed
// GET /api/groups?courseId=N
export async function GET() {
  const rows = await db
    .select({
      id:        schema.courseSchedule.id,
      courseId:  schema.courseSchedule.courseId,
      branchId:  schema.courseSchedule.branchId,
      dayOfWeek: schema.courseSchedule.dayOfWeek,
      startTime: schema.courseSchedule.startTime,
      endTime:   schema.courseSchedule.endTime,
      format:    schema.courseSchedule.format,
      isActive:  schema.courseSchedule.isActive,
      courseName: schema.courses.name,
      branchName: schema.branches.name,
    })
    .from(schema.courseSchedule)
    .leftJoin(schema.courses,  (t) => eq(t.courseId, schema.courses.id))
    .leftJoin(schema.branches, (t) => eq(t.branchId, schema.branches.id))
    .where(eq(schema.courseSchedule.isActive, true))
    .orderBy(schema.courseSchedule.courseId, schema.courseSchedule.dayOfWeek)
    .catch(() => [])

  return NextResponse.json({ data: rows })
}
