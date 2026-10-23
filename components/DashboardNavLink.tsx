'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import { LayoutDashboard } from 'lucide-react'

interface Props {
  locale: string
  isDark: boolean
}

export default function DashboardNavLink({ locale, isDark }: Props) {
  const [loggedIn, setLoggedIn] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setLoggedIn(!!d.user))
      .catch(() => setLoggedIn(false))
  }, [pathname])

  if (!loggedIn) return null

  const isActive = pathname === '/dashboard'
  const isRu = locale !== 'kg'

  return (
    <Link
      href="/dashboard"
      className={[
        'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
        isActive
          ? 'bg-orange-500 text-white'
          : isDark
            ? 'text-white/70 hover:bg-white/10 hover:text-white'
            : 'text-gray-700 hover:bg-gray-100',
      ].join(' ')}
    >
      <LayoutDashboard size={15} />
      {isRu ? 'Кабинет' : 'Кабинет'}
    </Link>
  )
}
