import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import ApplyForm from './_components/ApplyForm'
import { GraduationCap, Zap, ClipboardList } from 'lucide-react'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'apply')
  return { title: `${t.title} · English Zone` }
}

export default async function ApplyPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'apply'),
    getDictionary(locale, 'common'),
  ])

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.title}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="section-hero py-16 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-500/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            {locale === 'ru' ? 'Запись' : 'Жазылуу'}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Form + Info */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-5xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_340px]">

            {/* Form */}
            <div>
              <ApplyForm locale={locale} t={t} />
            </div>

            {/* Side info */}
            <div className="space-y-5">
              {[
                { icon: <GraduationCap className="w-8 h-8" />, title: locale === 'ru' ? 'Бесплатный пробный урок' : 'Акысыз сыноо сабак', text: locale === 'ru' ? 'Первое занятие без обязательств — познакомьтесь с методикой и преподавателем' : 'Биринчи сабак милдеттенмесиз — методика жана мугалим менен таанышыңыз' },
                { icon: <Zap className="w-8 h-8" />, title: locale === 'ru' ? 'Ответим за 30 минут' : '30 мүнөттө жооп беребиз', text: locale === 'ru' ? 'Наш менеджер перезвонит и ответит на все вопросы' : 'Менеджерибиз кайра чалып, бардык суроолорго жооп берет' },
                { icon: <ClipboardList className="w-8 h-8" />, title: locale === 'ru' ? 'Бесплатное тестирование' : 'Акысыз тестирлөө', text: locale === 'ru' ? 'Определим ваш уровень и подберём подходящую группу' : 'Деңгээлиңизди аныктап, ылайыктуу топту тандайбыз' },
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
                  <div className="text-orange-500 shrink-0">{item.icon}</div>
                  <div>
                    <p className="font-semibold text-[var(--text)] mb-1">{item.title}</p>
                    <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.text}</p>
                  </div>
                </div>
              ))}

              <div className="rounded-2xl section-hero p-5">
                <p className="text-sm font-semibold text-orange-400 mb-2">
                  {locale === 'ru' ? 'Связаться напрямую' : 'Түздөн-түз байланышуу'}
                </p>
                <a href="tel:+996700123456" className="flex items-center gap-2 text-white hover:text-orange-400 transition text-sm">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12 19.79 19.79 0 0 1 1.06 3.33 2 2 0 0 1 3.05 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/></svg>
                  +996 (700) 123-456
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
