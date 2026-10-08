import type { Metadata } from 'next'
import GroupsClient from './_components/GroupsClient'
export const metadata: Metadata = { title: 'Группы · Admin' }
export default function GroupsPage() { return <GroupsClient /> }
