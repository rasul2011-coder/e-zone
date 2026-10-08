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
  const t = await getDictionaryByLocale(lang as Locale, 'branches')
  return { title: `${t.title} · English Zone` }
}

export default async function BranchesPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'branches'),
    getDictionary(locale, 'common'),
  ])

  const branches = await db
    .select()
    .from(schema.branches)
    .where(eq(schema.branches.isActive, true))
    .orderBy(schema.branches.sortOrder)
    .catch(() => [])

  const PLACEHOLDER = [
    { id: 1, name: 'Филиал на Чуй', slug: 'chui', address: 'ул. Чуй 123', phone: '+996 700 123-456', workingHours: 'Пн–Сб: 09:00–20:00', description: 'Центральный офис', image: null },
    { id: 2, name: 'Филиал на Манас', slug: 'manas', address: 'пр. Манас 45', phone: '+996 700 234-567', workingHours: 'Пн–Сб: 09:00–20:00', description: 'Удобная транспортная доступность', image: null },
    { id: 3, name: 'Филиал на Ибраимова', slug: 'ibraimova', address: 'ул. Ибраимова 78', phone: '+996 700 345-678', workingHours: 'Пн–Сб: 09:00–20:00', description: 'В центре города', image: null },
    { id: 4, name: 'Филиал Асанбай', slug: 'asanbai', address: 'ул. Асанбая 12', phone: '+996 700 456-789', workingHours: 'Пн–Сб: 09:00–20:00', description: 'Жилой квартал', image: null },
  ]

  const list = branches.length > 0 ? branches : PLACEHOLDER

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
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">{t.title}</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Grid */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {list.map((branch) => (
              <div key={branch.id}
                className="flex flex-col rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden hover:border-orange-500/30 hover:shadow-lg transition group">
                {/* Map thumbnail — links to 2GIS if coords available */}
                {(branch as any).latitude && (branch as any).longitude ? (
                  <a
                    href={`https://2gis.kg/bishkek?m=${(branch as any).longitude}%2C${(branch as any).latitude}%2F17`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="card-header-gradient relative flex h-36 items-center justify-center hover:opacity-90 transition"
                    title="Открыть на 2ГИС"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    <span className="absolute bottom-2 right-3 text-[10px] text-orange-500/60 font-medium">2ГИС</span>
                  </a>
                ) : (
                  <div className="card-header-gradient flex h-36 items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500/70">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                  </div>
                )}
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="text-base font-bold text-[var(--text)] mb-3">{branch.name}</h3>
                  <div className="space-y-2 mb-4">
                    <div className="flex items-start gap-2 text-sm text-[var(--text-muted)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5 text-orange-500">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      <span>{branch.address}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-orange-500">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/>
                      </svg>
                      <span>{branch.phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-orange-500">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span>{branch.workingHours}</span>
                    </div>
                  </div>
                  <div className="mt-auto flex flex-col gap-2">
                    <Link href={`/${locale}/branches/${branch.slug}`}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2.5 text-sm font-medium text-[var(--text)] hover:border-orange-500/40 hover:text-orange-500 transition">
                      {t.card.view}
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                    </Link>
                    {/* 2GIS link button */}
                    <a
                      href={
                        (branch as any).latitude && (branch as any).longitude
                          ? `https://2gis.kg/bishkek?m=${(branch as any).longitude}%2C${(branch as any).latitude}%2F17`
                          : `https://2gis.kg/search/${encodeURIComponent(branch.address)}`
                      }
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2 text-sm font-medium text-[var(--text-muted)] hover:border-orange-500/40 hover:text-orange-500 transition"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                      </svg>
                      Показать на 2ГИС
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
