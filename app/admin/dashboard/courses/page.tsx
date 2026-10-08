import type { Metadata } from 'next'
import CoursesClient from './_components/CoursesClient'

export const metadata: Metadata = { title: 'Курсы · Admin' }

export default function CoursesPage() {
  return <CoursesClient />
}
