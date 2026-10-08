import type { Metadata } from 'next'
import { getAdminSession } from '@/lib/admin/auth'
import { db, schema } from '@/lib/db'
import { count } from 'drizzle-orm'
import SeedButton from './_components/SeedButton'

export const metadata: Metadata = { title: 'Обзор' }

async function getStats() {
  const [applications, courses, teachers, branches] = await Promise.all([
    db.select({ count: count() }).from(schema.applications),
    db.select({ count: count() }).from(schema.courses),
    db.select({ count: count() }).from(schema.teachers),
    db.select({ count: count() }).from(schema.branches),
  ])

  return {
    applications: applications[0]?.count ?? 0,
    courses:      courses[0]?.count ?? 0,
    teachers:     teachers[0]?.count ?? 0,
    branches:     branches[0]?.count ?? 0,
  }
}

const STAT_CARDS = [
  {
    key: 'applications' as const,
    label: 'Заявки',
    color: 'from-orange-500/20 to-orange-500/5',
    border: 'border-orange-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
      </svg>
    ),
  },
  {
    key: 'courses' as const,
    label: 'Курсы',
    color: 'from-blue-500/20 to-blue-500/5',
    border: 'border-blue-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400">
        <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
      </svg>
    ),
  },
  {
    key: 'teachers' as const,
    label: 'Преподаватели',
    color: 'from-emerald-500/20 to-emerald-500/5',
    border: 'border-emerald-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
      </svg>
    ),
  },
  {
    key: 'branches' as const,
    label: 'Филиалы',
    color: 'from-violet-500/20 to-violet-500/5',
    border: 'border-violet-500/20',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-violet-400">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
]

export default async function AdminDashboardPage() {
  const [session, stats] = await Promise.all([getAdminSession(), getStats()])

  return (
    <div className="space-y-8 pb-10">
      {/* Greeting */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Добро пожаловать,{' '}
          <span className="text-orange-400">{session?.name ?? 'Администратор'}</span>
        </h1>
        <p className="mt-1 text-sm text-white/40">
          {new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_CARDS.map((card) => (
          <div
            key={card.key}
            className={`rounded-2xl border ${card.border} bg-gradient-to-br ${card.color} p-6`}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-white/50 mb-1">{card.label}</p>
                <p className="text-4xl font-bold text-white">{stats[card.key]}</p>
              </div>
              <div className="mt-1">{card.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions + seed */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white mb-4">Быстрые действия</h2>
          <div className="space-y-2">
            {[
              { href: '/admin/dashboard/teachers', label: 'Управление преподавателями', icon: '👨‍🏫' },
              { href: '/admin/dashboard/gallery',  label: 'Управление галереей',        icon: '🖼️' },
              { href: '/admin/dashboard/groups',   label: 'Расписание групп',           icon: '📅' },
              { href: '/admin/dashboard/branches', label: 'Управление филиалами',       icon: '🏢' },
            ].map(a => (
              <a key={a.href} href={a.href}
                className="flex items-center gap-3 rounded-xl border border-white/5 bg-white/[0.03] px-4 py-3 text-sm text-white/70 hover:bg-white/10 hover:text-white transition">
                <span className="text-base">{a.icon}</span>
                {a.label}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-auto text-white/30">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-semibold text-white mb-1">Начальные данные</h2>
          <p className="text-sm text-white/40 mb-4">
            Если таблицы преподавателей и галереи пусты — заполни их демо-данными одной кнопкой.
          </p>
          <SeedButton />
        </div>
      </div>
    </div>
  )
}
