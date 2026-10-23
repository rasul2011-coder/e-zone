import Link from 'next/link'
import Image from 'next/image'
import { getDictionary } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import { notFound } from 'next/navigation'
import type { Locale } from '@/app/i18n/config'
import TiltCard from '@/components/TiltCard'
import ReviewsMarquee from '@/components/ReviewsMarquee'
import InstallPWAButton from '@/components/InstallPWAButton'
import StatsBand from '@/components/StatsBand'
import { db, schema } from '@/lib/db'
import { eq, asc, count } from 'drizzle-orm'

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const t = await getDictionary(locale, 'landing')

  const COURSE_HREFS: Record<string, string> = {
    'General English': `/${locale}/courses/general-english`,
    'Kids Club':        `/${locale}/courses/kids-club`,
    'IELTS Prep':       `/${locale}/courses/ielts-prep`,
  }

  // ─── Load data from DB ──────────────────────────────────────────────────
  const [dbCourses, dbReviews, dbStats, branchCount, studentCount] = await Promise.all([
    // Featured / active courses
    db.select({
      id: schema.courses.id,
      name: schema.courses.name,
      slug: schema.courses.slug,
      shortDescription: schema.courses.shortDescription,
      price: schema.courses.price,
      duration: schema.courses.duration,
      ageFrom: schema.courses.ageFrom,
      ageTo: schema.courses.ageTo,
    })
      .from(schema.courses)
      .where(eq(schema.courses.isActive, true))
      .orderBy(asc(schema.courses.sortOrder))
      .limit(3)
      .catch(() => []),

    // Published reviews
    db.select({
      id: schema.reviews.id,
      name: schema.reviews.name,
      text: schema.reviews.text,
      rating: schema.reviews.rating,
    })
      .from(schema.reviews)
      .where(eq(schema.reviews.isPublished, true))
      .orderBy(asc(schema.reviews.sortOrder))
      .catch(() => []),

    // Statistics
    db.select()
      .from(schema.statistics)
      .where(eq(schema.statistics.isActive, true))
      .orderBy(asc(schema.statistics.sortOrder))
      .catch(() => []),

    // Count active branches
    db.select({ c: count() })
      .from(schema.branches)
      .where(eq(schema.branches.isActive, true))
      .catch(() => [{ c: 0 }]),

    // Count students (applications)
    db.select({ c: count() })
      .from(schema.applications)
      .catch(() => [{ c: 0 }]),
  ])

  // Build stats array — use DB data if available, fall back to i18n hardcode
  const STAT_GRADIENTS = [
    'linear-gradient(135deg,#f97316,#ea580c)',
    'linear-gradient(135deg,#3b82f6,#2563eb)',
    'linear-gradient(135deg,#8b5cf6,#7c3aed)',
    'linear-gradient(135deg,#10b981,#059669)',
  ]
  const statsData = dbStats.length >= 4
    ? dbStats.slice(0, 4).map((s, i) => ({
        value: s.title,
        label: s.description,
        gradient: STAT_GRADIENTS[i],
      }))
    : [
        { value: t.stats.students, label: t.stats.students_label, gradient: STAT_GRADIENTS[0] },
        { value: t.stats.years,    label: t.stats.years_label,    gradient: STAT_GRADIENTS[1] },
        { value: t.stats.branches, label: t.stats.branches_label, gradient: STAT_GRADIENTS[2] },
        { value: t.stats.success,  label: t.stats.success_label,  gradient: STAT_GRADIENTS[3] },
      ]

  // Build reviews array — use DB data if available, else fall back to i18n
  const reviewsData = dbReviews.length > 0
    ? dbReviews.map(r => ({
        name: r.name,
        course: '',
        text: r.text,
        rating: r.rating,
      }))
    : (t.reviews.items as Array<{ name: string; course: string; text: string; rating: number }>)

  // Build courses array — use DB data if available, else fall back to i18n
  type DbCourse = { id: number; name: string; slug: string; shortDescription: string; price: string | null; duration: string | null; ageFrom: number | null; ageTo: number | null }
  const coursesData: DbCourse[] | null = dbCourses.length > 0 ? (dbCourses as DbCourse[]) : null

  return (
    <>
      {/* ─── HERO ──────────────────────────────────────────────────────────── */}
      <section
        id="home"
        className="relative min-h-[92vh] overflow-hidden flex items-center bg-[var(--bg)]"
      >
        {/* Subtle dot pattern */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: 'radial-gradient(circle at 1px 1px, #f97316 1px, transparent 0)',
            backgroundSize: '36px 36px',
          }}
        />
        {/* Warm gradient orbs */}
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 -right-40 h-[600px] w-[600px] rounded-full bg-orange-400/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-40 -left-40 h-[500px] w-[500px] rounded-full bg-amber-400/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 py-24 md:px-8 lg:py-32">
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 lg:items-center">

            {/* Left copy */}
            <div className="max-w-2xl">
              {/* Badge */}
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-orange-500/30 bg-orange-500/10 px-4 py-1.5 text-sm font-medium text-orange-600">
                <span className="h-1.5 w-1.5 rounded-full bg-orange-500" />
                {t.hero.badge}
              </div>

              <h1 className="text-3xl font-extrabold leading-[1.15] tracking-tight text-[var(--text)] sm:text-4xl lg:text-5xl max-w-2xl">
                {t.hero.title}
              </h1>
              <p className="mt-6 text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl max-w-xl">
                {t.hero.subtitle}
              </p>

              <div className="mt-10 flex flex-wrap gap-4">
                <Link
                  href={`/${locale}/apply`}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-7 py-3.5 text-base font-semibold text-white shadow-lg shadow-orange-500/30 transition hover:bg-orange-600 hover:shadow-orange-500/40 active:scale-95"
                >
                  {t.hero.cta_primary}
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link
                  href={`/${locale}/courses`}
                  className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-7 py-3.5 text-base font-semibold text-[var(--text)] transition hover:border-orange-500/40 hover:bg-orange-500/5"
                >
                  {t.hero.cta_secondary}
                </Link>
              </div>
            </div>

            {/* Right — real photo collage */}
            <div className="relative hidden lg:flex justify-center">
              <div className="relative w-full max-w-sm">
                {/* Main photo card */}
                <div className="group relative overflow-hidden rounded-3xl border border-white/10 shadow-2xl cursor-pointer">
                  <Image
                    src="/image.png"
                    alt="English Zone"
                    width={800}
                    height={600}
                    className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-105"
                    sizes="400px"
                    priority
                  />
                  {/* Base gradient */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors duration-500" />
                  {/* Overlay text */}
                  <div className="absolute bottom-0 left-0 p-6 transition-transform duration-300 group-hover:-translate-y-1">
                    <p className="text-2xl font-extrabold text-white">Hello!</p>
                    <p className="text-base font-semibold text-orange-400">Speak freely.</p>
                  </div>
                  {/* Hover badge top-right */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white shadow-lg">
                      English Zone ✨
                    </span>
                  </div>
                </div>

                {/* Photo grid below */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ height: '120px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=400&q=80&fit=crop"
                      alt="Kids Club English lesson"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <p className="absolute bottom-2 left-2 text-xs font-semibold text-white/90">Kids Club</p>
                  </div>
                  <div className="relative overflow-hidden rounded-2xl border border-white/10" style={{ height: '120px' }}>
                    <Image
                      src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&q=80&fit=crop"
                      alt="IELTS preparation"
                      fill
                      className="object-cover"
                      sizes="200px"
                    />
                    <div className="absolute inset-0 bg-black/20" />
                    <p className="absolute bottom-2 left-2 text-xs font-semibold text-white/90">IELTS Prep</p>
                  </div>
                </div>


              </div>
            </div>
          </div>
        </div>

      </section>

      {/* ─── ADVANTAGES ────────────────────────────────────────────────────── */}
      <section id="advantages" className="py-20 md:py-28 bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-500 mb-4">
              {t.advantages.title}
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
              {t.advantages.title}
            </h2>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">
              {t.advantages.subtitle}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(t.advantages.items as Array<{ title: string; description: string }>).map((item, i) => {
              const ICONS = [
                // 0 — Graduation cap (опытные преподаватели)
                <svg key={0} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
                // 1 — Users / person circle (индивидуальный подход)
                <svg key={1} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M6 20v-2a6 6 0 0 1 12 0v2"/></svg>,
                // 2 — Clock (удобное расписание)
                <svg key={2} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                // 3 — Light bulb (современные методы)
                <svg key={3} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="9" y1="18" x2="15" y2="18"/><line x1="10" y1="22" x2="14" y2="22"/><path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"/></svg>,
                // 4 — Dollar sign (доступные цены)
                <svg key={4} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>,
                // 5 — Check circle (гарантия результата)
                <svg key={5} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>,
              ]
              return (
                <TiltCard key={i} intensity={10}>
                <div
                  className="group relative overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all duration-300 hover:border-orange-500/50 hover:-translate-y-1.5 hover:shadow-2xl hover:shadow-orange-500/15 h-full"
                  style={{ boxShadow: '0 1px 3px rgba(15,29,53,0.06), 0 2px 8px rgba(15,29,53,0.04)' }}
                >
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/10 text-orange-500 transition-all duration-300 group-hover:bg-orange-500 group-hover:text-white group-hover:scale-110 group-hover:shadow-lg group-hover:shadow-orange-500/30">
                    {ICONS[i] ?? ICONS[0]}
                  </div>
                  <h3 className="mb-2 text-lg font-bold text-[var(--text)]">{item.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.description}</p>

                  {/* Decorative corner */}
                  <div className="pointer-events-none absolute -bottom-6 -right-6 h-20 w-20 rounded-full bg-orange-500/5 transition group-hover:bg-orange-500/15" />
                </div>
                </TiltCard>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── STATS BAND ────────────────────────────────────────────────────── */}
      <StatsBand
        title={t.stats.title}
        stats={statsData}
      />

      {/* ─── PROGRAMS ──────────────────────────────────────────────────────── */}
      <section id="courses" className="py-20 md:py-28 bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-500 mb-4">
              {t.programs.title}
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.programs.title}</h2>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.programs.subtitle}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {(coursesData ?? (t.programs.items as Array<{
              name: string; description: string; age: string; duration: string; tag: string; cta: string; slug?: string
            }>)).map((prog: any, i) => {
              const accents = ['orange', 'blue', 'violet']
              const accent = accents[i] ?? 'orange'
              // Support both DB course shape and i18n shape
              const name = prog.name
              const desc = prog.shortDescription ?? prog.description
              const slug = prog.slug ?? null
              const ageFrom = prog.ageFrom ?? null
              const ageTo = prog.ageTo ?? null
              const price = prog.price ?? null
              const duration = prog.duration
              const tag = prog.tag ?? (accents[i] === 'blue' ? (locale === 'ru' ? 'Для детей' : 'Балдар үчүн') : accents[i] === 'violet' ? 'IELTS' : (locale === 'ru' ? 'Популярный' : 'Популярдуу'))
              const cta = prog.cta ?? (locale === 'ru' ? 'Подробнее' : 'Толугураак')
              const href = slug ? `/${locale}/courses/${slug}` : (COURSE_HREFS[name] ?? `/${locale}/courses`)

              const gradients: Record<string, string> = {
                orange: 'from-orange-500/15 to-orange-400/5',
                blue:   'from-blue-500/15 to-blue-400/5',
                violet: 'from-violet-500/15 to-violet-400/5',
              }
              const tagColors: Record<string, string> = {
                orange: 'bg-orange-500/15 text-orange-600',
                blue:   'bg-blue-500/15 text-blue-600',
                violet: 'bg-violet-500/15 text-violet-600',
              }
              const btnColors: Record<string, string> = {
                orange: 'bg-orange-500 hover:bg-orange-600 shadow-orange-500/30',
                blue:   'bg-blue-600 hover:bg-blue-700 shadow-blue-500/30',
                violet: 'bg-violet-600 hover:bg-violet-700 shadow-violet-500/30',
              }

              return (
                <div
                  key={name}
                  className={`flex flex-col overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] transition hover:-translate-y-1 hover:shadow-xl hover:border-orange-500/20 duration-300 ${i === 1 ? 'ring-2 ring-blue-500/20' : ''}`}
                >
                  <div className={`bg-gradient-to-br ${gradients[accent]} p-6 pb-8`}>
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-2xl font-extrabold text-[var(--text)]">{name}</h3>
                      <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${tagColors[accent]}`}>{tag}</span>
                    </div>
                  </div>

                  <div className="flex flex-1 flex-col p-6 pt-0 -mt-4">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {(ageFrom || ageTo) && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          {t.programs.age_label}: {ageFrom}{ageTo ? `–${ageTo}` : '+'}
                        </span>
                      )}
                      {!ageFrom && 'age' in prog && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                          {t.programs.age_label}: {(prog as { age: string }).age}
                        </span>
                      )}
                      {duration && (
                        <span className="flex items-center gap-1 rounded-full bg-[var(--bg-alt)] border border-[var(--border)] px-3 py-1 text-xs font-medium text-[var(--text-muted)]">
                          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                          {duration}
                        </span>
                      )}
                    </div>

                    <p className="flex-1 text-sm leading-relaxed text-[var(--text-muted)] mb-4">{desc}</p>

                    {price && (
                      <p className="mb-4 text-base font-bold text-orange-600">
                        {t.programs.from} {Number(price).toLocaleString()} {t.programs.per_month}
                      </p>
                    )}

                    <Link href={href}
                      className={`mt-auto flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white shadow-lg transition active:scale-95 ${btnColors[accent]}`}
                    >
                      {cta}
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────────────── */}
      <section id="process" className="py-20 md:py-28 bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-500 mb-4">
              {t.process.title}
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.process.title}</h2>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.process.subtitle}</p>
          </div>

          <div className="relative">
            {/* Connector line — vivid orange gradient */}
            <div className="absolute top-8 left-1/2 hidden h-0.5 w-3/4 -translate-x-1/2 lg:block"
              style={{ background: 'linear-gradient(90deg, transparent 0%, #f97316 30%, #f97316 70%, transparent 100%)', opacity: 0.4 }} />

            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {(t.process.steps as Array<{ title: string; description: string }>).map((step, i) => (
                <div key={i} className="relative flex flex-col items-center text-center group cursor-default">
                  {/* Step circle */}
                  <div
                    className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-extrabold text-white shadow-lg transition-all duration-300 group-hover:scale-110 group-hover:shadow-orange-500/40 bg-orange-500"
                  >
                    {i + 1}
                  </div>
                  <h3 className="mb-2 text-base font-bold text-[var(--text)] group-hover:text-orange-500 transition-colors duration-200">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--text-muted)]">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── REVIEWS ───────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 md:py-28 bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-14 text-center">
            <span className="inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-500 mb-4">
              {t.reviews.title}
            </span>
            <h2 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.reviews.title}</h2>
            <p className="mt-4 text-lg text-[var(--text-muted)] max-w-2xl mx-auto">{t.reviews.subtitle}</p>
          </div>
        </div>

        {/* Marquee with one row */}
        <ReviewsMarquee 
          rows={1}
          reviews={reviewsData} 
        />
      </section>

      {/* ─── CTA BANNER ────────────────────────────────────────────────────── */}
      <section className="relative py-24 md:py-32 overflow-hidden bg-gradient-to-br from-orange-500 to-orange-600">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -top-40 left-1/2 h-[500px] w-[500px] -translate-x-1/2 rounded-full bg-white/20 blur-3xl" />

        <div className="relative mx-auto max-w-3xl px-4 text-center md:px-8">
          <p className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/80">
            English Zone
          </p>
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">
            {t.cta_banner.title}
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">
            {t.cta_banner.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href={`/${locale}/apply`}
              className="inline-flex items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-semibold text-orange-600 shadow-lg transition hover:bg-orange-50 active:scale-95"
            >
              {t.cta_banner.cta}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <Link
              href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20"
            >
              {t.cta_banner.secondary}
            </Link>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ────────────────────────────────────────────────────────── */}
      <footer className="bg-[var(--bg-alt)] border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">

            {/* Brand */}
            <div className="sm:col-span-2 lg:col-span-1">
              <Link href={`/${locale}`} className="text-xl font-extrabold tracking-tight text-[var(--text)]">
                English<span className="text-orange-500">Zone</span>
              </Link>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-muted)] max-w-xs">
                {t.footer.tagline}
              </p>
              {/* Social icons */}
              <div className="mt-3 flex gap-2">
                {[
                  { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z' },
                  { label: 'Telegram', path: 'M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.12.58-.46.72-.93.45l-2.57-1.9-1.24 1.19c-.14.14-.26.26-.53.26l.19-2.67 4.84-4.37c.21-.19-.05-.29-.32-.1L7.28 14.1l-2.51-.79c-.55-.17-.56-.55.11-.82l9.82-3.79c.46-.17.86.11.94.1z' },
                ].map((s) => (
                  <a
                    key={s.label}
                    href="#"
                    aria-label={s.label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] text-[var(--text-muted)] transition hover:border-orange-500/40 hover:text-orange-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d={s.path} />
                    </svg>
                  </a>
                ))}
              </div>
            </div>

            {/* Nav */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                {t.footer.nav_title}
              </p>
              <ul className="space-y-1.5">
                {[
                  { href: `/${locale}/about`,    label: locale === 'ru' ? 'О центре' : 'Борбор жөнүндө' },
                  { href: `/${locale}/courses`,  label: locale === 'ru' ? 'Курсы' : 'Курстар' },
                  { href: `/${locale}/teachers`, label: locale === 'ru' ? 'Преподаватели' : 'Мугалимдер' },
                  { href: `/${locale}/branches`, label: locale === 'ru' ? 'Филиалы' : 'Филиалдар' },
                  { href: `/${locale}/reviews`,  label: locale === 'ru' ? 'Отзывы' : 'Пикирлер' },
                  { href: `/${locale}/faq`,      label: locale === 'ru' ? 'FAQ' : 'FAQ' },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-[var(--text-muted)] transition hover:text-orange-500">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacts */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                {t.footer.contacts_title}
              </p>
              <ul className="space-y-2">
                {[
                  {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    text: t.footer.address,
                  },
                  {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>,
                    text: t.footer.phone,
                    href: `tel:${t.footer.phone.replace(/\s/g, '')}`,
                  },
                  {
                    icon: <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                    text: t.footer.email,
                    href: `mailto:${t.footer.email}`,
                  },
                ].map((c, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                    <span className="mt-0.5 shrink-0 text-orange-500">{c.icon}</span>
                    {c.href ? (
                      <a href={c.href} className="hover:text-orange-500 transition">{c.text}</a>
                    ) : (
                      <span>{c.text}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Schedule + Apply */}
            <div>
              <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-subtle)]">
                {t.footer.schedule}
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-4">{t.footer.schedule_value}</p>
              <Link
                href={`/${locale}/apply`}
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-orange-600 active:scale-95"
              >
                {locale === 'ru' ? 'Записаться на урок' : 'Сабакка жазылуу'}
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-5 sm:flex-row">
            <div className="flex flex-wrap items-center justify-center gap-3">
              {/* PWA Install Button */}
              <InstallPWAButton locale={locale} />
              
              <p className="text-xs text-[var(--text-subtle)]">
                {t.footer.copyright.replace('{year}', String(new Date().getFullYear()))}
              </p>
            </div>
            
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href={`/${locale}/terms`} className="text-xs text-[var(--text-subtle)] hover:text-orange-500 transition">
                {locale === 'ru' ? 'Условия использования' : 'Колдонуу шарттары'}
              </Link>
              <span className="text-[var(--text-subtle)]">·</span>
              <Link href={`/${locale}/privacy`} className="text-xs text-[var(--text-subtle)] hover:text-orange-500 transition">
                {locale === 'ru' ? 'Политика конфиденциальности' : 'Купуялуулук саясаты'}
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}
