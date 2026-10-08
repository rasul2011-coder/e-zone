'use client'

import { useState, useEffect, useRef, type FormEvent } from 'react'

// ─── Preset palettes ──────────────────────────────────────────────────────────
const PRESETS = [
  { name: 'Оранжево-синий (по умолчанию)', primary: '#f97316', accent: '#ea6c0a', navy: '#1a2a4a', navyMid: '#1e3460' },
  { name: 'Синий и голубой',                primary: '#3b82f6', accent: '#2563eb', navy: '#1e3a5f', navyMid: '#1d4ed8' },
  { name: 'Зелёный',                        primary: '#22c55e', accent: '#16a34a', navy: '#14532d', navyMid: '#166534' },
  { name: 'Фиолетовый',                     primary: '#a855f7', accent: '#9333ea', navy: '#2e1065', navyMid: '#3b0764' },
  { name: 'Красный',                        primary: '#ef4444', accent: '#dc2626', navy: '#450a0a', navyMid: '#7f1d1d' },
  { name: 'Розовый',                        primary: '#ec4899', accent: '#db2777', navy: '#500724', navyMid: '#831843' },
  { name: 'Жёлтый',                         primary: '#eab308', accent: '#ca8a04', navy: '#422006', navyMid: '#713f12' },
  { name: 'Бирюзовый',                      primary: '#14b8a6', accent: '#0d9488', navy: '#042f2e', navyMid: '#134e4a' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────
function isValidHex(v: string) { return /^#[0-9a-fA-F]{6}$/.test(v) }

function ColorInput({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const valid = isValidHex(value)
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-medium text-white/50">{label}</label>
      <div className="flex items-center gap-3">
        {/* Native color picker */}
        <input
          type="color"
          value={valid ? value : '#ffffff'}
          onChange={e => onChange(e.target.value)}
          className="h-10 w-12 cursor-pointer rounded-lg border border-white/10 bg-transparent p-0.5"
        />
        {/* Hex text input */}
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          maxLength={7}
          placeholder="#f97316"
          className={`flex-1 rounded-xl border px-4 py-2.5 text-sm text-white bg-white/5 outline-none transition focus:ring-2 ${
            valid || value === '' ? 'border-white/10 focus:border-orange-500 focus:ring-orange-500/20' : 'border-red-500/50 focus:border-red-500 focus:ring-red-500/20'
          }`}
        />
        {/* Live swatch */}
        {valid && (
          <div className="h-10 w-10 shrink-0 rounded-xl border border-white/10" style={{ background: value }} />
        )}
      </div>
    </div>
  )
}

// ─── Tabs ─────────────────────────────────────────────────────────────────────
type Tab = 'security' | 'colors' | 'contacts' | 'payment'

export default function SettingsClient({ adminEmail }: { adminEmail: string }) {
  const [tab, setTab] = useState<Tab>('security')

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-white">Настройки</h1>
        <p className="mt-0.5 text-sm text-white/40">Безопасность, внешний вид и контакты</p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 rounded-2xl border border-white/10 bg-white/5 p-1 w-fit flex-wrap">
        {([
          { key: 'security', label: '🔒 Безопасность' },
          { key: 'colors',   label: '🎨 Цвета сайта'  },
          { key: 'contacts', label: '📞 Контакты'     },
          { key: 'payment',  label: '💳 Оплата / QR'  },
        ] as { key: Tab; label: string }[]).map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              tab === t.key
                ? 'bg-orange-500 text-white shadow'
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'security' && <SecurityTab adminEmail={adminEmail} />}
      {tab === 'colors'   && <ColorsTab />}
      {tab === 'contacts' && <ContactsTab />}
      {tab === 'payment'  && <PaymentTab />}
    </div>
  )
}

// ─── Security Tab ─────────────────────────────────────────────────────────────
function SecurityTab({ adminEmail }: { adminEmail: string }) {
  // Change password state
  const [cp, setCp] = useState({ current: '', next: '', confirm: '' })
  const [cpShow, setCpShow] = useState({ current: false, next: false })
  const [cpLoading, setCpLoading] = useState(false)
  const [cpMsg, setCpMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  // Change email state
  const [ce, setCe] = useState({ email: adminEmail, password: '' })
  const [ceLoading, setCeLoading] = useState(false)
  const [ceMsg, setCeMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/25 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  async function handleChangePassword(e: FormEvent) {
    e.preventDefault()
    setCpMsg(null)
    if (cp.next !== cp.confirm) { setCpMsg({ type: 'err', text: 'Пароли не совпадают' }); return }
    if (cp.next.length < 6)    { setCpMsg({ type: 'err', text: 'Минимум 6 символов' });   return }
    setCpLoading(true)
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: cp.current, newPassword: cp.next }),
      })
      const d = await res.json()
      if (!res.ok) { setCpMsg({ type: 'err', text: d.error }); return }
      setCpMsg({ type: 'ok', text: 'Пароль успешно изменён' })
      setCp({ current: '', next: '', confirm: '' })
    } catch { setCpMsg({ type: 'err', text: 'Ошибка сервера' }) }
    finally  { setCpLoading(false) }
  }

  async function handleChangeEmail(e: FormEvent) {
    e.preventDefault()
    setCeMsg(null)
    setCeLoading(true)
    try {
      const res = await fetch('/api/admin/change-email', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: ce.email, currentPassword: ce.password }),
      })
      const d = await res.json()
      if (!res.ok) { setCeMsg({ type: 'err', text: d.error }); return }
      setCeMsg({ type: 'ok', text: 'Email успешно изменён' })
      setCe(p => ({ ...p, password: '' }))
    } catch { setCeMsg({ type: 'err', text: 'Ошибка сервера' }) }
    finally  { setCeLoading(false) }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Change password */}
      <form onSubmit={handleChangePassword} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white mb-0.5">Смена пароля</h2>
          <p className="text-xs text-white/40">Используется для входа в Admin Panel</p>
        </div>

        {/* Current */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Текущий пароль</label>
          <div className="relative">
            <input type={cpShow.current ? 'text' : 'password'} required value={cp.current}
              onChange={e => setCp(p => ({ ...p, current: e.target.value }))}
              className={inp + ' pr-11'} placeholder="••••••••" />
            <button type="button" onClick={() => setCpShow(p => ({ ...p, current: !p.current }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <EyeIcon show={cpShow.current} />
            </button>
          </div>
        </div>
        {/* New */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Новый пароль</label>
          <div className="relative">
            <input type={cpShow.next ? 'text' : 'password'} required value={cp.next}
              onChange={e => setCp(p => ({ ...p, next: e.target.value }))}
              className={inp + ' pr-11'} placeholder="Минимум 6 символов" />
            <button type="button" onClick={() => setCpShow(p => ({ ...p, next: !p.next }))}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              <EyeIcon show={cpShow.next} />
            </button>
          </div>
        </div>
        {/* Confirm */}
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Повторите новый пароль</label>
          <input type="password" required value={cp.confirm}
            onChange={e => setCp(p => ({ ...p, confirm: e.target.value }))}
            className={inp} placeholder="••••••••" />
        </div>

        {cpMsg && <Msg {...cpMsg} />}

        <button type="submit" disabled={cpLoading}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
          {cpLoading ? 'Сохранение...' : 'Изменить пароль'}
        </button>
      </form>

      {/* Change email */}
      <form onSubmit={handleChangeEmail} className="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4">
        <div>
          <h2 className="text-base font-bold text-white mb-0.5">Email для входа</h2>
          <p className="text-xs text-white/40">На этот email привязан аккаунт администратора</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Новый email</label>
          <input type="email" required value={ce.email}
            onChange={e => setCe(p => ({ ...p, email: e.target.value }))}
            className={inp} placeholder="admin@example.com" />
        </div>
        <div className="space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Текущий пароль (для подтверждения)</label>
          <input type="password" required value={ce.password}
            onChange={e => setCe(p => ({ ...p, password: e.target.value }))}
            className={inp} placeholder="••••••••" />
        </div>

        {ceMsg && <Msg {...ceMsg} />}

        <button type="submit" disabled={ceLoading}
          className="w-full rounded-xl bg-orange-500 py-3 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
          {ceLoading ? 'Сохранение...' : 'Изменить email'}
        </button>
      </form>
    </div>
  )
}

// ─── Colors Tab ───────────────────────────────────────────────────────────────
function ColorsTab() {
  const [colors, setColors] = useState({
    brand_primary: '#f97316',
    brand_accent:  '#ea6c0a',
    brand_navy:    '#1a2a4a',
    brand_navy_mid:'#1e3460',
  })
  const [loading,  setLoading]  = useState(true)
  const [saving,   setSaving]   = useState(false)
  const [msg,      setMsg]      = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [preview,  setPreview]  = useState(false)

  useEffect(() => {
    fetch('/api/admin/brand-colors').then(r => r.json()).then(d => {
      if (d.data) {
        setColors(p => ({
          brand_primary:  d.data.brand_primary  || p.brand_primary,
          brand_accent:   d.data.brand_accent   || p.brand_accent,
          brand_navy:     d.data.brand_navy     || p.brand_navy,
          brand_navy_mid: d.data.brand_navy_mid || p.brand_navy_mid,
        }))
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  function applyPreset(preset: typeof PRESETS[0]) {
    setColors({
      brand_primary:  preset.primary,
      brand_accent:   preset.accent,
      brand_navy:     preset.navy,
      brand_navy_mid: preset.navyMid,
    })
    setMsg(null)
  }

  // Live preview — inject CSS vars into current page
  function togglePreview() {
    if (!preview) {
      document.documentElement.style.setProperty('--orange',      colors.brand_primary)
      document.documentElement.style.setProperty('--orange-dark', colors.brand_accent)
      document.documentElement.style.setProperty('--navy',        colors.brand_navy)
      document.documentElement.style.setProperty('--navy-mid',    colors.brand_navy_mid)
      document.documentElement.style.setProperty('--bg-section',  colors.brand_navy)
    } else {
      // Reset
      document.documentElement.style.removeProperty('--orange')
      document.documentElement.style.removeProperty('--orange-dark')
      document.documentElement.style.removeProperty('--navy')
      document.documentElement.style.removeProperty('--navy-mid')
      document.documentElement.style.removeProperty('--bg-section')
    }
    setPreview(p => !p)
  }

  async function handleSave() {
    setMsg(null)
    setSaving(true)
    try {
      const res = await fetch('/api/admin/brand-colors', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(colors),
      })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'err', text: d.error }); return }
      setMsg({ type: 'ok', text: 'Цвета сохранены! Перезагрузите страницу сайта чтобы увидеть изменения.' })
      setPreview(false)
    } catch { setMsg({ type: 'err', text: 'Ошибка сервера' }) }
    finally  { setSaving(false) }
  }

  if (loading) return <p className="text-white/40 py-8 text-center">Загрузка...</p>

  const allValid = Object.values(colors).every(isValidHex)

  return (
    <div className="space-y-6">
      {/* Presets */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white mb-1">Готовые темы</h2>
        <p className="text-xs text-white/40 mb-4">Выберите готовую палитру или настройте цвета вручную ниже</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          {PRESETS.map(preset => (
            <button
              key={preset.name}
              onClick={() => applyPreset(preset)}
              className="flex items-center gap-3 rounded-xl border border-white/10 px-3 py-2.5 text-left hover:bg-white/5 transition group"
            >
              {/* Color dots */}
              <div className="flex gap-1 shrink-0">
                <div className="h-5 w-5 rounded-full border border-white/10" style={{ background: preset.primary }} />
                <div className="h-5 w-5 rounded-full border border-white/10" style={{ background: preset.navy }} />
              </div>
              <span className="text-xs text-white/60 group-hover:text-white transition leading-tight">{preset.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Manual color pickers */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white mb-1">Ручная настройка</h2>
        <p className="text-xs text-white/40 mb-5">Введите HEX-код или выберите цвет пипеткой</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <ColorInput
            label="Основной цвет (кнопки, акценты)"
            value={colors.brand_primary}
            onChange={v => setColors(p => ({ ...p, brand_primary: v }))}
          />
          <ColorInput
            label="Тёмный акцент (hover состояния)"
            value={colors.brand_accent}
            onChange={v => setColors(p => ({ ...p, brand_accent: v }))}
          />
          <ColorInput
            label="Тёмный фон (шапка, секции)"
            value={colors.brand_navy}
            onChange={v => setColors(p => ({ ...p, brand_navy: v }))}
          />
          <ColorInput
            label="Тёмный фон 2 (градиент)"
            value={colors.brand_navy_mid}
            onChange={v => setColors(p => ({ ...p, brand_navy_mid: v }))}
          />
        </div>

        {/* Preview strip */}
        <div className="mt-5 rounded-xl overflow-hidden h-12 flex">
          <div className="flex-1" style={{ background: colors.brand_navy }} />
          <div className="flex-1" style={{ background: colors.brand_navy_mid }} />
          <div className="flex-1" style={{ background: colors.brand_primary }} />
          <div className="flex-1" style={{ background: colors.brand_accent }} />
        </div>
        <p className="text-xs text-white/30 mt-2 text-center">Предпросмотр палитры</p>
      </div>

      {msg && <Msg {...msg} />}

      <div className="flex gap-3 flex-wrap">
        <button
          onClick={togglePreview}
          className={`rounded-xl border px-5 py-2.5 text-sm font-medium transition ${
            preview ? 'border-orange-500 text-orange-400 bg-orange-500/10' : 'border-white/10 text-white/60 hover:bg-white/5'
          }`}
        >
          {preview ? '👁 Предпросмотр включён' : '👁 Включить предпросмотр'}
        </button>
        <button
          onClick={handleSave}
          disabled={saving || !allValid}
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
        >
          {saving ? 'Сохранение...' : 'Сохранить цвета'}
        </button>
      </div>
    </div>
  )
}

// ─── Contacts Tab ─────────────────────────────────────────────────────────────
function ContactsTab() {
  const [form, setForm] = useState({ phone: '', email: '', whatsapp: '', instagram: '', telegram: '', address: '', workingHours: '' })
  const [loading, setLoading] = useState(true)
  const [saving,  setSaving]  = useState(false)
  const [msg,     setMsg]     = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  useEffect(() => {
    fetch('/api/admin/settings').then(r => r.json()).then(d => {
      if (d.contacts) {
        setForm({
          phone:        d.contacts.phone        ?? '',
          email:        d.contacts.email        ?? '',
          whatsapp:     d.contacts.whatsapp     ?? '',
          instagram:    d.contacts.instagram    ?? '',
          telegram:     d.contacts.telegram     ?? '',
          address:      d.contacts.address      ?? '',
          workingHours: d.contacts.workingHours ?? '',
        })
      }
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  async function handleSave(e: FormEvent) {
    e.preventDefault()
    setMsg(null); setSaving(true)
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contacts: form }),
      })
      const d = await res.json()
      if (!res.ok) { setMsg({ type: 'err', text: d.error }); return }
      setMsg({ type: 'ok', text: 'Контакты сохранены' })
    } catch { setMsg({ type: 'err', text: 'Ошибка сервера' }) }
    finally  { setSaving(false) }
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/25 outline-none transition focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20'

  if (loading) return <p className="text-white/40 py-8 text-center">Загрузка...</p>

  return (
    <form onSubmit={handleSave} className="rounded-2xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-base font-bold text-white mb-1">Контактные данные</h2>
      <p className="text-xs text-white/40 mb-5">Отображаются в футере и на странице контактов</p>
      <div className="grid gap-4 sm:grid-cols-2">
        {[
          { key: 'phone',        label: 'Телефон',       placeholder: '+996 700 000-000' },
          { key: 'email',        label: 'Email',          placeholder: 'info@english-zone.kg' },
          { key: 'whatsapp',     label: 'WhatsApp',       placeholder: '+996700000000' },
          { key: 'instagram',    label: 'Instagram',      placeholder: '@englishzone.kg' },
          { key: 'telegram',     label: 'Telegram',       placeholder: '@englishzone' },
          { key: 'workingHours', label: 'Режим работы',   placeholder: 'Пн–Сб: 09:00–20:00' },
        ].map(f => (
          <div key={f.key} className="space-y-1.5">
            <label className="block text-xs font-medium text-white/50">{f.label}</label>
            <input
              value={(form as Record<string, string>)[f.key]}
              onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
              className={inp}
              placeholder={f.placeholder}
            />
          </div>
        ))}
        <div className="sm:col-span-2 space-y-1.5">
          <label className="block text-xs font-medium text-white/50">Адрес</label>
          <input
            value={form.address}
            onChange={e => setForm(p => ({ ...p, address: e.target.value }))}
            className={inp}
            placeholder="г. Бишкек, ул. Чуй 123"
          />
        </div>
      </div>

      {msg && <div className="mt-4"><Msg {...msg} /></div>}

      <div className="mt-5 flex justify-end">
        <button type="submit" disabled={saving}
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
          {saving ? 'Сохранение...' : 'Сохранить контакты'}
        </button>
      </div>
    </form>
  )
}

// ─── Shared components ────────────────────────────────────────────────────────
function Msg({ type, text }: { type: 'ok' | 'err'; text: string }) {
  return (
    <div className={`flex items-start gap-2.5 rounded-xl border px-4 py-3 text-sm ${
      type === 'ok'
        ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
        : 'border-red-500/20 bg-red-500/10 text-red-400'
    }`}>
      <span className="shrink-0 mt-0.5">{type === 'ok' ? '✓' : '✕'}</span>
      {text}
    </div>
  )
}

function EyeIcon({ show }: { show: boolean }) {
  return show ? (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ) : (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

// ─── Payment Tab ──────────────────────────────────────────────────────────────
function PaymentTab() {
  const [qrPreview,  setQrPreview]  = useState('')
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState<{ type: 'ok' | 'err'; text: string } | null>(null)
  const [prices, setPrices] = useState({
    generalEnglish: '3500',
    kidsClub:       '3000',
    ieltsPreperation: '5500',
  })
  const [note, setNote] = useState('Переведите точную сумму за первый месяц обучения на карту по QR-коду. После оплаты сделайте скриншот чека и загрузите его в форме регистрации.')
  const fileRef = useRef<HTMLInputElement>(null)

  // Load existing QR from public
  useEffect(() => {
    fetch('/payment-qr.png', { method: 'HEAD' })
      .then(r => { if (r.ok) setQrPreview('/payment-qr.png') })
      .catch(() => {})
  }, [])

  function handleFile(f: File) {
    if (f.size > 2 * 1024 * 1024) { setMsg({ type: 'err', text: 'Файл слишком большой (макс. 2 МБ)' }); return }
    const reader = new FileReader()
    reader.onload = e => setQrPreview(e.target?.result as string)
    reader.readAsDataURL(f)
    setMsg(null)
  }

  async function handleSave() {
    setSaving(true); setMsg(null)
    try {
      // Save prices + note to site_settings
      const items = [
        { key: 'payment_price_general',    value: prices.generalEnglish },
        { key: 'payment_price_kids',       value: prices.kidsClub },
        { key: 'payment_price_ielts',      value: prices.ieltsPreperation },
        { key: 'payment_note',             value: note },
      ]
      await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteSettings: items }),
      })

      // Upload QR as base64 → save to site_settings as well
      if (qrPreview && qrPreview.startsWith('data:')) {
        await fetch('/api/admin/settings', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ siteSettings: [{ key: 'payment_qr_base64', value: qrPreview }] }),
        })
      }
      setMsg({ type: 'ok', text: 'Настройки оплаты сохранены' })
    } catch { setMsg({ type: 'err', text: 'Ошибка сохранения' }) }
    finally { setSaving(false) }
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">

        {/* QR Upload */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-bold text-white mb-1">QR-код для оплаты</h2>
          <p className="text-xs text-white/40 mb-4">Загрузите QR-код вашей карты — он будет показан студентам на шаге оплаты</p>

          <div
            onClick={() => fileRef.current?.click()}
            className="cursor-pointer rounded-2xl border-2 border-dashed border-white/15 hover:border-orange-500/50 transition p-4 flex flex-col items-center gap-3"
          >
            <input ref={fileRef} type="file" accept="image/*" className="sr-only"
              onChange={e => { const f = e.target.files?.[0]; if (f) handleFile(f) }} />

            {qrPreview ? (
              <div className="space-y-2 w-full text-center">
                <img
                  src={qrPreview}
                  alt="QR код"
                  className="mx-auto w-40 h-40 object-contain rounded-xl border border-white/10"
                  onError={() => setQrPreview('')}
                />
                <p className="text-xs text-emerald-400 font-medium">✓ QR загружен</p>
                <p className="text-[11px] text-white/30">Нажмите чтобы заменить</p>
              </div>
            ) : (
              <>
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/10">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
                  </svg>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-white/70">Загрузить QR-код</p>
                  <p className="text-xs text-white/30 mt-0.5">PNG, JPG — до 2 МБ</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Prices */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <h2 className="text-base font-bold text-white mb-1">Стоимость курсов</h2>
          <p className="text-xs text-white/40 mb-4">Отображается в форме регистрации при выборе курса</p>
          <div className="space-y-3">
            {[
              { key: 'generalEnglish',    label: 'General English', placeholder: '3500' },
              { key: 'kidsClub',          label: 'Kids Club',       placeholder: '3000' },
              { key: 'ieltsPreperation',  label: 'IELTS Prep',      placeholder: '5500' },
            ].map(f => (
              <div key={f.key}>
                <label className="mb-1 block text-xs text-white/50">{f.label} (сом/мес)</label>
                <div className="relative">
                  <input
                    type="number"
                    value={(prices as Record<string, string>)[f.key]}
                    onChange={e => setPrices(p => ({ ...p, [f.key]: e.target.value }))}
                    className={inp + ' pr-14'}
                    placeholder={f.placeholder}
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-white/30">сом</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment note */}
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-base font-bold text-white mb-1">Инструкция для студента</h2>
        <p className="text-xs text-white/40 mb-3">Показывается под QR-кодом на странице оплаты</p>
        <textarea
          value={note}
          onChange={e => setNote(e.target.value)}
          rows={3}
          className={inp + ' resize-none'}
        />
      </div>

      {/* Preview */}
      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
        <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest mb-3">Предпросмотр</p>
        <div className="flex items-center gap-4">
          {qrPreview ? (
            <img src={qrPreview} alt="QR" className="w-20 h-20 object-contain rounded-xl border border-white/10" onError={() => {}} />
          ) : (
            <div className="w-20 h-20 rounded-xl border border-white/10 bg-white/5 flex items-center justify-center text-white/20 text-xs">QR</div>
          )}
          <div>
            <p className="text-sm font-bold text-white mb-1">Оплата через QR</p>
            <p className="text-xs text-white/50 max-w-xs">{note}</p>
          </div>
        </div>
      </div>

      {msg && <Msg {...msg} />}

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving}
          className="rounded-xl bg-orange-500 px-6 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
          {saving ? 'Сохранение...' : 'Сохранить настройки оплаты'}
        </button>
      </div>
    </div>
  )
}
