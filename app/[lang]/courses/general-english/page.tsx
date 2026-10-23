import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'course-general')
  return { title: `${t.title} · English Zone` }
}

export default async function GeneralEnglishPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'course-general'),
    getDictionary(locale, 'common'),
  ])
  const levels = t.levels.items as Array<{ name: string; description: string }>

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <Link href={`/${locale}/courses`} className="hover:text-orange-500 transition">{locale === 'ru' ? 'Курсы' : 'Курстар'}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-hero py-16 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
                General English
              </span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">{t.title}</h1>
              <p className="mt-4 text-white/60 text-lg">{t.subtitle}</p>
              <p className="mt-4 text-white/50 leading-relaxed">{t.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/${locale}/payment`}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
                  {t.cta}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
                <Link href={`/${locale}/courses`}
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
                  {tc.cta.more}
                </Link>
              </div>
            </div>
            {/* Schedule card */}
            <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-6">
              <p className="text-sm font-semibold uppercase tracking-widest text-orange-400 mb-4">{t.schedule.title}</p>
              <div className="space-y-3">
                {[
                  { label: t.schedule.duration,   value: t.schedule.duration_value },
                  { label: t.schedule.frequency,  value: t.schedule.frequency_value },
                  { label: t.schedule.group_size, value: t.schedule.group_size_value },
                  { label: t.schedule.price,      value: t.schedule.price_value },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between border-b border-white/10 pb-3 last:border-0 last:pb-0">
                    <span className="text-sm text-white/50">{row.label}</span>
                    <span className="text-sm font-semibold text-white">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Levels */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-10 text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{t.levels.title}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {levels.map((level, i) => (
              <div key={level.name}
                className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 hover:border-orange-500/30 hover:shadow-md transition">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10 text-xs font-bold text-orange-500">
                  {i + 1}
                </div>
                <h3 className="font-bold text-[var(--text)] mb-1">{level.name}</h3>
                <p className="text-xs leading-relaxed text-[var(--text-muted)]">{level.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="mt-14 text-center">
            <Link href={`/${locale}/apply`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-4 text-base font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
              {t.cta}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
