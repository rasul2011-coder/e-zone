import { redirect } from 'next/navigation'
import { getAdminSession } from '@/lib/admin/auth'
import AdminSidebar from './_components/AdminSidebar'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getAdminSession()
  if (!session) redirect('/admin/login')

  return (
    <div className="flex h-screen bg-[#0f1d35]" style={{ overflow: 'hidden' }}>
      <AdminSidebar adminName={session.name} adminEmail={session.email} />

      {/* Page content — scrollable, no top bar */}
      <main
        className="flex-1 min-w-0 px-6 py-6 md:px-8"
        style={{ overflowY: 'auto', overflowX: 'hidden' }}
      >
        {children}
      </main>
    </div>
  )
}
