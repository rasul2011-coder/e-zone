import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/admin/auth'
import SettingsClient from './_components/SettingsClient'

export const metadata: Metadata = { title: 'Настройки · Admin' }

export default async function SettingsPage() {
  const session = await getAdminSession()
  return <SettingsClient adminEmail={session?.email ?? ''} />
}
