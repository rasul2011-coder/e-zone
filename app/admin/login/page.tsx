import type { Metadata } from 'next'
import { Suspense } from 'react'
import AdminLoginForm from './_components/AdminLoginForm'

export const metadata: Metadata = {
  title: 'Вход · English Zone Admin',
  robots: { index: false, follow: false },
}

export default function AdminLoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1628] px-4">
      {/* Dot grid background */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize:  '28px 28px',
        }}
      />
      {/* Glow blobs */}
      <div aria-hidden className="pointer-events-none fixed -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-orange-500/10 blur-[120px]" />
      <div aria-hidden className="pointer-events-none fixed -bottom-40 -right-40 h-[400px] w-[400px] rounded-full bg-blue-600/10 blur-[100px]" />

      <div className="relative w-full max-w-[400px]">

        {/* Logo */}
        <div className="mb-10 text-center">
          <div className="inline-flex items-center gap-1.5 mb-2">
            <span className="text-3xl font-black tracking-tight text-white">English</span>
            <span className="text-3xl font-black tracking-tight text-orange-500">Zone</span>
          </div>
          <p className="text-[11px] font-semibold tracking-[0.25em] text-white/30 uppercase">
            Admin Panel
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-white/8 bg-white/[0.04] backdrop-blur-xl p-8 shadow-[0_32px_64px_rgba(0,0,0,0.4)]">

          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-7">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">1</div>
            <div className="flex-1 h-px bg-white/10" />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/15 text-[11px] font-bold text-white/30">2</div>
          </div>

          <h1 className="text-lg font-bold text-white mb-1">Вход в систему</h1>
          <p className="text-sm text-white/40 mb-7 leading-relaxed">
            Введите ваш email и пароль. Если данные верны, в Telegram придёт код подтверждения.
          </p>

          {/* Google OAuth */}
          <a
            href="/api/admin/google"
            className="flex w-full items-center justify-center gap-3 rounded-2xl border border-white/12 bg-white/8 px-4 py-3 text-sm font-medium text-white hover:bg-white/15 transition mb-5"
          >
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M44.5 20H24v8.5h11.8C34.7 33.9 30.1 37 24 37c-7.2 0-13-5.8-13-13s5.8-13 13-13c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.2-2.7-.5-4z" fill="#FFC107"/>
              <path d="M6.3 14.7l7 5.1C15.1 17.1 19.2 14 24 14c3.1 0 5.9 1.1 8.1 2.9l6-6C34.6 5.1 29.6 3 24 3 16.3 3 9.7 7.9 6.3 14.7z" fill="#FF3D00"/>
              <path d="M24 45c5.5 0 10.4-1.9 14.2-5.1l-6.6-5.5C29.6 36 26.9 37 24 37c-6 0-10.6-3-11.7-8.3l-7 5.4C8.6 40.6 15.7 45 24 45z" fill="#4CAF50"/>
              <path d="M44.5 20H24v8.5h11.8c-.9 2.6-2.7 4.8-5 6.1l6.6 5.5C41.4 36.6 45 30.8 45 24c0-1.3-.2-2.7-.5-4z" fill="#1976D2"/>
            </svg>
            Войти через Google
          </a>

          {/* Divider */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-[11px] font-medium text-white/25 uppercase tracking-widest">или</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>

          <Suspense fallback={null}>
            <AdminLoginForm />
          </Suspense>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} English Zone · Бишкек
        </p>
      </div>
    </div>
  )
}
