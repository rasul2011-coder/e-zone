import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'course-kids')
  return { title: `${t.title} · English Zone` }
}

const FORMAT_ICONS: Record<string, string> = {
  game: '🎮', art: '🎨', music: '🎵', story: '📖',
}

export default async function KidsClubPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'course-kids'),
    getDictionary(locale, 'common'),
  ])
  const groups  = t.age_groups.items as Array<{ name: string; age: string; description: string }>
  const formats = t.format.items as Array<{ icon: string; title: string; description: string }>

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
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-4 inline-block rounded-full bg-blue-500/15 px-4 py-1.5 text-sm font-semibold text-blue-400">
                Kids Club
              </span>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl leading-tight">{t.title}</h1>
              <p className="mt-4 text-white/60 text-lg">{t.subtitle}</p>
              <p className="mt-4 text-white/50 leading-relaxed">{t.description}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link href={`/${locale}/payment`}
                  className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
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
              <p className="text-sm font-semibold uppercase tracking-widest text-blue-400 mb-4">{t.schedule.title}</p>
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

      {/* Age groups */}
      <section className="py-14 md:py-20 bg-[var(--bg)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{t.age_groups.title}</h2>
          <div className="grid gap-5 sm:grid-cols-3">
            {groups.map((g, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 hover:border-blue-500/30 hover:shadow-md transition">
                <div className="mb-3 flex items-center gap-2">
                  <span className="text-2xl">{'🧒👦🧑'[i]}</span>
                  <span className="rounded-full bg-blue-500/10 px-3 py-0.5 text-xs font-bold text-blue-500">{g.age}</span>
                </div>
                <h3 className="font-bold text-[var(--text)] mb-2">{g.name}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{g.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Format */}
      <section className="py-14 md:py-20 bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <h2 className="mb-8 text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{t.format.title}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {formats.map((f) => (
              <div key={f.icon} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5 hover:border-blue-500/30 hover:shadow-md transition text-center">
                <div className="mb-3 text-4xl">{FORMAT_ICONS[f.icon] ?? '✨'}</div>
                <h3 className="font-bold text-[var(--text)] mb-1">{f.title}</h3>
                <p className="text-sm text-[var(--text-muted)]">{f.description}</p>
              </div>
            ))}
          </div>
          <div className="mt-12 text-center">
            <Link href={`/${locale}/apply`}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-8 py-4 text-base font-semibold text-white hover:bg-blue-700 transition shadow-lg shadow-blue-500/30">
              {t.cta}
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
