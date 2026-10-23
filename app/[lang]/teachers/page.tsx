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
  const t = await getDictionaryByLocale(lang as Locale, 'teachers')
  return { title: `${t.title} · English Zone` }
}

export default async function TeachersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'teachers'),
    getDictionary(locale, 'common'),
  ])

  const teachers = await db
    .select()
    .from(schema.teachers)
    .where(eq(schema.teachers.isActive, true))
    .orderBy(schema.teachers.sortOrder)
    .catch(() => [])

  // Placeholder teachers when DB is empty
  const PLACEHOLDER = [
    { id: 1, name: 'Айнур Бекова',      slug: 'ainur-bekova',      position: 'IELTS Teacher',       specialization: 'IELTS Preparation',            experienceYears: 5, photo: '/teachers/teacher-1.jpg' },
    { id: 2, name: 'Тимур Осмонов',     slug: 'timur-osmonov',     position: 'IELTS Teacher',       specialization: 'IELTS Preparation',            experienceYears: 4, photo: '/teachers/teacher-2.jpg' },
    { id: 3, name: 'Гульнара Сейткали', slug: 'gulnara-seitkali',  position: 'Kids Club Teacher',   specialization: 'English for Children (5–15)',  experienceYears: 4, photo: '/teachers/teacher-3.jpg' },
    { id: 4, name: 'Данияр Жумабеков',  slug: 'daniyar-zhumabekov',position: 'Teacher',             specialization: 'General English, Business English', experienceYears: 3, photo: '/teachers/teacher-4.jpg' },
  ]

  const list = teachers.length > 0 ? teachers : PLACEHOLDER

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
      <section className="py-16 bg-gradient-to-b from-orange-50 to-[var(--bg)] relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#f97316 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-600">{t.title}</span>
          <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-[var(--text-muted)] max-w-xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {list.length === 0 ? (
            <p className="text-center text-[var(--text-muted)]">{t.empty}</p>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((teacher) => (
                <div key={teacher.id}
                  className="group flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:border-orange-500/30 hover:shadow-lg transition">
                  {/* Photo / avatar */}
                  <div className="card-header-gradient flex items-center justify-center h-40">
                    {teacher.photo ? (
                      <img src={teacher.photo} alt={teacher.name} className="h-28 w-28 rounded-full object-cover border-4 border-white/20" />
                    ) : (
                      (() => {
                        const AVATAR_PALETTE = [
                          'bg-orange-500/20 text-orange-600 dark:text-orange-300 border-orange-500/20',
                          'bg-blue-500/20 text-blue-600 dark:text-blue-300 border-blue-500/20',
                          'bg-emerald-500/20 text-emerald-600 dark:text-emerald-300 border-emerald-500/20',
                          'bg-violet-500/20 text-violet-600 dark:text-violet-300 border-violet-500/20',
                          'bg-pink-500/20 text-pink-600 dark:text-pink-300 border-pink-500/20',
                          'bg-yellow-500/20 text-yellow-600 dark:text-yellow-300 border-yellow-500/20',
                        ]
                        const c = AVATAR_PALETTE[teacher.id % AVATAR_PALETTE.length]
                        return (
                          <div className={`flex h-28 w-28 items-center justify-center rounded-full border-4 text-4xl font-bold ${c}`}>
                            {teacher.name.charAt(0).toUpperCase()}
                          </div>
                        )
                      })()
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-[var(--text)]">{teacher.name}</h3>
                    {teacher.position && (
                      <p className="mt-0.5 text-sm font-medium text-orange-500">{teacher.position}</p>
                    )}
                    {teacher.specialization && (
                      <div className="mt-2 flex items-start gap-1.5 text-sm text-[var(--text-muted)]">
                        <span className="shrink-0 text-[var(--text-subtle)] mt-0.5">
                          <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
                        </span>
                        <span>{teacher.specialization}</span>
                      </div>
                    )}
                    {teacher.experienceYears != null && (
                      <p className="mt-2 text-xs text-[var(--text-subtle)]">
                        {t.card.experience.replace('{years}', String(teacher.experienceYears))}
                      </p>
                    )}
                    <div className="mt-auto pt-4">
                      <Link href={`/${locale}/teachers/${teacher.slug}`}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:border-orange-500/40 hover:text-orange-500 transition">
                        {t.card.view_profile}
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
