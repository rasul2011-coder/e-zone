'use client'

import { useState, useRef, type FormEvent, type KeyboardEvent, type ClipboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const CODE_LENGTH = 4

export default function AdminVerifyForm() {
  const router = useRouter()
  const [digits,  setDigits]  = useState<string[]>(Array(CODE_LENGTH).fill(''))
  const [error,   setError]   = useState('')
  const [loading, setLoading] = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const code = digits.join('')

  function handleChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  function handleKeyDown(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  function handlePaste(e: ClipboardEvent<HTMLInputElement>) {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, CODE_LENGTH)
    if (!pasted) return
    const next = Array(CODE_LENGTH).fill('')
    pasted.split('').forEach((ch, i) => { next[i] = ch })
    setDigits(next)
    const focusIndex = Math.min(pasted.length, CODE_LENGTH - 1)
    inputRefs.current[focusIndex]?.focus()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (code.length < CODE_LENGTH) return
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/admin/verify-otp', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ code }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Ошибка сервера. Попробуйте позже.')
        setDigits(Array(CODE_LENGTH).fill(''))
        inputRefs.current[0]?.focus()
        return
      }

      router.push('/admin/dashboard')
    } catch {
      setError('Ошибка соединения. Попробуйте позже.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-7">

      {/* OTP inputs */}
      <div className="flex justify-center gap-3">
        {digits.map((digit, i) => (
          <input
            key={i}
            ref={(el) => { inputRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            autoFocus={i === 0}
            onChange={(e) => handleChange(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            aria-label={`Цифра ${i + 1}`}
            className={`
              h-16 w-14 rounded-2xl border text-center text-3xl font-black text-white outline-none
              transition-all duration-150 caret-orange-500
              ${digit
                ? 'border-orange-500 bg-orange-500/10 shadow-[0_0_0_3px_rgba(249,115,22,0.15)]'
                : 'border-white/10 bg-white/5 focus:border-orange-500 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(249,115,22,0.10)]'
              }
            `}
          />
        ))}
      </div>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2.5 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={loading || code.length < CODE_LENGTH}
        className="w-full rounded-xl bg-orange-500 px-4 py-3.5 text-sm font-semibold text-white transition hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Проверяем...
          </span>
        ) : (
          <span className="flex items-center justify-center gap-2">
            Войти в панель
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </span>
        )}
      </button>

      {/* Back */}
      <div className="text-center">
        <Link
          href="/admin/login"
          className="inline-flex items-center gap-1.5 text-sm text-white/30 hover:text-white/60 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
          Назад ко входу
        </Link>
      </div>
    </form>
  )
}
