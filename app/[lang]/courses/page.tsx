import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'courses')
  return { title: `${t.title} · English Zone` }
}

const COURSES = [
  {
    slug: 'general-english',
    emoji: '🗣️',
    accent: 'orange',
    ageFrom: 16, ageTo: null,
    price: 3500,
  },
  {
    slug: 'kids-club',
    emoji: '🎨',
    accent: 'blue',
    ageFrom: 5, ageTo: 15,
    price: 3000,
  },
  {
    slug: 'ielts-prep',
    emoji: '🎓',
    accent: 'violet',
    ageFrom: 14, ageTo: null,
    price: 5500,
  },
]

const ACCENT: Record<string, { border: string; tag: string; btn: string; glow: string }> = {
  orange: {
    border: 'border-orange-500/30',
    tag:    'bg-orange-500/10 text-orange-500',
    btn:    'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
    glow:   'group-hover:shadow-orange-500/10',
  },
  blue: {
    border: 'border-blue-500/30',
    tag:    'bg-blue-500/10 text-blue-500',
    btn:    'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30',
    glow:   'group-hover:shadow-blue-500/10',
  },
  violet: {
    border: 'border-violet-500/30',
    tag:    'bg-violet-500/10 text-violet-500',
    btn:    'bg-violet-600 hover:bg-violet-700 shadow-violet-500/30',
    glow:   'group-hover:shadow-violet-500/10',
  },
}

export default async function CoursesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc, tg, tk, ti] = await Promise.all([
    getDictionary(locale, 'courses'),
    getDictionary(locale, 'common'),
    getDictionary(locale, 'course-general'),
    getDictionary(locale, 'course-kids'),
    getDictionary(locale, 'course-ielts'),
  ])

  // Fetch groups (course_schedule) from DB
  const groups = await db
    .select({
      id:         schema.courseSchedule.id,
      courseId:   schema.courseSchedule.courseId,
      branchId:   schema.courseSchedule.branchId,
      dayOfWeek:  schema.courseSchedule.dayOfWeek,
      startTime:  schema.courseSchedule.startTime,
      endTime:    schema.courseSchedule.endTime,
      format:     schema.courseSchedule.format,
      isActive:   schema.courseSchedule.isActive,
      courseName: schema.courses.name,
      branchName: schema.branches.name,
    })
    .from(schema.courseSchedule)
    .leftJoin(schema.courses,  (t) => eq(t.courseId, schema.courses.id))
    .leftJoin(schema.branches, (t) => eq(t.branchId, schema.branches.id))
    .where(eq(schema.courseSchedule.isActive, true))
    .orderBy(schema.courseSchedule.courseId, schema.courseSchedule.dayOfWeek)
    .catch(() => [])

  // Placeholder 10 groups when DB is empty
  type GroupRow = {
    id: number; courseName?: string | null; branchName?: string | null
    dayOfWeek: number; startTime: string; endTime: string; format: string
  }

  const PLACEHOLDER_GROUPS: GroupRow[] = [
    { id: 1,  courseName: 'General English', branchName: 'Филиал на Чуй',       dayOfWeek: 1, startTime: '09:00', endTime: '10:30', format: 'offline' },
    { id: 2,  courseName: 'General English', branchName: 'Филиал на Чуй',       dayOfWeek: 3, startTime: '09:00', endTime: '10:30', format: 'offline' },
    { id: 3,  courseName: 'General English', branchName: 'Филиал на Манас',     dayOfWeek: 2, startTime: '11:00', endTime: '12:30', format: 'offline' },
    { id: 4,  courseName: 'General English', branchName: 'Филиал на Ибраимова', dayOfWeek: 5, startTime: '18:00', endTime: '19:30', format: 'online'  },
    { id: 5,  courseName: 'IELTS Prep',      branchName: 'Филиал на Чуй',       dayOfWeek: 2, startTime: '14:00', endTime: '16:00', format: 'offline' },
    { id: 6,  courseName: 'IELTS Prep',      branchName: 'Филиал на Ибраимова', dayOfWeek: 4, startTime: '14:00', endTime: '16:00', format: 'offline' },
    { id: 7,  courseName: 'IELTS Prep',      branchName: 'Филиал на Манас',     dayOfWeek: 6, startTime: '10:00', endTime: '12:00', format: 'offline' },
    { id: 8,  courseName: 'Kids Club',       branchName: 'Филиал на Чуй',       dayOfWeek: 1, startTime: '15:00', endTime: '16:00', format: 'offline' },
    { id: 9,  courseName: 'Kids Club',       branchName: 'Филиал Асанбай',      dayOfWeek: 3, startTime: '15:00', endTime: '16:00', format: 'offline' },
    { id: 10, courseName: 'Kids Club',       branchName: 'Филиал Асанбай',      dayOfWeek: 5, startTime: '15:00', endTime: '16:00', format: 'offline' },
  ]

  const groupList: GroupRow[] = groups.length > 0 ? (groups as GroupRow[]) : PLACEHOLDER_GROUPS

  const DAYS: Record<number, string> = { 1:'Пн', 2:'Вт', 3:'Ср', 4:'Чт', 5:'Пт', 6:'Сб', 7:'Вс' }
  const FORMAT_LABEL: Record<string, string> = { offline: 'Офлайн', online: 'Онлайн', hybrid: 'Гибрид' }
  const FORMAT_COLOR: Record<string, string> = {
    offline: 'bg-blue-500/15 text-blue-400',
    online:  'bg-emerald-500/15 text-emerald-400',
    hybrid:  'bg-violet-500/15 text-violet-400',
  }
  const DAY_COLORS = [
    'bg-orange-500/20 text-orange-300',
    'bg-blue-500/20 text-blue-300',
    'bg-emerald-500/20 text-emerald-300',
    'bg-violet-500/20 text-violet-300',
    'bg-pink-500/20 text-pink-300',
    'bg-yellow-500/20 text-yellow-300',
    'bg-cyan-500/20 text-cyan-300',
  ]

  // Group by course name
  const byCourse: Record<string, GroupRow[]> = {}
  groupList.forEach(g => {
    const key = g.courseName ?? 'Другое'
    if (!byCourse[key]) byCourse[key] = []
    byCourse[key].push(g)
  })

  const courseDetails = [tg, tk, ti]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="section-hero py-16 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-80 w-80 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            {t.title}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto text-lg">{t.subtitle}</p>
        </div>
      </section>

      {/* Course cards */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 md:grid-cols-3">
            {COURSES.map((c, i) => {
              const detail = courseDetails[i]
              const ac = ACCENT[c.accent]
              const ageStr = c.ageTo
                ? t.card.age_range.replace('{from}', String(c.ageFrom)).replace('{to}', String(c.ageTo))
                : t.card.age_from.replace('{age}', String(c.ageFrom))
              const priceStr = t.card.price_from.replace('{price}', String(c.price))

              return (
                <div key={c.slug}
                  className={`group flex flex-col rounded-3xl border ${ac.border} bg-[var(--bg-card)] overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl ${ac.glow}`}>
                  {/* Top */}
                  <div className="flex items-start justify-between p-6 pb-0">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--bg-alt)] text-3xl">
                      {c.emoji}
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-bold ${ac.tag}`}>
                      {ageStr}
                    </span>
                  </div>

                  {/* Body */}
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-2xl font-extrabold text-[var(--text)] mb-3">{detail.title}</h2>
                    <p className="flex-1 text-sm leading-relaxed text-[var(--text-muted)] mb-6">
                      {detail.description}
                    </p>

                    {/* Schedule mini-table */}
                    <div className="mb-6 space-y-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] p-4">
                      {[
                        { label: detail.schedule.duration,   value: detail.schedule.duration_value },
                        { label: detail.schedule.frequency,  value: detail.schedule.frequency_value },
                        { label: detail.schedule.group_size, value: detail.schedule.group_size_value },
                      ].map((row) => (
                        <div key={row.label} className="flex items-center justify-between text-xs">
                          <span className="text-[var(--text-subtle)]">{row.label}</span>
                          <span className="font-semibold text-[var(--text)]">{row.value}</span>
                        </div>
                      ))}
                    </div>

                    {/* Price */}
                    <p className="mb-4 text-base font-bold text-[var(--text)]">{priceStr}</p>

                    <Link href={`/${locale}/courses/${c.slug}`}
                      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 ${ac.btn}`}>
                      {t.card.details}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Groups / Schedule ───────────────────────────────────── */}
          <div className="mt-16">
            <div className="text-center mb-10">
              <span className="inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400 mb-3">
                {locale === 'ru' ? 'Расписание' : 'Сабак убактысы'}
              </span>
              <h2 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">
                {locale === 'ru' ? 'Актуальные группы' : 'Учурдагы топтор'}
              </h2>
              <p className="mt-2 text-[var(--text-muted)] max-w-lg mx-auto text-sm">
                {locale === 'ru'
                  ? 'Выберите удобное время и запишитесь на пробный урок'
                  : 'Ыңгайлуу убакытты тандап, сынамык сабакка жазылыңыз'}
              </p>
            </div>

            <div className="space-y-8">
              {Object.entries(byCourse).map(([courseName, courseGroups]) => (
                <div key={courseName}>
                  <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-widest mb-3">{courseName}</h3>
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {courseGroups.map((g, idx) => (
                      <div key={g.id}
                        className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4 hover:border-orange-500/30 hover:shadow-md transition">
                        {/* Day badge + time */}
                        <div className="flex items-center gap-2 mb-3">
                          <span className={`flex h-9 w-9 items-center justify-center rounded-xl text-xs font-bold shrink-0 ${DAY_COLORS[(g.dayOfWeek - 1) % DAY_COLORS.length]}`}>
                            {DAYS[g.dayOfWeek]}
                          </span>
                          <div>
                            <p className="text-sm font-bold text-[var(--text)]">
                              {String(g.startTime).slice(0, 5)} – {String(g.endTime).slice(0, 5)}
                            </p>
                            <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${FORMAT_COLOR[g.format] ?? 'bg-white/10 text-white/50'}`}>
                              {FORMAT_LABEL[g.format] ?? g.format}
                            </span>
                          </div>
                        </div>
                        {/* Branch */}
                        <p className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
                          <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 shrink-0">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                          </svg>
                          {g.branchName ?? (locale === 'ru' ? 'Филиал уточняется' : 'Филиал так болот')}
                        </p>
                        {/* CTA */}
                        <Link href={`/${locale}/register`}
                          className="mt-auto flex w-full items-center justify-center gap-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 px-3 py-2 text-xs font-semibold text-orange-500 hover:bg-orange-500 hover:text-white transition">
                          {locale === 'ru' ? 'Записаться' : 'Жазылуу'}
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Apply CTA */}          <div className="mt-14 rounded-3xl section-hero p-8 md:p-12 text-center relative overflow-hidden">
            <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '24px 24px' }} />
            <div aria-hidden="true" className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
            <p className="relative text-sm font-semibold uppercase tracking-widest text-orange-400 mb-3">English Zone</p>
            <h3 className="relative text-2xl font-extrabold text-white sm:text-3xl mb-3">
              {locale === 'ru' ? 'Не можете выбрать курс?' : 'Курс тандай албай жатасызбы?'}
            </h3>
            <p className="relative text-white/60 mb-8 max-w-md mx-auto">
              {locale === 'ru'
                ? 'Запишитесь на бесплатное тестирование — мы сами определим ваш уровень и подберём программу'
                : 'Акысыз тестирлөөгө жазылыңыз — биз деңгээлиңизди аныктап, программаны тандайбыз'}
            </p>
            <Link href={`/${locale}/register`}
              className="relative inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
              {tc.cta.trial}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
