'use client'

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import Link from 'next/link'

interface FaqItem { question: string; answer: string }
interface Props {
  locale: string
  t: {
    breadcrumb: string; title: string; subtitle: string
    still_have_questions: string; contact_us: string
    default_items: FaqItem[]
  }
  tc: { breadcrumbs: { home: string }; cta: { send: string } }
}

// ─── Accordion ────────────────────────────────────────────────────────────────
function Accordion({ items }: { items: FaqItem[] }) {
  const [open, setOpen] = useState<number | null>(null)
  return (
    <div className="space-y-3">
      {items.map((item, i) => (
        <div key={i} className={`overflow-hidden rounded-2xl border transition-all ${open === i ? 'border-orange-500/40 shadow-md' : 'border-[var(--border)]'} bg-[var(--bg-card)]`}>
          <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}
            className="flex w-full items-center justify-between px-6 py-5 text-left">
            <span className="pr-4 text-base font-semibold text-[var(--text)]">{item.question}</span>
            <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border transition-transform duration-200 ${open === i ? 'rotate-45 border-orange-500/40 text-orange-500' : 'border-[var(--border)] text-[var(--text-muted)]'}`}>
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
            </span>
          </button>
          {open === i && (
            <div className="px-6 pb-5">
              <p className="text-sm leading-relaxed text-[var(--text-muted)]">{item.answer}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

// ─── AI Chat ──────────────────────────────────────────────────────────────────
interface Message {
  role: 'user' | 'assistant'
  text: string
  loading?: boolean
}

const QUICK_QUESTIONS_RU = [
  'Сколько стоит General English?',
  'Есть ли курсы для детей?',
  'Как записаться на пробный урок?',
  'Что такое IELTS Prep?',
  'Сколько человек в группе?',
]
const QUICK_QUESTIONS_KG = [
  'General English канча турат?',
  'Балдар үчүн курстар барбы?',
  'Сынамык сабакка кантип жазылуу?',
  'IELTS Prep деген эмне?',
  'Топто канча адам болот?',
]

function AiChat({ locale }: { locale: string }) {
  const isRu = locale === 'ru'
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      text: isRu
        ? 'Привет! Я AI-помощник English Zone 🎓\n\nМогу ответить на вопросы о наших курсах, ценах, расписании и методиках обучения. Чем могу помочь?'
        : 'Саламатсызбы! Мен English Zone AI жардамчысымын 🎓\n\nКурстар, баалар, сабак убактысы жана окутуу ыкмалары жөнүндө суроолорго жооп бере алам.',
    },
  ])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')

    const userMsg: Message = { role: 'user', text: text.trim() }
    const loadingMsg: Message = { role: 'assistant', text: '', loading: true }
    setMessages(prev => [...prev, userMsg, loadingMsg])
    setLoading(true)

    try {
      const history = messages
        .filter(m => !m.loading)
        .map(m => ({ role: m.role === 'assistant' ? 'model' : 'user', text: m.text }))

      const res = await fetch('/api/ai/chat', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: text.trim(), history, locale }),
      })
      const data = await res.json()
      const reply = data.reply || data.error || (isRu ? 'Ошибка. Попробуйте ещё раз.' : 'Ката. Кайра аракет кылыңыз.')

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: reply },
      ])
    } catch {
      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: isRu ? 'Ошибка соединения. Попробуйте позже.' : 'Туташуу катасы. Кийинчерээк аракет кылыңыз.' },
      ])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    send(input)
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send(input)
    }
  }

  const quickQuestions = isRu ? QUICK_QUESTIONS_RU : QUICK_QUESTIONS_KG

  return (
    <div className="rounded-3xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden shadow-xl">
      {/* Chat header */}
      <div className="flex items-center gap-3 px-6 py-4 border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-orange-600 shadow-lg shadow-orange-500/30">
          {/* Gemini-style spark icon */}
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="white">
            <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
          </svg>
        </div>
        <div>
          <p className="text-sm font-bold text-[var(--text)]">
            {isRu ? 'E-zone AI' : 'E-zone AI'}
          </p>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <p className="text-xs text-[var(--text-subtle)]">
              {isRu ? 'Онлайн · AI Assistant' : 'Онлайн · AI Assistant'}
            </p>
          </div>
        </div>
        <div className="ml-auto">
          <span className="rounded-full bg-orange-500/10 px-2.5 py-1 text-[11px] font-semibold text-orange-500">
            {isRu ? 'Бесплатно' : 'Акысыз'}
          </span>
        </div>
      </div>

      {/* Messages */}
      <div className="h-[420px] overflow-y-auto px-4 py-5 space-y-4">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
            {/* Avatar */}
            {msg.role === 'assistant' ? (
              <div className="h-8 w-8 shrink-0 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="white">
                  <path d="M12 2L9.5 9.5 2 12l7.5 2.5L12 22l2.5-7.5L22 12l-7.5-2.5z"/>
                </svg>
              </div>
            ) : (
              <div className="h-8 w-8 shrink-0 rounded-xl bg-[var(--bg-alt)] border border-[var(--border)] flex items-center justify-center mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[var(--text-muted)]">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}

            {/* Bubble */}
            <div className={`max-w-[78%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white rounded-tr-sm'
                : 'bg-[var(--bg-alt)] text-[var(--text)] border border-[var(--border)] rounded-tl-sm'
            }`}>
              {msg.loading ? (
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: '300ms' }} />
                </span>
              ) : (
                <span className="whitespace-pre-wrap">{msg.text}</span>
              )}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick questions — show only at start */}
      {messages.length <= 1 && (
        <div className="px-4 pb-3">
          <p className="text-xs text-[var(--text-subtle)] mb-2 px-1">
            {isRu ? 'Частые вопросы:' : 'Кеп берилүүчү суроолор:'}
          </p>
          <div className="flex flex-wrap gap-2">
            {quickQuestions.map((q, i) => (
              <button key={i} onClick={() => send(q)}
                className="rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-orange-500/40 hover:text-orange-500 transition">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="border-t border-[var(--border)] px-4 py-3">
        <form onSubmit={handleSubmit} className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKey}
            rows={1}
            placeholder={isRu ? 'Напишите вопрос...' : 'Суроо жазыңыз...'}
            className="flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 max-h-32"
            style={{ minHeight: '44px' }}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white transition hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {loading ? (
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
              </svg>
            )}
          </button>
        </form>
        <p className="mt-2 text-center text-[10px] text-[var(--text-subtle)]">
          {isRu
            ? 'AI отвечает только на вопросы о курсах English Zone'
            : 'AI English Zone курстары боюнча суроолорго гана жооп берет'}
        </p>
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────
export default function FaqClient({ locale, t, tc }: Props) {
  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="section-hero py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8 text-center relative z-10">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">FAQ</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">

            {/* Left — FAQ accordion */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--text)] mb-1">
                  {locale === 'ru' ? 'Частые вопросы' : 'Кеп берилүүчү суроолор'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === 'ru' ? 'Ответы на самые популярные вопросы' : 'Эң кеп берилүүчү суроолорго жооптор'}
                </p>
              </div>
              <Accordion items={t.default_items} />

              <div className="mt-8 rounded-2xl border border-orange-500/20 bg-orange-500/5 p-6 text-center">
                <p className="font-bold text-[var(--text)] mb-3">{t.still_have_questions}</p>
                <Link href={`/${locale}/contacts`}
                  className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
                  {t.contact_us}
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
                </Link>
              </div>
            </div>

            {/* Right — AI Chat */}
            <div>
              <div className="mb-6">
                <h2 className="text-xl font-bold text-[var(--text)] mb-1">
                  {locale === 'ru' ? 'Спросите E-zone AI' : 'E-zone AI дан сураңыз'}
                </h2>
                <p className="text-sm text-[var(--text-muted)]">
                  {locale === 'ru'
                    ? 'Умный ассистент ответит на вопросы о курсах English Zone'
                    : 'Акылдуу ассистент English Zone курстары жөнүндө суроолорго жооп берет'}
                </p>
              </div>
              <AiChat locale={locale} />
            </div>

          </div>
        </div>
      </section>
    </div>
  )
}
