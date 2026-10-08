import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'about')
  return { title: `${t.title} · English Zone` }
}

export default async function AboutPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'about'),
    getDictionary(locale, 'common'),
  ])

  const values = t.values.items as Array<{ title: string; description: string }>
  const valueIcons = ['🎓', '🏆', '🤝']

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

      {/* Hero */}
      <section className="relative overflow-hidden section-hero py-20">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            English Zone
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl lg:text-5xl max-w-3xl leading-tight">
            {t.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60 leading-relaxed">
            {t.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href={`/${locale}/register`}
              className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition">
              {tc.cta.trial}
            </Link>
            <Link href={`/${locale}/courses`}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10 transition">
              {tc.cta.more}
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-12 md:px-8">
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-4">
            {[
              { value: '15', label: locale === 'ru' ? 'лет опыта' : 'жыл тажрыйба' },
              { value: '600+', label: locale === 'ru' ? 'учеников' : 'окуучу' },
              { value: '8', label: locale === 'ru' ? 'филиалов' : 'филиал' },
              { value: '95%', label: locale === 'ru' ? 'успешных выпускников' : 'ийгиликтүү бүтүрүүчүлөр' },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl bg-[var(--bg-card)] border border-[var(--border)] p-6 text-center">
                <p className="text-4xl font-extrabold text-orange-500">{s.value}</p>
                <p className="mt-1 text-sm text-[var(--text-muted)]">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="mb-3 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-500">
                {t.mission_title}
              </span>
              <h2 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{t.mission_title}</h2>
              <p className="mt-4 text-lg leading-relaxed text-[var(--text-muted)]">{t.mission_text}</p>
              <div className="mt-8 flex flex-col gap-3">
                {[
                  { href: `/${locale}/courses`,  label: t.quick_links.programs },
                  { href: `/${locale}/teachers`, label: t.quick_links.teachers },
                  { href: `/${locale}/contacts`, label: t.quick_links.contacts },
                ].map((l) => (
                  <Link key={l.href} href={l.href}
                    className="inline-flex items-center gap-2 text-sm font-medium text-orange-500 hover:text-orange-600 transition">
                    {l.label}
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                  </Link>
                ))}
              </div>
            </div>
            {/* Visual card */}
            <div className="rounded-3xl p-8 text-white" style={{ background: 'var(--bg-section)' }}>
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-orange-500/20">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                  <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </div>
              <p className="text-2xl font-extrabold mb-2">English<span className="text-orange-400">Zone</span></p>
              <p className="text-white/60 text-sm leading-relaxed">
                {locale === 'ru'
                  ? 'Основан в 2009 году · Бишкек, Кыргызстан'
                  : '2009-жылы негизделген · Бишкек, Кыргызстан'}
              </p>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {['CELTA', 'DELTA', 'IELTS', 'Cambridge'].map((cert) => (
                  <div key={cert} className="rounded-xl bg-white/10 px-3 py-2 text-center text-sm font-medium text-white/80">
                    {cert}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 md:py-20 bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="mb-12 text-center">
            <h2 className="text-2xl font-extrabold text-[var(--text)] sm:text-3xl">{t.values.title}</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {values.map((v, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-7 text-center hover:border-orange-500/30 hover:shadow-lg transition">
                <div className="mb-4 flex h-14 w-14 mx-auto items-center justify-center rounded-2xl bg-orange-500/10 text-3xl">
                  {valueIcons[i]}
                </div>
                <h3 className="text-lg font-bold text-[var(--text)] mb-2">{v.title}</h3>
                <p className="text-sm leading-relaxed text-[var(--text-muted)]">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 section-hero">
        <div className="mx-auto max-w-2xl px-4 text-center md:px-8">
          <h2 className="text-2xl font-extrabold text-white sm:text-3xl">
            {locale === 'ru' ? 'Присоединяйтесь к English Zone' : 'English Zone\'ге кошулуңуз'}
          </h2>
          <p className="mt-4 text-white/60">
            {locale === 'ru' ? 'Запишитесь на бесплатный пробный урок уже сегодня' : 'Бүгүн акысыз сыноо сабакка жазылыңыз'}
          </p>
          <Link href={`/${locale}/register`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-orange-500 px-8 py-3.5 text-base font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
            {tc.cta.trial}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
          </Link>
        </div>
      </section>
    </div>
  )
}
