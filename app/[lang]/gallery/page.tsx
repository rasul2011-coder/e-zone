import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import GalleryClient from './_components/GalleryClient'
import { db, schema } from '@/lib/db'
import { eq } from 'drizzle-orm'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'gallery')
  return { title: `${t.title} · English Zone` }
}

// Curated placeholder photos — used only when DB gallery is empty
const PLACEHOLDER_GALLERY = [
  { id: 1,  category: 'classes',  label_ru: 'Урок General English',      label_kg: 'General English сабагы',  src: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&q=80&fit=crop' },
  { id: 2,  category: 'classes',  label_ru: 'Групповое занятие',          label_kg: 'Топтук сабак',             src: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&q=80&fit=crop' },
  { id: 3,  category: 'classes',  label_ru: 'Kids Club',                  label_kg: 'Kids Club сабагы',         src: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=800&q=80&fit=crop' },
  { id: 4,  category: 'classes',  label_ru: 'IELTS подготовка',           label_kg: 'IELTS даярдык',            src: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=800&q=80&fit=crop' },
  { id: 5,  category: 'classes',  label_ru: 'Разговорный клуб',           label_kg: 'Сүйлөшүү клубу',          src: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=800&q=80&fit=crop' },
  { id: 6,  category: 'classes',  label_ru: 'Урок с преподавателем',      label_kg: 'Мугалим менен сабак',      src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&q=80&fit=crop' },
  { id: 7,  category: 'branches', label_ru: 'Учебный класс',              label_kg: 'Окуу класс',               src: 'https://images.unsplash.com/photo-1580582932707-520aed937b7b?w=800&q=80&fit=crop' },
  { id: 8,  category: 'branches', label_ru: 'Зона отдыха',               label_kg: 'Эс алуу аймагы',           src: 'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80&fit=crop' },
  { id: 9,  category: 'branches', label_ru: 'Библиотека центра',          label_kg: 'Борборунун китепканасы',   src: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800&q=80&fit=crop' },
  { id: 10, category: 'events',   label_ru: 'Торжественное мероприятие',  label_kg: 'Майрамдык иш-чара',        src: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=800&q=80&fit=crop' },
  { id: 11, category: 'events',   label_ru: 'Выпускной',                  label_kg: 'Бүтүрүү',                  src: 'https://images.unsplash.com/photo-1627556704302-624286467c65?w=800&q=80&fit=crop' },
  { id: 12, category: 'events',   label_ru: 'Студенческое мероприятие',   label_kg: 'Студенттик иш-чара',       src: 'https://images.unsplash.com/photo-1567168544813-cc03465b4fa8?w=800&q=80&fit=crop' },
]

export default async function GalleryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'gallery'),
    getDictionary(locale, 'common'),
  ])

  // Load published photos from DB
  const dbItems = await db
    .select()
    .from(schema.gallery)
    .where(eq(schema.gallery.isPublished, true))
    .orderBy(schema.gallery.sortOrder, schema.gallery.createdAt)
    .catch(() => [])

  // Use DB data if available, else fallback to placeholder
  const itemsWithLabels = dbItems.length > 0
    ? dbItems.map(item => ({
        id:       Number(item.id),
        category: item.category ?? 'other',
        label:    item.title ?? (locale === 'ru' ? 'Фото' : 'Сүрөт'),
        src:      item.image,
      }))
    : PLACEHOLDER_GALLERY.map(item => ({
        id:       item.id,
        category: item.category,
        label:    locale === 'ru' ? item.label_ru : item.label_kg,
        src:      item.src,
      }))

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
        <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            {t.title}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>

          {/* Stats — honest numbers */}
          <div className="mt-8 flex flex-wrap justify-center gap-8">
            {[
              { value: String(itemsWithLabels.length) + '+', label: locale === 'ru' ? 'фотографий' : 'сүрөт' },
              { value: '4',   label: locale === 'ru' ? 'филиала' : 'филиал' },
              { value: '3',   label: locale === 'ru' ? 'направления' : 'багыт' },
            ].map((s) => (
              <div key={s.label}>
                <p className="text-3xl font-extrabold text-white">{s.value}</p>
                <p className="text-sm text-white/50">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Instagram CTA */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8 flex items-center justify-between gap-4 flex-wrap">
          <p className="text-sm text-[var(--text-muted)]">
            {locale === 'ru'
              ? 'Больше фото в нашем Instagram'
              : 'Биздин Instagram&apos;да көбүрөөк сүрөттөр'}
          </p>
          <a
            href="https://www.instagram.com/englishzone.kg/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-400 px-4 py-1.5 text-sm font-semibold text-white hover:opacity-90 transition"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            @englishzone.kg
          </a>
        </div>
      </div>

      {/* Gallery grid with client-side filter */}
      <GalleryClient items={itemsWithLabels} filters={t.filters} />
    </div>
  )
}
