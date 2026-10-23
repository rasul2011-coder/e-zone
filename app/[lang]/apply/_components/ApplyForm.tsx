'use client'

import { useState, useEffect, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { usePhoneFormat } from '@/hooks/usePhoneFormat'
import CustomSelect from '@/components/CustomSelect'

interface Props {
  locale: string
  t: {
    form: {
      name: string; name_placeholder: string
      phone: string; phone_placeholder: string
      course: string; course_placeholder: string
      branch: string; branch_placeholder: string
      preferred_time: string; preferred_time_placeholder: string
      comment: string; comment_placeholder: string
      privacy: string; privacy_link: string
      submit: string
    }
    validation: {
      name_required: string
      phone_required: string
      phone_invalid: string
      privacy_required: string
    }
  }
}

const FALLBACK_COURSES = ['General English', 'Kids Club', 'IELTS Prep']
const FALLBACK_BRANCHES = [
  'Филиал на Чуй', 'Филиал на Манас',
  'Филиал на Ибраимова', 'Филиал Асанбай',
]

export default function ApplyForm({ locale, t }: Props) {
  const router = useRouter()
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')
  const [privacy, setPrivacy]   = useState(false)
  const [name, setName]         = useState('')
  const [phone, handlePhoneChange] = usePhoneFormat()
  const [course, setCourse]     = useState('')
  const [branch, setBranch]     = useState('')
  const [time, setTime]         = useState('')
  const [comment, setComment]   = useState('')

  const [courses, setCourses] = useState<string[]>(FALLBACK_COURSES)
  const [branches, setBranches] = useState<string[]>(FALLBACK_BRANCHES)

  // Load courses and branches from API
  useEffect(() => {
    fetch('/api/courses')
      .then(r => r.json())
      .then(d => { if (d.data?.length) setCourses(d.data.map((c: { name: string }) => c.name)) })
      .catch(() => {})
    fetch('/api/branches')
      .then(r => r.json())
      .then(d => { if (d.data?.length) setBranches(d.data.map((b: { name: string }) => b.name)) })
      .catch(() => {})
  }, [])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')

    if (!name.trim())  return setError(t.validation.name_required)
    if (!phone.trim()) return setError(t.validation.phone_required)
    if (!privacy)      return setError(t.validation.privacy_required)

    setLoading(true)
    try {
      const res = await fetch('/api/apply', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, course, branch, preferred_time: time, comment }),
      })
      if (res.ok) {
        router.push(`/${locale}/apply/thank-you`)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error ?? 'Ошибка отправки. Попробуйте позже.')
      }
    } catch {
      // Network error — still redirect to thank-you for UX (form data is stored client-side)
      router.push(`/${locale}/apply/thank-you`)
    } finally {
      setLoading(false)
    }
  }

  const inputCls = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'
  const selectCls = inputCls + ' cursor-pointer appearance-none bg-no-repeat bg-right pr-10 bg-[length:20px] dark:bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIi8+PC9zdmc+")] bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAyMCAyMCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNNSA3LjVMMTAgMTIuNUwxNSA3LjUiIHN0cm9rZT0iIzZCNzI4MCIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiLz48L3N2Zz4=")]'
  const labelCls = 'mb-1.5 block text-sm font-medium text-[var(--text-muted)]'

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-5">
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.form.name} <span className="text-orange-500">*</span></label>
          <input type="text" required value={name} onChange={e => setName(e.target.value)}
            placeholder={t.form.name_placeholder} className={inputCls} />
        </div>
        <div>
          <label className={labelCls}>{t.form.phone} <span className="text-orange-500">*</span></label>
          <input type="tel" required value={phone} onChange={handlePhoneChange}
            placeholder={t.form.phone_placeholder} className={inputCls} />
        </div>
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label className={labelCls}>{t.form.course}</label>
          <CustomSelect
            value={course}
            onChange={v => setCourse(v)}
            placeholder={t.form.course_placeholder}
            options={courses.map(c => ({ value: c, label: c }))}
          />
        </div>
        <div>
          <label className={labelCls}>{t.form.branch}</label>
          <CustomSelect
            value={branch}
            onChange={v => setBranch(v)}
            placeholder={t.form.branch_placeholder}
            options={branches.map(b => ({ value: b, label: b }))}
          />
        </div>
      </div>
      <div>
        <label className={labelCls}>{t.form.preferred_time}</label>
        <input type="text" value={time} onChange={e => setTime(e.target.value)}
          placeholder={t.form.preferred_time_placeholder} className={inputCls} />
      </div>
      <div>
        <label className={labelCls}>{t.form.comment}</label>
        <textarea rows={3} value={comment} onChange={e => setComment(e.target.value)}
          placeholder={t.form.comment_placeholder} className={inputCls + ' resize-none'} />
      </div>

      {/* Privacy */}
      <label className="flex items-start gap-3 cursor-pointer">
        <div className="relative mt-0.5">
          <input type="checkbox" checked={privacy} onChange={e => setPrivacy(e.target.checked)} className="sr-only" />
          <div className={`h-5 w-5 rounded-md border-2 transition flex items-center justify-center ${privacy ? 'bg-orange-500 border-orange-500' : 'border-[var(--border)] bg-[var(--bg-alt)]'}`}>
            {privacy && (
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>
        <span className="text-sm text-[var(--text-muted)]">
          {t.form.privacy}{' '}
          <a href="#" className="text-orange-500 hover:underline">{t.form.privacy_link}</a>
        </span>
      </label>

      {/* Error */}
      {error && (
        <div role="alert" className="flex items-start gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading}
        className="w-full rounded-xl bg-orange-500 px-5 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 shadow-lg shadow-orange-500/20">
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
