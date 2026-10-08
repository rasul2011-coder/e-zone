import { NextResponse } from 'next/server'
import { getUserSession } from '@/lib/auth/user'
import { db, schema } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'

export async function GET() {
  const session = await getUserSession()
  if (!session) return NextResponse.json({ user: null })

  // Return user + their applications
  const applications = await db.select({
    id:          schema.applications.id,
    courseName:  schema.applications.courseName,
    statusId:    schema.applications.statusId,
    isPaid:      schema.applications.isPaid,
    createdAt:   schema.applications.createdAt,
  })
  .from(schema.applications)
  .where(eq(schema.applications.email, session.email))
  .orderBy(desc(schema.applications.createdAt))
  .limit(20)
  .catch(() => [])

  return NextResponse.json({
    user: {
      userId: session.userId,
      name:   session.name,
      email:  session.email,
      avatar: session.avatar,
    },
    applications,
  })
}
