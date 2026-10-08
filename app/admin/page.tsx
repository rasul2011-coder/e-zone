import { redirect } from 'next/navigation'

// /admin → redirect to login (or dashboard if already authenticated via middleware)
export default function AdminRootPage() {
  redirect('/admin/login')
}
