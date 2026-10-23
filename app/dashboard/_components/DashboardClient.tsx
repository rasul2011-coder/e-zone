'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  FileText, Settings, BookOpen, LogOut,
  User, Phone, Lock, CheckCircle, AlertCircle,
  Clock, XCircle, ChevronRight, Plus, MessageCircle, Palette, GraduationCap
} from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────
interface UserSession {
  userId: number
  name: string
  email: string
  phone?: string | null
  avatar?: string | null
}

interface Application {
  id: number
  courseName?: string | null
  isPaid?: boolean | null
  paymentAmount?: number | null
  statusId: number
  createdAt: Date | string
}

interface Status { id: number; name: string }

type Tab = 'applications' | 'settings' | 'courses'

// ─── Status config ────────────────────────────────────────────────────────────
const STATUS_CONFIG: Record<string, { color: string; icon: React.ReactNode }> = {
  'Новая':        { color: 'bg-blue-500/15 text-blue-400 border-blue-500/20',    icon: <Clock size={12} /> },
  'В обработке':  { color: 'bg-yellow-500/15 text-yellow-400 border-yellow-500/20', icon: <Clock size={12} /> },
  'Подтверждена': { color: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20', icon: <CheckCircle size={12} /> },
  'Отклонена':    { color: 'bg-red-500/15 text-red-400 border-red-500/20',       icon: <XCircle size={12} /> },
  'Завершена':    { color: 'bg-gray-500/15 text-gray-400 border-gray-500/20',    icon: <CheckCircle size={12} /> },
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function DashboardClient({
  session: initialSession,
  applications,
  statuses,
}: {
  session: UserSession
  applications: Application[]
  statuses: Status[]
}) {
  const router = useRouter()
  const [tab, setTab] = useState<Tab>('applications')
  const [session, setSession] = useState(initialSession)

  function statusName(id: number) {
    return statuses.find(s => s.id === id)?.name ?? 'Новая'
  }

  async function logout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/ru')
    router.refresh()
  }

  const activeApps = applications.filter(a => {
    const s = statusName(a.statusId)
    return s === 'Подтверждена' || s === 'В обработке'
  })

  // ─── Tabs config ────────────────────────────────────────────────────────────
  const tabs: { id: Tab; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'applications', label: 'Мои заявки',  icon: <FileText size={16} />, badge: applications.length || undefined },
    { id: 'settings',     label: 'Настройки',   icon: <Settings size={16} /> },
    { id: 'courses',      label: 'Курсы',        icon: <BookOpen size={16} /> },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">

      {/* ─── Top nav ─────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3 md:px-8">
          <Link href="/ru" className="text-lg font-extrabold tracking-tight text-[var(--text)]">
            English<span className="text-orange-500">Zone</span>
          </Link>
          <div className="flex items-center gap-3">
            {/* Avatar */}
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-500 text-sm font-bold text-white overflow-hidden">
              {session.avatar
                ? <img src={session.avatar} alt={session.name} className="h-9 w-9 object-cover" />
                : session.name.charAt(0).toUpperCase()}
            </div>
            <div className="hidden sm:block leading-tight">
              <p className="text-sm font-semibold text-[var(--text)]">{session.name}</p>
              <p className="text-xs text-[var(--text-subtle)]">{session.email}</p>
            </div>
            <button onClick={logout}
              className="ml-1 flex items-center gap-1.5 rounded-xl border border-[var(--border)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-red-500/40 hover:text-red-500 transition">
              <LogOut size={13} />
              <span className="hidden sm:inline">Выйти</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8">

        {/* ─── Welcome + stats ─────────────────────────────────────────────── */}
        <div className="mb-8">
          <h1 className="text-2xl font-extrabold text-[var(--text)]">
            Добро пожаловать,{' '}
            <span className="text-orange-500">{session.name.split(' ')[0]}</span> 👋
          </h1>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Ваш личный кабинет English Zone</p>

          <div className="mt-5 grid grid-cols-3 gap-3 sm:gap-4">
            {[
              { label: 'Заявок',          value: applications.length, color: 'text-orange-500', bg: 'bg-orange-500/10' },
              { label: 'Активных',         value: activeApps.length,   color: 'text-blue-400',   bg: 'bg-blue-500/10' },
              { label: 'Оплачено',         value: applications.filter(a => a.isPaid).length, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
            ].map(s => (
              <div key={s.label}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 sm:p-5">
                <p className={`text-2xl sm:text-3xl font-extrabold ${s.color}`}>{s.value}</p>
                <p className="mt-0.5 text-xs sm:text-sm text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Tabs ────────────────────────────────────────────────────────── */}
        <div className="mb-6 flex gap-1 rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] p-1">
          {tabs.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={[
                'relative flex flex-1 items-center justify-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200',
                tab === t.id
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                  : 'text-[var(--text-muted)] hover:text-[var(--text)]',
              ].join(' ')}
            >
              {t.icon}
              <span className="hidden sm:inline">{t.label}</span>
              {t.badge !== undefined && tab !== t.id && (
                <span className="absolute right-2 top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
                  {t.badge}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ─── Tab: Applications ───────────────────────────────────────────── */}
        {tab === 'applications' && (
          <ApplicationsTab
            applications={applications}
            statuses={statuses}
            statusName={statusName}
          />
        )}

        {/* ─── Tab: Settings ───────────────────────────────────────────────── */}
        {tab === 'settings' && (
          <SettingsTab
            session={session}
            onUpdate={(updated) => setSession(prev => ({ ...prev, ...updated }))}
          />
        )}

        {/* ─── Tab: Courses ────────────────────────────────────────────────── */}
        {tab === 'courses' && <CoursesTab />}
      </div>
    </div>
  )
}

// ─── Applications Tab ─────────────────────────────────────────────────────────
function ApplicationsTab({
  applications,
  statusName,
}: {
  applications: Application[]
  statuses: Status[]
  statusName: (id: number) => string
}) {
  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text)]">Мои заявки</h2>
        <Link href="/ru/apply"
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
          <Plus size={15} />
          Новая заявка
        </Link>
      </div>

      {applications.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[var(--border)] bg-[var(--bg-alt)] px-6 py-14 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-500/10">
            <FileText size={28} className="text-orange-500" />
          </div>
          <p className="font-semibold text-[var(--text)]">Заявок пока нет</p>
          <p className="mt-1 text-sm text-[var(--text-muted)]">Запишитесь на пробный урок и начните учить английский</p>
          <Link href="/ru/apply"
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
            Записаться на урок
            <ChevronRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {applications.map(app => {
            const sName = statusName(app.statusId)
            const cfg = STATUS_CONFIG[sName] ?? { color: 'bg-gray-500/10 text-gray-400 border-gray-500/20', icon: <Clock size={12} /> }
            return (
              <div key={app.id}
                className="flex items-center justify-between gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 transition hover:border-orange-500/20 hover:shadow-sm">
                <div className="flex min-w-0 items-center gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10">
                    <BookOpen size={18} className="text-orange-500" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[var(--text)]">
                      {app.courseName || 'Курс не указан'}
                    </p>
                    <p className="mt-0.5 text-xs text-[var(--text-subtle)]">
                      {new Date(app.createdAt).toLocaleDateString('ru-RU', {
                        day: 'numeric', month: 'long', year: 'numeric'
                      })}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                  {app.isPaid && (
                    <span className="flex items-center gap-1 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-xs font-medium text-emerald-400">
                      <CheckCircle size={10} />
                      Оплачено{app.paymentAmount ? ` · ${app.paymentAmount.toLocaleString()} с` : ''}
                    </span>
                  )}
                  <span className={`flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-medium ${cfg.color}`}>
                    {cfg.icon}
                    {sName}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Settings Tab ─────────────────────────────────────────────────────────────
function SettingsTab({
  session,
  onUpdate,
}: {
  session: UserSession
  onUpdate: (data: Partial<UserSession>) => void
}) {
  const [name, setName]     = useState(session.name)
  const [phone, setPhone]   = useState(session.phone ?? '')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const [curPwd, setCurPwd]   = useState('')
  const [newPwd, setNewPwd]   = useState('')
  const [confirmPwd, setConfirmPwd] = useState('')
  const [pwdSaving, setPwdSaving]   = useState(false)
  const [pwdMsg, setPwdMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const inp = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
  const lbl = 'mb-1.5 block text-sm font-medium text-[var(--text-muted)]'

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true); setSaveMsg(null)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone }),
      })
      const d = await res.json()
      if (!res.ok) { setSaveMsg({ type: 'err', text: d.error }); return }
      onUpdate({ name, phone })
      setSaveMsg({ type: 'ok', text: 'Профиль обновлён' })
    } catch {
      setSaveMsg({ type: 'err', text: 'Ошибка соединения' })
    } finally {
      setSaving(false)
    }
  }

  async function savePassword(e: React.FormEvent) {
    e.preventDefault()
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'err', text: 'Пароли не совпадают' }); return }
    setPwdSaving(true); setPwdMsg(null)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: curPwd, newPassword: newPwd }),
      })
      const d = await res.json()
      if (!res.ok) { setPwdMsg({ type: 'err', text: d.error }); return }
      setCurPwd(''); setNewPwd(''); setConfirmPwd('')
      setPwdMsg({ type: 'ok', text: 'Пароль изменён' })
    } catch {
      setPwdMsg({ type: 'err', text: 'Ошибка соединения' })
    } finally {
      setPwdSaving(false)
    }
  }

  return (
    <div className="space-y-6">

      {/* Profile card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <User size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text)]">Личные данные</h3>
            <p className="text-xs text-[var(--text-muted)]">Имя и контактный телефон</p>
          </div>
        </div>

        <form onSubmit={saveProfile} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Имя</label>
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input className={inp + ' pl-10'} value={name} onChange={e => setName(e.target.value)} required placeholder="Ваше имя" />
              </div>
            </div>
            <div>
              <label className={lbl}>Телефон</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--text-subtle)]" />
                <input className={inp + ' pl-10'} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+996 XXX XXX XXX" type="tel" />
              </div>
            </div>
          </div>

          <div>
            <label className={lbl}>Email</label>
            <input className={inp + ' opacity-60 cursor-not-allowed'} value={session.email} disabled />
            <p className="mt-1 text-xs text-[var(--text-subtle)]">Email нельзя изменить</p>
          </div>

          {saveMsg && (
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              saveMsg.type === 'ok'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                : 'border-red-500/20 bg-red-500/10 text-red-500'
            }`}>
              {saveMsg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {saveMsg.text}
            </div>
          )}

          <button type="submit" disabled={saving}
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
        </form>
      </div>

      {/* Password card */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-500/10">
            <Lock size={20} className="text-orange-500" />
          </div>
          <div>
            <h3 className="font-bold text-[var(--text)]">Смена пароля</h3>
            <p className="text-xs text-[var(--text-muted)]">Минимум 6 символов</p>
          </div>
        </div>

        <form onSubmit={savePassword} className="space-y-4">
          <div>
            <label className={lbl}>Текущий пароль</label>
            <input className={inp} type="password" value={curPwd} onChange={e => setCurPwd(e.target.value)} required placeholder="••••••••" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={lbl}>Новый пароль</label>
              <input className={inp} type="password" value={newPwd} onChange={e => setNewPwd(e.target.value)} required placeholder="••••••••" minLength={6} />
            </div>
            <div>
              <label className={lbl}>Повторите пароль</label>
              <input className={inp} type="password" value={confirmPwd} onChange={e => setConfirmPwd(e.target.value)} required placeholder="••••••••" />
            </div>
          </div>

          {pwdMsg && (
            <div className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm ${
              pwdMsg.type === 'ok'
                ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-500'
                : 'border-red-500/20 bg-red-500/10 text-red-500'
            }`}>
              {pwdMsg.type === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
              {pwdMsg.text}
            </div>
          )}

          <button type="submit" disabled={pwdSaving}
            className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
            {pwdSaving ? 'Меняем...' : 'Изменить пароль'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ─── Courses Tab ──────────────────────────────────────────────────────────────
function CoursesTab() {
  const courses = [
    {
      name: 'General English',
      desc: 'Разговорный и деловой английский для взрослых. Уровни от Beginner до Upper-Intermediate.',
      price: 3500,
      age: '16+',
      duration: '3–6 месяцев',
      icon: MessageCircle,
      color: 'border-orange-500/30 bg-orange-500/5',
      iconColor: 'text-orange-500',
      tag: 'Популярный',
      tagColor: 'bg-orange-500/10 text-orange-500',
      href: '/ru/courses/general-english',
    },
    {
      name: 'Kids Club',
      desc: 'Английский для детей в игровой форме. Развиваем навыки через песни, игры и творчество.',
      price: 3000,
      age: '5–15 лет',
      duration: 'Весь учебный год',
      icon: Palette,
      color: 'border-blue-500/30 bg-blue-500/5',
      iconColor: 'text-blue-400',
      tag: 'Для детей',
      tagColor: 'bg-blue-500/10 text-blue-400',
      href: '/ru/courses/kids-club',
    },
    {
      name: 'IELTS Prep',
      desc: 'Структурированная подготовка к IELTS. Разбираем все 4 навыка с актуальными материалами.',
      price: 5500,
      age: '14+',
      duration: '2–4 месяца',
      icon: GraduationCap,
      color: 'border-violet-500/30 bg-violet-500/5',
      iconColor: 'text-violet-400',
      tag: 'Для экзамена',
      tagColor: 'bg-violet-500/10 text-violet-400',
      href: '/ru/courses/ielts-prep',
    },
  ]

  return (
    <div>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-lg font-bold text-[var(--text)]">Наши курсы</h2>
        <Link href="/ru/apply"
          className="flex items-center gap-1.5 rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/20">
          <Plus size={15} />
          Записаться
        </Link>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {courses.map(c => {
          const Icon = c.icon
          return (
            <Link key={c.name} href={c.href}
              className={`group flex flex-col rounded-2xl border p-5 transition hover:-translate-y-0.5 hover:shadow-lg ${c.color}`}>
              <div className="mb-3 flex items-start justify-between">
                <div className={`flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--bg-card)] ${c.iconColor}`}>
                  <Icon size={22} />
                </div>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.tagColor}`}>
                  {c.tag}
                </span>
              </div>
              <p className="font-bold text-[var(--text)]">{c.name}</p>
              <p className="mt-1 flex-1 text-xs leading-relaxed text-[var(--text-muted)]">{c.desc}</p>
              <div className="mt-4 space-y-1 border-t border-[var(--border)] pt-3">
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-subtle)]">Возраст</span>
                  <span className="font-medium text-[var(--text)]">{c.age}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-subtle)]">Длительность</span>
                  <span className="font-medium text-[var(--text)]">{c.duration}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-[var(--text-subtle)]">Стоимость</span>
                  <span className={`font-bold ${c.iconColor}`}>от {c.price.toLocaleString()} сом/мес</span>
                </div>
              </div>
              <div className={`mt-3 flex items-center justify-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-medium transition ${c.color} group-hover:opacity-80`}>
                Подробнее
                <ChevronRight size={12} />
              </div>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
