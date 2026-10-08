import type { Metadata } from 'next'
import { Suspense } from 'react'
import ApplicationsClient from './_components/ApplicationsClient'

export const metadata: Metadata = { title: 'Заявки · Admin' }

export default function ApplicationsPage() {
  return (
    <Suspense fallback={<div className="text-white/50 py-10 text-center">Загрузка...</div>}>
      <ApplicationsClient />
    </Suspense>
  )
}
