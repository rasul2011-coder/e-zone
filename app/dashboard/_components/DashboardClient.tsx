'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface UserSession { userId: number; name: string; email: string; avatar?: string | null }
interface Application {
  id: number; courseName?: string | null
  isPaid?: boolean | null; paymentAmount?: number | null
  statusId: number; createdAt: Date | string
}
interface Status { id: number; name: string }

const STATUS_COLORS: Record<string, string> = {
  'Новая':        'bg-blue-500/15 text-blue-500',
  'В обработке':  'bg-yellow-500/15 text-yellow-600',
  'Подтверждена': 'bg-emerald-500/15 text-emerald-600',
  'Отклонена':    'bg-red-500/15 text-red-500',
  'Завершена':    'bg-gray-500/15 text-gray-500',
}

export default function DashboardClient({
  session,
  applications,
  statuses,
}: {
  session:      UserSession
  applications: Application[]
  statuses:     Status[]
}) {
  const router = useRouter()

  function statusName(id: number) {
    return statuses.find(s => s.id === id)?.name ?? '—'
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/ru')
    router.refresh()
  }

  const paidCount = applications.filter(a => a.isPaid).length

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Header bar */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-5xl px-4 py-4 md:px-8 flex items-center justify-between gap-4">
          <Link href="/ru" className="text-xl font-extrabold tracking-tight text-[var(--text)]">
            English<span className="text-orange-500">Zone</span>
          </Link>
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white shrink-0">
              {session.avatar
                ? <img src={session.avatar} alt={session.name} className="h-9 w-9 rounded-full object-cover" />
                : session.name.charAt(0).toUpperCase()
              }
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-[var(--text)]">{session.name}</p>
              <p className="text-xs text-[var(--text-subtle)]">{session.email}</p>
            </div>
            <button onClick={logout}
              className="ml-2 flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-2 text-xs text-[var(--text-muted)] hover:bg-[var(--bg-alt)] transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              Выйти
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-10 md:px-8 space-y-8">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-extrabold text-[var(--text)]">
            Добро пожаловать, <span className="text-orange-500">{session.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Ваш личный кабинет English Zone</p>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Заявок',         value: applications.length, color: 'text-orange-500' },
            { label: 'Оплачено',       value: paidCount,           color: 'text-emerald-500' },
            { label: 'Активных курсов', value: applications.filter(a => {
                const s = statusName(a.statusId)
                return s === 'Подтверждена' || s === 'В обработке'
              }).length,               color: 'text-blue-500' },
          ].map(s => (
            <div key={s.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
              style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.05)' }}>
              <p className={`text-3xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-sm text-[var(--text-muted)] mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* My applications */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--text)]">Мои заявки</h2>
            <Link href="/ru/register"
              className="flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              Записаться на курс
            </Link>
          </div>

          {applications.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-alt)] p-12 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                </svg>
              </div>
              <p className="font-semibold text-[var(--text)] mb-1">Заявок пока нет</p>
              <p className="text-sm text-[var(--text-muted)] mb-5">Запишитесь на курс и начните учить английский</p>
              <Link href="/ru/register"
                className="inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
                Записаться на курс
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {applications.map(app => {
                const sName = statusName(app.statusId)
                const colorCls = STATUS_COLORS[sName] ?? 'bg-gray-500/10 text-gray-500'
                return (
                  <div key={app.id}
                    className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4"
                    style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.04)' }}>
                    <div className="flex items-center gap-4 min-w-0">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-[var(--text)] truncate">
                          {app.courseName || 'Курс не указан'}
                        </p>
                        <p className="text-xs text-[var(--text-subtle)] mt-0.5">
                          {new Date(app.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {app.isPaid && (
                        <span className="flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-1 text-xs font-semibold text-emerald-600">
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                          Оплачено
                          {app.paymentAmount && ` · ${app.paymentAmount.toLocaleString()} сом`}
                        </span>
                      )}
                      <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colorCls}`}>
                        {sName}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Available courses */}
        <div>
          <h2 className="text-lg font-bold text-[var(--text)] mb-4">Наши курсы</h2>
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { name: 'General English', price: 3500, desc: 'Разговорный английский, 16+', color: 'border-orange-500/20 bg-orange-500/5', icon: '🗣️', href: '/ru/courses/general-english' },
              { name: 'Kids Club',       price: 3000, desc: 'Для детей 5–15 лет',          color: 'border-blue-500/20 bg-blue-500/5',   icon: '🎨', href: '/ru/courses/kids-club' },
              { name: 'IELTS Prep',      price: 5500, desc: 'Подготовка к IELTS, 14+',     color: 'border-violet-500/20 bg-violet-500/5', icon: '🎓', href: '/ru/courses/ielts-prep' },
            ].map(c => (
              <Link key={c.name} href={c.href}
                className={`flex flex-col rounded-2xl border p-5 hover:shadow-md transition ${c.color}`}>
                <span className="text-2xl mb-3">{c.icon}</span>
                <p className="font-bold text-[var(--text)]">{c.name}</p>
                <p className="text-xs text-[var(--text-muted)] mt-0.5 mb-3">{c.desc}</p>
                <p className="mt-auto text-sm font-semibold text-orange-500">от {c.price.toLocaleString()} сом/мес</p>
              </Link>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
