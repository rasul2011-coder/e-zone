'use client'

import { useState, useRef, useEffect, type FormEvent, type KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

// ─── Types ────────────────────────────────────────────────────────────────────
interface ChatMessage { role: 'assistant' | 'user'; text: string }

interface UserData {
  name: string
  phone: string
  email: string
  courseName: string
  branch: string
  comment: string
  paymentAmount: number
}

const COURSES = [
  { name: 'General English', price: 3500, desc: 'Разговорный и деловой английский, 16+' },
  { name: 'Kids Club',       price: 3000, desc: 'Английский для детей 5–15 лет' },
  { name: 'IELTS Prep',      price: 5500, desc: 'Подготовка к IELTS, 14+' },
]

const QUICK_PICKS_RU = ['General English', 'Kids Club', 'IELTS Prep']
const QUICK_PICKS_KG = ['General English', 'Kids Club', 'IELTS Prep']

// ─── Step 1: AI Chat for course selection ─────────────────────────────────────
function AiStep({ locale, onDone }: {
  locale: string
  onDone: (data: { courseName: string; comment: string }) => void
}) {
  const isRu = locale !== 'kg'
  const [messages, setMessages] = useState<ChatMessage[]>([{
    role: 'assistant',
    text: isRu
      ? '👋 Привет! Я помогу подобрать курс и оформить регистрацию.\n\nСкажите — для кого выбираете курс и какая цель? (или нажмите одну из кнопок ниже)'
      : '👋 Саламатсызбы! Курс тандоого жана катталууга жардам берем.\n\nКим үчүн курс тандап жатасыз жана максатыңыз кандай?',
  }])
  const [input, setInput]     = useState('')
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState('')
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef  = useRef<HTMLTextAreaElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  async function send(text: string) {
    if (!text.trim() || loading) return
    setInput('')
    const userMsg: ChatMessage = { role: 'user', text: text.trim() }
    const loadingMsg: ChatMessage = { role: 'assistant', text: '' }
    setMessages(prev => [...prev, userMsg, { ...loadingMsg }])
    setLoading(true)

    try {
      const history = messages.filter(m => m.text).map(m => ({
        role: m.role === 'assistant' ? 'model' : 'user',
        text: m.text,
      }))

      // Enhanced prompt for registration context
      const systemExtra = isRu
        ? 'Ты помогаешь пользователю выбрать курс English Zone для регистрации. После 1-2 сообщений сделай вывод и напиши: "Рекомендую курс: [название курса]" (один из: General English, Kids Club, IELTS Prep). Будь кратким.'
        : 'Сен колдонуучуга English Zone курстарын тандоого жардам берип жатасың. 1-2 кабарлашуудан кийин: "Сунуштайм: [курс аты]" деп жаз (бири: General English, Kids Club, IELTS Prep).'

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim() + '\n\n[SYSTEM: ' + systemExtra + ']',
          history,
          locale,
        }),
      })
      const data = await res.json()
      const reply: string = data.reply || data.error || (isRu ? 'Ошибка. Попробуйте ещё.' : 'Ката болду.')

      // Auto-detect course recommendation
      const detected = COURSES.find(c => reply.includes(c.name))
      if (detected && !selected) setSelected(detected.name)

      setMessages(prev => [
        ...prev.slice(0, -1),
        { role: 'assistant', text: reply },
      ])
    } catch {
      setMessages(prev => [...prev.slice(0, -1), {
        role: 'assistant',
        text: isRu ? 'Ошибка соединения.' : 'Туташуу катасы.',
      }])
    } finally {
      setLoading(false)
      inputRef.current?.focus()
    }
  }

  function handleKey(e: KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(input) }
  }

  function pickCourse(name: string) {
    setSelected(name)
    send(isRu ? `Хочу записаться на ${name}` : `${name} курсуна жазылгым келет`)
  }

  function handleContinue() {
    const course = selected || (isRu ? 'Не выбран' : 'Тандалган жок')
    const lastAssist = [...messages].reverse().find(m => m.role === 'assistant')?.text || ''
    onDone({ courseName: course, comment: lastAssist.slice(0, 300) })
  }

  return (
    <div className="flex flex-col h-full">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 px-1 pb-2" style={{ minHeight: 280, maxHeight: 360 }}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2.5 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-xl text-xs font-bold mt-0.5 ${
              msg.role === 'assistant'
                ? 'bg-orange-500 text-white'
                : 'bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-muted)]'
            }`}>
              {msg.role === 'assistant' ? 'AI' : '•'}
            </div>
            <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
              msg.role === 'user'
                ? 'bg-orange-500 text-white rounded-tr-sm'
                : 'bg-[var(--bg-alt)] text-[var(--text)] border border-[var(--border)] rounded-tl-sm'
            }`}>
              {msg.text
                ? <span className="whitespace-pre-wrap">{msg.text}</span>
                : <span className="flex gap-1 py-1">
                    {[0,150,300].map(d => <span key={d} className="h-2 w-2 rounded-full bg-current animate-bounce" style={{ animationDelay: `${d}ms` }} />)}
                  </span>
              }
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Quick picks */}
      {messages.length <= 2 && (
        <div className="flex gap-2 flex-wrap py-2">
          {QUICK_PICKS_RU.map(name => (
            <button key={name} onClick={() => pickCourse(name)}
              className="rounded-full border border-[var(--border)] bg-[var(--bg-alt)] px-3 py-1.5 text-xs text-[var(--text-muted)] hover:border-orange-500/50 hover:text-orange-500 transition">
              {name}
            </button>
          ))}
        </div>
      )}

      {/* Selected course badge */}
      {selected && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 px-4 py-2.5 mt-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-500 shrink-0">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          <span className="text-sm text-emerald-600 font-medium">
            {isRu ? `Выбран курс: ${selected}` : `Курс тандалды: ${selected}`}
          </span>
        </div>
      )}

      {/* Input */}
      <div className="flex gap-2 mt-3">
        <textarea
          ref={inputRef}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKey}
          rows={1}
          placeholder={isRu ? 'Напишите вопрос...' : 'Суроо жазыңыз...'}
          className="flex-1 resize-none rounded-2xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-2.5 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20"
          style={{ minHeight: 42 }}
        />
        <button onClick={() => send(input)} disabled={loading || !input.trim()}
          className="flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-2xl bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
          </svg>
        </button>
      </div>

      <button
        onClick={handleContinue}
        className="mt-4 w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition flex items-center justify-center gap-2"
      >
        {isRu ? (selected ? `Продолжить с курсом "${selected}"` : 'Продолжить без выбора курса') : 'Улантуу'}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Step 2: Contact info + QR payment ───────────────────────────────────────
function PaymentStep({ locale, courseName, onDone }: {
  locale: string
  courseName: string
  onDone: (data: { name: string; phone: string; email: string; branch: string }) => void
}) {
  const isRu = locale !== 'kg'
  const course = COURSES.find(c => c.name === courseName)
  const price  = course?.price ?? 3500

  const [name,   setName]   = useState('')
  const [phone,  setPhone]  = useState('')
  const [email,  setEmail]  = useState('')
  const [branch, setBranch] = useState('')
  const [error,  setError]  = useState('')

  const inp = 'w-full rounded-xl border border-[var(--border)] bg-[var(--bg-alt)] px-4 py-3 text-sm text-[var(--text)] placeholder-[var(--text-subtle)] outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  function handleNext() {
    if (!name.trim())  return setError(isRu ? 'Введите имя' : 'Атыңызды жазыңыз')
    if (!phone.trim()) return setError(isRu ? 'Введите телефон' : 'Телефон жазыңыз')
    setError('')
    onDone({ name, phone, email, branch })
  }

  return (
    <div className="space-y-5">
      {/* Course + price summary */}
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 flex items-center justify-between gap-4">
        <div>
          <p className="text-xs text-[var(--text-subtle)] mb-0.5">{isRu ? 'Выбранный курс' : 'Тандалган курс'}</p>
          <p className="font-bold text-[var(--text)]">{courseName || (isRu ? 'Не выбран' : 'Тандалган жок')}</p>
        </div>
        <div className="text-right shrink-0">
          <p className="text-xs text-[var(--text-subtle)] mb-0.5">{isRu ? 'Стоимость/мес' : 'Баасы/ай'}</p>
          <p className="text-lg font-extrabold text-orange-500">{price.toLocaleString()} сом</p>
        </div>
      </div>

      {/* Contact fields */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
            {isRu ? 'Ваше имя' : 'Атыңыз'} <span className="text-orange-500">*</span>
          </label>
          <input value={name} onChange={e => setName(e.target.value)} className={inp}
            placeholder={isRu ? 'Иван' : 'Айбек'} />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
            {isRu ? 'Телефон' : 'Телефон'} <span className="text-orange-500">*</span>
          </label>
          <input value={phone} onChange={e => setPhone(e.target.value)} className={inp}
            placeholder="+996 700 000 000" type="tel" />
        </div>
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">Email</label>
        <input value={email} onChange={e => setEmail(e.target.value)} className={inp}
          placeholder="example@mail.com" type="email" />
      </div>
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text-muted)]">
          {isRu ? 'Филиал' : 'Филиал'}
        </label>
        <select value={branch} onChange={e => setBranch(e.target.value)} className={inp + ' cursor-pointer'}>
          <option value="">{isRu ? 'Выберите филиал' : 'Филиал тандаңыз'}</option>
          {['Филиал на Чуй', 'Филиал на Манас', 'Филиал на Ибраимова', 'Филиал Асанбай'].map(b => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>
      </div>

      {/* QR payment block */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] overflow-hidden">
        <div className="px-5 py-4 border-b border-[var(--border)] flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
            </svg>
          </div>
          <div>
            <p className="font-semibold text-sm text-[var(--text)]">{isRu ? 'Оплата через QR' : 'QR аркылуу төлөм'}</p>
            <p className="text-xs text-[var(--text-subtle)]">{isRu ? 'Отсканируйте и переведите' : 'Сканерлеп которуңуз'}</p>
          </div>
          <div className="ml-auto text-right">
            <p className="text-xs text-[var(--text-subtle)]">{isRu ? 'Сумма' : 'Сумма'}</p>
            <p className="font-bold text-orange-500">{price.toLocaleString()} сом</p>
          </div>
        </div>
        <div className="flex justify-center py-5 px-4">
          <div className="relative w-48 h-48">
            <Image
              src="/payment-qr.png"
              alt="QR код для оплаты"
              fill
              className="object-contain rounded-xl"
              onError={(e) => {
                // Fallback if QR not uploaded yet
                const parent = (e.target as HTMLElement).parentElement
                if (parent) {
                  parent.innerHTML = `<div class="w-full h-full flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-[var(--border)] text-[var(--text-subtle)] text-sm text-center p-4"><svg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round' class='mb-2 opacity-40'><rect x='3' y='3' width='7' height='7'/><rect x='14' y='3' width='7' height='7'/><rect x='14' y='14' width='7' height='7'/><rect x='3' y='14' width='7' height='7'/></svg>QR-код<br/>появится здесь</div>`
                }
              }}
            />
          </div>
        </div>
        <div className="px-5 pb-4 text-center">
          <p className="text-xs text-[var(--text-subtle)]">
            {isRu
              ? 'После перевода нажмите «Далее» и загрузите скриншот чека'
              : 'Которгондон кийин «Кийинки» басып, чек скриншотун жүктөңүз'}
          </p>
        </div>
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}

      <button onClick={handleNext}
        className="w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 transition flex items-center justify-center gap-2">
        {isRu ? 'Я оплатил — загрузить чек' : 'Төлөдүм — чек жүктөй'}
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M5 12h14M12 5l7 7-7 7"/>
        </svg>
      </button>
    </div>
  )
}

// ─── Step 3: Upload receipt ───────────────────────────────────────────────────
function ReceiptStep({ locale, userData, onDone }: {
  locale: string
  userData: UserData
  onDone: () => void
}) {
  const isRu = locale !== 'kg'
  const router = useRouter()
  const [file,      setFile]      = useState<File | null>(null)
  const [preview,   setPreview]   = useState('')
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(f: File) {
    if (f.size > 5 * 1024 * 1024) {
      setError(isRu ? 'Файл слишком большой (макс. 5 МБ)' : 'Файл өтө чоң (макс. 5 МБ)')
      return
    }
    setFile(f)
    setError('')
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit() {
    if (!file && !preview) {
      setError(isRu ? 'Загрузите чек оплаты' : 'Чек жүктөңүз')
      return
    }
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:           userData.name,
          phone:          userData.phone,
          email:          userData.email || undefined,
          courseName:     userData.courseName,
          branch:         userData.branch || undefined,
          comment:        userData.comment || undefined,
          paymentAmount:  userData.paymentAmount,
          paymentReceipt: preview || undefined,
          source:         'register_page',
        }),
      })

      if (res.ok) {
        router.push(`/${locale}/apply/thank-you`)
      } else {
        const d = await res.json().catch(() => ({}))
        setError(d.error || (isRu ? 'Ошибка отправки' : 'Жөнөтүү катасы'))
      }
    } catch {
      setError(isRu ? 'Ошибка соединения' : 'Туташуу катасы')
    } finally {
      setLoading(false)
    }
  }

  async function handleSkip() {
    setLoading(true)
    try {
      await fetch('/api/apply', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name:       userData.name,
          phone:      userData.phone,
          email:      userData.email || undefined,
          courseName: userData.courseName,
          branch:     userData.branch || undefined,
          comment:    userData.comment || undefined,
          source:     'register_page',
        }),
      })
    } catch {}
    router.push(`/${locale}/apply/thank-you`)
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <div className="rounded-2xl bg-[var(--bg-alt)] border border-[var(--border)] p-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wider text-[var(--text-subtle)] mb-3">
          {isRu ? 'Ваша заявка' : 'Сиздин арыз'}
        </p>
        {[
          { label: isRu ? 'Имя' : 'Аты',   value: userData.name },
          { label: isRu ? 'Телефон' : 'Тел', value: userData.phone },
          { label: isRu ? 'Курс' : 'Курс',  value: userData.courseName },
        ].filter(r => r.value).map(row => (
          <div key={row.label} className="flex items-center justify-between text-sm">
            <span className="text-[var(--text-subtle)]">{row.label}</span>
            <span className="font-medium text-[var(--text)]">{row.value}</span>
          </div>
        ))}
      </div>

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={e => e.preventDefault()}
        onClick={() => fileRef.current?.click()}
        className="cursor-pointer rounded-2xl border-2 border-dashed border-[var(--border)] hover:border-orange-500/50 transition bg-[var(--bg-alt)] p-6 text-center"
      >
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }}
        />
        {preview ? (
          <div className="space-y-3">
            <img src={preview} alt="Чек" className="mx-auto max-h-52 rounded-xl object-contain border border-[var(--border)]" />
            <p className="text-xs text-emerald-500 font-medium flex items-center justify-center gap-1.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              {file?.name || (isRu ? 'Чек загружен' : 'Чек жүктөлдү')}
            </p>
            <p className="text-xs text-[var(--text-subtle)]">{isRu ? 'Нажмите чтобы заменить' : 'Алмаштыруу үчүн басыңыз'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
            </div>
            <div>
              <p className="font-semibold text-[var(--text)] text-sm">
                {isRu ? 'Загрузите скриншот чека' : 'Чек скриншотун жүктөңүз'}
              </p>
              <p className="text-xs text-[var(--text-subtle)] mt-1">
                {isRu ? 'PNG, JPG — перетащите или нажмите' : 'PNG, JPG — сүйрөңүз же басыңыз'}
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </p>
      )}

      <div className="flex flex-col gap-3">
        <button onClick={handleSubmit} disabled={loading || !preview}
          className="w-full rounded-2xl bg-orange-500 py-3.5 text-sm font-semibold text-white hover:bg-orange-600 disabled:opacity-50 transition flex items-center justify-center gap-2">
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
              </svg>
              {isRu ? 'Отправляем...' : 'Жиберилүүдө...'}
            </>
          ) : (
            <>
              {isRu ? 'Отправить заявку с чеком' : 'Чек менен арыз жиберүү'}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14M12 5l7 7-7 7"/>
              </svg>
            </>
          )}
        </button>
        <button onClick={handleSkip} disabled={loading}
          className="w-full rounded-2xl border border-[var(--border)] py-3 text-sm text-[var(--text-muted)] hover:bg-[var(--bg-alt)] transition">
          {isRu ? 'Отправить без чека (оплачу позже)' : 'Чексиз жиберүү (кийинчерээк төлөйм)'}
        </button>
      </div>
    </div>
  )
}

// ─── Main flow ────────────────────────────────────────────────────────────────
export default function RegisterFlow({ locale }: { locale: string }) {
  const isRu = locale !== 'kg'
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [courseData, setCourseData] = useState({ courseName: '', comment: '' })
  const [contactData, setContactData] = useState({ name: '', phone: '', email: '', branch: '' })

  const course = COURSES.find(c => c.name === courseData.courseName)

  const STEPS = [
    { n: 1, label: isRu ? 'Курс'    : 'Курс'   },
    { n: 2, label: isRu ? 'Данные'  : 'Маалыматтар' },
    { n: 3, label: isRu ? 'Оплата'  : 'Төлөм'  },
  ]

  return (
    <div className="w-full">
      {/* Step indicator */}
      <div className="flex items-center gap-0 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center flex-1">
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-all ${
              step > s.n
                ? 'bg-emerald-500 text-white'
                : step === s.n
                  ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                  : 'bg-[var(--bg-alt)] border border-[var(--border)] text-[var(--text-subtle)]'
            }`}>
              {step > s.n
                ? <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                : s.n
              }
            </div>
            <div className="mx-2 flex-1">
              <p className={`text-xs font-medium ${step === s.n ? 'text-orange-500' : 'text-[var(--text-subtle)]'}`}>{s.label}</p>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-full h-px mx-1 ${step > s.n ? 'bg-emerald-500' : 'bg-[var(--border)]'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      {step === 1 && (
        <AiStep locale={locale} onDone={(data) => { setCourseData(data); setStep(2) }} />
      )}
      {step === 2 && (
        <PaymentStep
          locale={locale}
          courseName={courseData.courseName}
          onDone={(data) => { setContactData(data); setStep(3) }}
        />
      )}
      {step === 3 && (
        <ReceiptStep
          locale={locale}
          userData={{
            ...contactData,
            courseName:    courseData.courseName,
            comment:       courseData.comment,
            paymentAmount: course?.price ?? 3500,
          }}
          onDone={() => {}}
        />
      )}
    </div>
  )
}
