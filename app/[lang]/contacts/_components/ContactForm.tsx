'use client'

import { useState, type FormEvent } from 'react'
import { usePhoneFormat } from '@/hooks/usePhoneFormat'

interface Props {
  locale: string
  t: {
    form: {
      name: string; name_placeholder: string
      phone: string; phone_placeholder: string
      message: string; message_placeholder: string
      submit: string; success: string
    }
  }
}

export default function ContactForm({ t }: Props) {
  const [sent, setSent]     = useState(false)
  const [loading, setLoading] = useState(false)
  const [phone, handlePhoneChange] = usePhoneFormat()

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    // Simulate send
    await new Promise((r) => setTimeout(r, 800))
    setSent(true)
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-10 text-center">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/15 border-2 border-emerald-500/30">
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        </div>
        <p className="text-base font-semibold text-[var(--text)]">{t.form.success}</p>
      </div>
    )
  }

  const inputCls = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">{t.form.name}</label>
        <input required type="text" placeholder={t.form.name_placeholder} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">{t.form.phone}</label>
        <input required type="tel" value={phone} onChange={handlePhoneChange} placeholder={t.form.phone_placeholder} className={inputCls} />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">{t.form.message}</label>
        <textarea required rows={4} placeholder={t.form.message_placeholder} className={inputCls + ' resize-none'} />
      </div>
      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-orange-500 px-5 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60">
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {t.form.submit}...
          </span>
        ) : t.form.submit}
      </button>
    </form>
  )
}
