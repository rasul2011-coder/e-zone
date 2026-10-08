import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import RegisterFlow from './_components/RegisterFlow'

export const metadata: Metadata = {
  title: 'Регистрация · English Zone',
}

export default async function RegisterPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const isRu = locale !== 'kg'

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">
              {isRu ? 'Главная' : 'Башкы бет'}
            </Link>
            <span>/</span>
            <span className="text-[var(--text)]">{isRu ? 'Регистрация' : 'Каттоо'}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-hero py-14">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center relative z-10">
          <span className="mb-3 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">
            {isRu ? 'Регистрация' : 'Каттоо'}
          </span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">
            {isRu ? 'Записаться на курс' : 'Курска жазылуу'}
          </h1>
          <p className="mt-3 text-white/60 max-w-lg mx-auto text-sm">
            {isRu
              ? 'AI поможет выбрать курс, затем оплатите через QR и загрузите чек'
              : 'AI курс тандоого жардам берет, андан кийин QR аркылуу төлөп, чек жүктөңүз'}
          </p>
        </div>
      </section>

      {/* Main content */}
      <section className="py-10 md:py-16">
        <div className="mx-auto max-w-2xl px-4 md:px-8">
          <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-6 md:p-8 shadow-xl"
            style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.06)' }}>
            <RegisterFlow locale={locale} />
          </div>

          {/* Info note */}
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500 shrink-0 mt-0.5">
              <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed">
              {isRu
                ? 'После отправки заявки наш менеджер свяжется с вами в течение рабочего дня для подтверждения записи.'
                : 'Арыз жиберилгенден кийин менеджерибиз жумушчу күн ичинде жазылууну ырастоо үчүн сизге чалат.'}
            </p>
          </div>
        </div>
      </section>
    </div>
  )
}
