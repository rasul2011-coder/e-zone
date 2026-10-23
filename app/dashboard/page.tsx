import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth/user'
import { db, schema } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import DashboardClient from './_components/DashboardClient'

export default async function DashboardPage() {
  const session = await getUserSession()
  if (!session) redirect('/ru/login')

  // Load full user data (to get phone field)
  const [userData] = await db
    .select({ name: schema.users.name, email: schema.users.email, avatar: schema.users.avatar, phone: schema.users.phone })
    .from(schema.users)
    .where(eq(schema.users.id, session.userId))
    .limit(1)
    .catch(() => [])

  // Load user's applications (matched by email)
  const applications = await db
    .select({
      id:            schema.applications.id,
      courseName:    schema.applications.courseName,
      isPaid:        schema.applications.isPaid,
      paymentAmount: schema.applications.paymentAmount,
      statusId:      schema.applications.statusId,
      createdAt:     schema.applications.createdAt,
    })
    .from(schema.applications)
    .where(eq(schema.applications.email, session.email))
    .orderBy(desc(schema.applications.createdAt))
    .catch(() => [])

  // Load statuses
  const statuses = await db
    .select()
    .from(schema.applicationStatuses)
    .catch(() => [])

  return (
    <DashboardClient
      session={{
        userId: session.userId,
        name:   userData?.name  ?? session.name,
        email:  userData?.email ?? session.email,
        avatar: userData?.avatar ?? session.avatar,
        phone:  userData?.phone ?? null,
      }}
      applications={applications}
      statuses={statuses}
    />
  )
}
