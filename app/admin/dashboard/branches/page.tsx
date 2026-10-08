import type { Metadata } from 'next'
import BranchesClient from './_components/BranchesClient'
export const metadata: Metadata = { title: 'Филиалы · Admin' }
export default function BranchesPage() { return <BranchesClient /> }
