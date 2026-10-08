'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'

interface User {
  userId: number
  name:   string
  email:  string
  avatar?: string | null
}

interface Props {
  locale: string
  isDark: boolean
}

export default function AuthButton({ locale, isDark }: Props) {
  const [user,    setUser]    = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [open,    setOpen]    = useState(false)
  const router   = useRouter()
  const pathname = usePathname()
  const ref      = useRef<HTMLDivElement>(null)
  const isRu = locale !== 'kg'

  useEffect(() => {
    fetch('/api/auth/me')
      .then(r => r.json())
      .then(d => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [pathname])

  // Close dropdown on outside click
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    setUser(null); setOpen(false)
    router.push(`/${locale}`)
    router.refresh()
  }

  if (loading) {
    return (
      <div className={`hidden h-9 w-9 rounded-full lg:block animate-pulse ${isDark ? 'bg-white/10' : 'bg-gray-100'}`} />
    )
  }

  // ── Logged in ──────────────────────────────────────────────────────────────
  if (user) {
    return (
      <div ref={ref} className="relative hidden lg:block">
        <button
          onClick={() => setOpen(v => !v)}
          className={[
            'flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-medium transition',
            isDark
              ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
              : 'border-gray-200 bg-white text-gray-800 hover:bg-gray-50 shadow-sm',
          ].join(' ')}
          suppressHydrationWarning
        >
          {/* Avatar */}
          {user.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-6 w-6 rounded-full object-cover" />
          ) : (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
          )}
          <span className="max-w-[100px] truncate">{user.name.split(' ')[0]}</span>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            className={`transition-transform ${open ? 'rotate-180' : ''}`}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {/* Dropdown */}
        {open && (
          <div className={[
            'absolute right-0 top-full mt-2 w-52 rounded-2xl border shadow-xl overflow-hidden z-50',
            isDark ? 'bg-[#1a2a4a] border-white/10' : 'bg-white border-gray-100',
          ].join(' ')}>
            {/* User info */}
            <div className={`px-4 py-3 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <p className={`text-sm font-semibold truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</p>
              <p className={`text-xs truncate ${isDark ? 'text-white/40' : 'text-gray-400'}`}>{user.email}</p>
            </div>

            {/* Menu items */}
            <div className="py-1.5">
              <Link href="/dashboard" onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                </svg>
                {isRu ? 'Личный кабинет' : 'Жеке кабинет'}
              </Link>
              <Link href={`/${locale}/register`} onClick={() => setOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 text-sm transition ${isDark ? 'text-white/70 hover:bg-white/5 hover:text-white' : 'text-gray-700 hover:bg-gray-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/>
                </svg>
                {isRu ? 'Записаться на курс' : 'Курска жазылуу'}
              </Link>
            </div>

            <div className={`border-t py-1.5 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
              <button onClick={logout}
                className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition ${isDark ? 'text-red-400 hover:bg-white/5' : 'text-red-500 hover:bg-red-50'}`}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                {isRu ? 'Выйти' : 'Чыгуу'}
              </button>
            </div>
          </div>
        )}
      </div>
    )
  }

  // ── Not logged in ──────────────────────────────────────────────────────────
  return (
    <div className="hidden lg:flex items-center">
      <Link
        href={`/${locale}/signup`}
        className="rounded-full bg-orange-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-orange-600 shadow-sm"
      >
        {isRu ? 'Регистрация' : 'Каттоо'}
      </Link>
    </div>
  )
}
