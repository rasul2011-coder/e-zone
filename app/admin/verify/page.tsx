import type { Metadata } from 'next'
import AdminVerifyForm from './_components/AdminVerifyForm'

export const metadata: Metadata = {
  title: 'Подтверждение · English Zone Admin',
  robots: { index: false, follow: false },
}

export default function AdminVerifyPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0b1628] px-4">
      {/* Dot grid */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize:  '28px 28px',
        }}
      />
      {/* Glow */}
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
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/5 text-[11px] font-bold text-white/40">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div className="flex-1 h-px bg-orange-500/50" />
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-500 text-[11px] font-bold text-white">2</div>
          </div>

          {/* Telegram icon */}
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24" fill="currentColor" className="text-blue-400">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8l-1.69 7.96c-.12.58-.46.72-.93.45l-2.57-1.9-1.24 1.19c-.14.14-.26.26-.53.26l.19-2.67 4.84-4.37c.21-.19-.05-.29-.32-.1L7.28 14.1l-2.51-.79c-.55-.17-.56-.55.11-.82l9.82-3.79c.46-.17.86.11.94.1z"/>
              </svg>
            </div>
          </div>

          <h1 className="text-lg font-bold text-white mb-1 text-center">Код подтверждения</h1>
          <p className="text-sm text-white/40 mb-7 text-center leading-relaxed">
            Мы отправили <strong className="text-white/70">4-значный код</strong> в Telegram бот.
            <br/>Откройте бота и скопируйте код.
          </p>

          <AdminVerifyForm />
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          © {new Date().getFullYear()} English Zone · Бишкек
        </p>
      </div>
    </div>
  )
}
