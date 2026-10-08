import type { Metadata } from 'next'
import { Suspense } from 'react'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import LoginForm from './_components/LoginForm'

export const metadata: Metadata = { title: 'Вход · English Zone' }

export default async function LoginPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const isRu = locale !== 'kg'

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-4 py-16">
      <div className="w-full max-w-[420px]">

        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href={`/${locale}`} className="inline-flex items-center gap-1 text-2xl font-extrabold tracking-tight text-[var(--text)]">
            English<span className="text-orange-500">Zone</span>
          </Link>
          <p className="mt-2 text-sm text-[var(--text-muted)]">
            {isRu ? 'Войдите в личный кабинет' : 'Жеке кабинетке кириңиз'}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] p-8 shadow-xl"
          style={{ boxShadow: '0 4px 32px rgba(0,0,0,0.08)' }}>

          {/* Google */}
          <a href="/api/auth/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm font-medium text-[var(--text)] hover:bg-[var(--border)] transition mb-5">
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 36 26.9 37 24 37c-6 0-10.6-3-11.7-8.3l-7 5.4C8.6 40.6 15.7 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.9 2.6-2.7 4.8-5 6.1l6.6 5.5C41.4 36.6 45 30.8 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            {isRu ? 'Войти через Google' : 'Google аркылуу кирүү'}
          </a>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-[var(--border)]" />
            <span className="text-xs text-[var(--text-subtle)]">{isRu ? 'или' : 'же'}</span>
            <div className="flex-1 h-px bg-[var(--border)]" />
          </div>

          <Suspense fallback={null}>
            <LoginForm locale={locale} />
          </Suspense>
        </div>

        <p className="mt-5 text-center text-sm text-[var(--text-muted)]">
          {isRu ? 'Нет аккаунта?' : 'Аккаунт жокпу?'}{' '}
          <Link href={`/${locale}/signup`} className="font-semibold text-orange-500 hover:text-orange-600 transition">
            {isRu ? 'Зарегистрироваться' : 'Катталуу'}
          </Link>
        </p>
      </div>
    </div>
  )
}
