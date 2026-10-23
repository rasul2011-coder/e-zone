import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import PaymentForm from '@/components/PaymentForm'

export const metadata: Metadata = {
  title: 'Оплата · English Zone',
}

export default async function PaymentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">
              {locale === 'ru' ? 'Главная' : 'Башкы бет'}
            </Link>
            <span>/</span>
            <span className="text-[var(--text)]">
              {locale === 'ru' ? 'Оплата' : 'Төлөм'}
            </span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="py-16 bg-gradient-to-b from-orange-50 to-[var(--bg)] relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,#f97316 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div aria-hidden="true" className="pointer-events-none absolute -top-20 left-1/2 h-64 w-64 -translate-x-1/2 rounded-full bg-orange-400/15 blur-3xl" />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/10 px-4 py-1.5 text-sm font-semibold text-orange-600">
            {locale === 'ru' ? 'Оплата' : 'Төлөм'}
          </span>
          <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">
            {locale === 'ru' ? 'Оплата курса' : 'Курска төлөм'}
          </h1>
          <p className="mt-4 text-[var(--text-muted)] max-w-xl mx-auto">
            {locale === 'ru' 
              ? 'Выберите курс, филиал и оплатите 5 сомов' 
              : 'Курсту, филиалды тандап, 5 сом төлөңүз'}
          </p>
        </div>
      </section>

      {/* Payment Form */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <PaymentForm locale={locale} />
        </div>
      </section>

      {/* Info */}
      <section className="py-10 border-t border-[var(--border)]">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                icon: '🔒',
                title: locale === 'ru' ? 'Безопасная оплата' : 'Коопсуз төлөм',
                text: locale === 'ru' 
                  ? 'Платежи обрабатываются через защищенную систему FINIK Pay' 
                  : 'Төлөмдөр FINIK Pay коргоолуу системасы аркылуу иштетилет',
              },
              {
                icon: '⚡',
                title: locale === 'ru' ? 'Моментальное подтверждение' : 'Тез ырастоо',
                text: locale === 'ru' 
                  ? 'Платеж обрабатывается мгновенно после сканирования QR-кода' 
                  : 'QR-кодду скандагандан кийин төлөм бат эле иштетилет',
              },
              {
                icon: '💳',
                title: locale === 'ru' ? 'Оплата через FINIK' : 'FINIK аркылуу төлөм',
                text: locale === 'ru' 
                  ? 'Используйте приложение FINIK для быстрой оплаты' 
                  : 'Тез төлөм үчүн FINIK колдонмосун пайдаланыңыз',
              },
            ].map((item, i) => (
              <div key={i} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6">
                <span className="text-4xl mb-3 block">{item.icon}</span>
                <h3 className="font-semibold text-[var(--text)] mb-2">{item.title}</h3>
                <p className="text-sm text-[var(--text-muted)] leading-relaxed">{item.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
