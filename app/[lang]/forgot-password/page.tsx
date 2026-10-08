import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import ForgotPasswordFlow from './_components/ForgotPasswordFlow'

export const metadata: Metadata = { title: 'Восстановление пароля · English Zone' }

export default async function ForgotPasswordPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const isRu = locale !== 'kg'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-16">
      <div className="w-full max-w-[420px]">

        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1 text-2xl font-extrabold tracking-tight text-[var(--text)]">
            English<span className="text-orange-500">Zone</span>
          </Link>
        </div>

        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>
          <ForgotPasswordFlow locale={locale} />
        </div>

        <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
          {isRu ? 'Вспомнили пароль?' : 'Сырсөздү эстедиңизби?'}{' '}
          <Link href={`/${locale}/login`} className="font-semibold text-orange-500 hover:text-orange-600 transition">
            {isRu ? 'Войти' : 'Кирүү'}
          </Link>
        </p>
      </div>
    </div>
  )
}
