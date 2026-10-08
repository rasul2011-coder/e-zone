import { redirect } from 'next/navigation'
import { getUserSession } from '@/lib/auth/user'
import { db, schema } from '@/lib/db'
import { eq, desc } from 'drizzle-orm'
import Link from 'next/link'
import DashboardClient from './_components/DashboardClient'

export default async function DashboardPage() {
  const session = await getUserSession()
  if (!session) redirect('/ru/login')

  // Load user's applications
  const applications = await db.select({
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
  const statuses = await db.select().from(schema.applicationStatuses).catch(() => [])

  return <DashboardClient session={session} applications={applications} statuses={statuses} />
}
