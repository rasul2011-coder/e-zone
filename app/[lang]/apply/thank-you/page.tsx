import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import PaymentSection from './_components/PaymentSection'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'thank-you')
  return { title: `${t.title} · English Zone` }
}

export default async function ThankYouPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const t = await getDictionary(locale, 'thank-you')
  const steps = t.next_steps.items as string[]

  return (
    <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-lg text-center">
        {/* Success icon */}
        <div className="mb-8 flex justify-center">
          <div className="flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[var(--text)] sm:text-4xl">{t.title}</h1>
        <p className="mt-2 text-lg font-medium text-emerald-500">{t.subtitle}</p>
        <p className="mt-4 text-sm leading-relaxed text-[var(--text-muted)] max-w-md mx-auto">{t.description}</p>

        {/* Payment Section */}
        <PaymentSection locale={locale} />

        {/* Next steps */}
        <div className="mt-10 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-6 text-left">
          <p className="mb-4 text-sm font-semibold text-[var(--text)]">{t.next_steps.title}</p>
          <ol className="space-y-3">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-500/15 text-xs font-bold text-orange-500">
                  {i + 1}
                </span>
                <span className="text-sm text-[var(--text-muted)]">{step}</span>
              </li>
            ))}
          </ol>
        </div>

        {/* CTAs */}
        <div className="mt-8 flex flex-wrap justify-center gap-4">
          <Link href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
            {t.cta_home}
          </Link>
          <Link href={`/${locale}/courses`}
            className="inline-flex items-center gap-2 rounded-full border border-[var(--border)] bg-[var(--bg-card)] px-6 py-3 text-sm font-semibold text-[var(--text)] hover:border-orange-500/40 transition">
            {t.cta_courses}
          </Link>
        </div>
      </div>
    </div>
  )
}
