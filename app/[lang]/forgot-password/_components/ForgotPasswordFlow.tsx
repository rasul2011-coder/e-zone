'use client'

import { useState, useRef, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'

type Step = 'email' | 'code' | 'new-password'

export default function ForgotPasswordFlow({ locale }: { locale: string }) {
  const router = useRouter()
  const isRu = locale !== 'kg'

  const [step,        setStep]       = useState<Step>('email')
  const [email,       setEmail]      = useState('')
  const [digits,      setDigits]     = useState<string[]>(Array(6).fill(''))
  const [resetToken,  setResetToken] = useState('')
  const [newPass,     setNewPass]    = useState('')
  const [confirmPass, setConfirm]    = useState('')
  const [showPass,    setShowPass]   = useState(false)
  const [error,       setError]      = useState('')
  const [loading,     setLoading]    = useState(false)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  const inp = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  // ── Step 1: Email ───────────────────────────────────────────────────────────
  async function handleEmail(e: FormEvent) {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error); return }
      setStep('code')
    } catch { setError(isRu ? 'Ошибка соединения' : 'Туташуу катасы') }
    finally  { setLoading(false) }
  }

  // ── Step 2: 6-digit code ────────────────────────────────────────────────────
  function handleDigitChange(index: number, value: string) {
    if (!/^\d*$/.test(value)) return
    const next = [...digits]
    next[index] = value.slice(-1)
    setDigits(next)
    if (value && index < 5) inputRefs.current[index + 1]?.focus()
  }

  function handleDigitKey(index: number, e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  async function handleCode(e: FormEvent) {
    e.preventDefault()
    const code = digits.join('')
    if (code.length < 6) { setError(isRu ? 'Введите 6-значный код' : '6 санды жазыңыз'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-reset-code', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error); setDigits(Array(6).fill('')); inputRefs.current[0]?.focus(); return }
      setResetToken(d.resetToken)
      setStep('new-password')
    } catch { setError(isRu ? 'Ошибка соединения' : 'Туташуу катасы') }
    finally  { setLoading(false) }
  }

  // ── Step 3: New password ────────────────────────────────────────────────────
  async function handleReset(e: FormEvent) {
    e.preventDefault()
    if (newPass.length < 6) { setError(isRu ? 'Минимум 6 символов' : 'Минимум 6 белги'); return }
    if (newPass !== confirmPass) { setError(isRu ? 'Пароли не совпадают' : 'Сырсөздөр дал келбейт'); return }
    setError(''); setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resetToken, newPassword: newPass }),
      })
      const d = await res.json()
      if (!res.ok) { setError(d.error); return }
      router.push('/dashboard')
    } catch { setError(isRu ? 'Ошибка соединения' : 'Туташуу катасы') }
    finally  { setLoading(false) }
  }

  const ErrorBox = ({ msg }: { msg: string }) => (
    <div className="flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
        <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
      </svg>
      {msg}
    </div>
  )

  const SubmitBtn = ({ label, disabled }: { label: string; disabled?: boolean }) => (
    <button type="submit" disabled={loading || disabled}
      className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50 flex items-center justify-center gap-2">
      {loading
        ? <><svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>{isRu ? 'Загрузка...' : 'Жүктөлүүдө...'}</>
        : label
      }
    </button>
  )

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-5">

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-6">
        {['email', 'code', 'new-password'].map((s, i) => {
          const steps = ['email', 'code', 'new-password']
          const currentIdx = steps.indexOf(step)
          const done = i < currentIdx
          const active = i === currentIdx
          return (
            <div key={s} className="flex items-center flex-1">
              <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                done   ? 'bg-emerald-500 text-white'
                : active ? 'bg-orange-500 text-white'
                : 'bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-subtle)]'
              }`}>
                {done
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  : i + 1
                }
              </div>
              {i < 2 && <div className={`flex-1 h-px mx-2 ${done ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />}
            </div>
          )
        })}
      </div>

      {/* ── Step 1 ── */}
      {step === 'email' && (
        <form onSubmit={handleEmail} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-1">
              {isRu ? 'Восстановление пароля' : 'Сырсөздү калыбына келтирүү'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {isRu ? 'Введите email — мы отправим код для сброса пароля' : 'Email жазыңыз — сырсөздү баштапкы абалга келтирүү коду жиберебиз'}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">Email</label>
            <input type="email" required value={email} onChange={e => setEmail(e.target.value)}
              placeholder="example@mail.com" className={inp} autoFocus />
          </div>
          {error && <ErrorBox msg={error} />}
          <SubmitBtn label={isRu ? 'Отправить код' : 'Код жиберүү'} disabled={!email} />
        </form>
      )}

      {/* ── Step 2 ── */}
      {step === 'code' && (
        <form onSubmit={handleCode} className="space-y-5">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-1">
              {isRu ? 'Введите код' : 'Кодду жазыңыз'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {isRu ? `Мы отправили 6-значный код на ${email}` : `${email} дарегине 6 санды код жиберилди`}
            </p>
          </div>

          {/* 6-digit inputs */}
          <div className="flex justify-center gap-2.5">
            {digits.map((d, i) => (
              <input
                key={i}
                ref={el => { inputRefs.current[i] = el }}
                type="text" inputMode="numeric" maxLength={1} value={d} autoFocus={i === 0}
                onChange={e => handleDigitChange(i, e.target.value)}
                onKeyDown={e => handleDigitKey(i, e)}
                className={`h-14 w-11 rounded-xl border text-center text-2xl font-black outline-none transition caret-orange-500 ${
                  d ? 'border-orange-500 bg-orange-500/10 text-[var(--text)]'
                    : 'border-[var(--border)] bg-[var(--bg-alt)] text-[var(--text)] focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
                }`}
              />
            ))}
          </div>

          {error && <ErrorBox msg={error} />}
          <SubmitBtn label={isRu ? 'Подтвердить' : 'Ырастоо'} disabled={digits.join('').length < 6} />

          <button type="button" onClick={() => { setStep('email'); setDigits(Array(6).fill('')); setError('') }}
            className="w-full text-center text-sm text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition">
            ← {isRu ? 'Изменить email' : 'Email өзгөртүү'}
          </button>
        </form>
      )}

      {/* ── Step 3 ── */}
      {step === 'new-password' && (
        <form onSubmit={handleReset} className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-[var(--text)] mb-1">
              {isRu ? 'Новый пароль' : 'Жаңы сырсөз'}
            </h2>
            <p className="text-sm text-[var(--text-muted)]">
              {isRu ? 'Придумайте надёжный пароль (минимум 6 символов)' : 'Ишенимдүү сырсөз ойлоп табыңыз (минимум 6 белги)'}
            </p>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
              {isRu ? 'Новый пароль' : 'Жаңы сырсөз'}
            </label>
            <div className="relative">
              <input type={showPass ? 'text' : 'password'} required value={newPass}
                onChange={e => setNewPass(e.target.value)}
                placeholder={isRu ? 'Минимум 6 символов' : 'Минимум 6 белги'}
                className={inp + ' pr-11'} autoFocus />
              <button type="button" tabIndex={-1} onClick={() => setShowPass(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-subtle)] hover:text-[var(--text-muted)] transition">
                {showPass
                  ? <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  : <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                }
              </button>
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
              {isRu ? 'Повторите пароль' : 'Сырсөздү кайталаңыз'}
            </label>
            <input type={showPass ? 'text' : 'password'} required value={confirmPass}
              onChange={e => setConfirm(e.target.value)}
              placeholder="••••••••" className={inp} />
          </div>

          {/* Password match indicator */}
          {confirmPass.length > 0 && (
            <div className={`flex items-center gap-2 text-xs font-medium ${newPass === confirmPass ? 'text-emerald-500' : 'text-red-400'}`}>
              {newPass === confirmPass
                ? <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>{isRu ? 'Пароли совпадают' : 'Сырсөздөр дал келет'}</>
                : <><svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>{isRu ? 'Пароли не совпадают' : 'Сырсөздөр дал келбейт'}</>
              }
            </div>
          )}

          {error && <ErrorBox msg={error} />}
          <SubmitBtn label={isRu ? 'Сохранить пароль' : 'Сырсөздү сактоо'} disabled={!newPass || !confirmPass} />
        </form>
      )}
    </div>
  )
}
