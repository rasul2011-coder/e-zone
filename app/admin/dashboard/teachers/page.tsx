import type { Metadata } from 'next'
import TeachersClient from './_components/TeachersClient'
export const metadata: Metadata = { title: 'Преподаватели · Admin' }
export default function TeachersPage() { return <TeachersClient /> }
