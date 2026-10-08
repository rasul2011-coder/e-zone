'use client'

import { useState, useEffect, useCallback } from 'react'

interface Branch {
  id: number; name: string; slug: string
  address: string; phone: string; email?: string
  workingHours: string; description: string
  latitude?: string | null; longitude?: string | null
  image?: string | null; isActive: boolean; sortOrder: number
}

const EMPTY: Partial<Branch> = {
  name: '', address: '', phone: '', email: '',
  workingHours: 'Пн–Сб: 09:00–20:00', description: '',
  latitude: '', longitude: '', image: '', isActive: true, sortOrder: 0,
}

// Deterministic colour per branch id
const BRANCH_COLORS = [
  'from-orange-500/20 to-orange-500/5',
  'from-blue-500/20 to-blue-500/5',
  'from-emerald-500/20 to-emerald-500/5',
  'from-violet-500/20 to-violet-500/5',
]
const branchGrad = (id: number) => BRANCH_COLORS[id % BRANCH_COLORS.length]

function TwoGisButton({ branch }: { branch: Branch }) {
  const href =
    branch.latitude && branch.longitude
      ? `https://2gis.kg/bishkek?m=${branch.longitude}%2C${branch.latitude}%2F17`
      : `https://2gis.kg/search/${encodeURIComponent(branch.address)}`

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/50 hover:border-orange-500/40 hover:text-orange-400 transition"
      title="Открыть в 2ГИС"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
      </svg>
      2ГИС
    </a>
  )
}

export default function BranchesClient() {
  const [list, setList]       = useState<Branch[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [form, setForm]       = useState<Partial<Branch>>(EMPTY)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/branches')
    const d = await r.json()
    setList(d.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    if (modal === 'add') {
      await fetch('/api/admin/branches', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/branches/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false); setModal(null); load()
  }

  async function toggleActive(b: Branch) {
    await fetch(`/api/admin/branches/${b.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !b.isActive }),
    })
    load()
  }

  async function del(id: number) {
    if (!confirm('Удалить филиал?')) return
    await fetch(`/api/admin/branches/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Филиалы</h1>
          <p className="mt-0.5 text-sm text-white/40">{list.length} филиалов</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setModal('add') }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить
        </button>
      </div>

      {/* Cards grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 py-12 text-center text-white/40">Загрузка...</p>
        ) : list.length === 0 ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-white/40 mb-3">Филиалов нет</p>
            <button onClick={() => { setForm(EMPTY); setModal('add') }}
              className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
              Добавить первый
            </button>
          </div>
        ) : list.map(b => (
          <div key={b.id} className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden hover:border-white/20 transition">
            {/* Coloured header strip */}
            <div className={`bg-gradient-to-br ${branchGrad(b.id)} h-2`} />
            <div className="p-5">
              {/* Title row */}
              <div className="flex items-start justify-between gap-2 mb-3">
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-white truncate">{b.name}</p>
                  <p className="text-xs text-white/40 truncate mt-0.5">{b.address}</p>
                </div>
                <button onClick={() => toggleActive(b)}
                  className={`h-6 w-11 shrink-0 rounded-full border transition ${b.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white/10 border-white/20'}`}>
                  <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${b.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              {/* Info */}
              <div className="space-y-1.5 mb-4">
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400 shrink-0">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/>
                  </svg>
                  {b.phone}
                </p>
                <p className="flex items-center gap-2 text-xs text-white/50">
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400 shrink-0">
                    <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                  </svg>
                  {b.workingHours}
                </p>
                {b.latitude && b.longitude && (
                  <p className="flex items-center gap-2 text-xs text-white/30">
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400 shrink-0">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    {Number(b.latitude).toFixed(4)}, {Number(b.longitude).toFixed(4)}
                  </p>
                )}
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2">
                <TwoGisButton branch={b} />
                <div className="flex-1" />
                <button onClick={() => { setForm(b); setModal('edit') }}
                  className="rounded-xl border border-white/10 px-3 py-1.5 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white transition">
                  Изменить
                </button>
                <button onClick={() => del(b.id)}
                  className="rounded-xl border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-white">{modal === 'add' ? 'Добавить филиал' : 'Редактировать филиал'}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Название *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Филиал на Чуй" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Адрес *</label>
                <input value={form.address ?? ''} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} className={inp} placeholder="ул. Чуй 123, Бишкек" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Телефон *</label>
                  <input value={form.phone ?? ''} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} className={inp} placeholder="+996 700 123-456" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Email</label>
                  <input value={form.email ?? ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} className={inp} placeholder="branch@example.com" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Режим работы</label>
                <input value={form.workingHours ?? ''} onChange={e => setForm(f => ({ ...f, workingHours: e.target.value }))} className={inp} placeholder="Пн–Сб: 09:00–20:00" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Описание</label>
                <textarea value={form.description ?? ''} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} className={inp + ' resize-none'} rows={2} placeholder="Центральный офис в самом сердце Бишкека" />
              </div>

              {/* 2GIS coords */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-white/50">Координаты 2ГИС</label>
                  <a
                    href="https://2gis.kg"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-orange-400 hover:text-orange-300 transition"
                  >
                    Найти на 2ГИС →
                  </a>
                </div>
                <p className="text-xs text-white/30 mb-2">
                  Откройте 2ГИС, найдите адрес, кликните правой кнопкой → «Что здесь?» — скопируйте координаты.
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="mb-1 block text-xs text-white/30">Широта (lat)</label>
                    <input
                      type="number" step="0.000001"
                      value={form.latitude ?? ''}
                      onChange={e => setForm(f => ({ ...f, latitude: e.target.value }))}
                      className={inp} placeholder="42.870000"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs text-white/30">Долгота (lng)</label>
                    <input
                      type="number" step="0.000001"
                      value={form.longitude ?? ''}
                      onChange={e => setForm(f => ({ ...f, longitude: e.target.value }))}
                      className={inp} placeholder="74.590000"
                    />
                  </div>
                </div>
                {form.latitude && form.longitude && (
                  <a
                    href={`https://2gis.kg/bishkek?m=${form.longitude}%2C${form.latitude}%2F17`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex items-center gap-1.5 text-xs text-orange-400 hover:text-orange-300 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/>
                    </svg>
                    Проверить на 2ГИС
                  </a>
                )}
              </div>

              <div>
                <label className="mb-1 block text-xs text-white/50">Фото (URL)</label>
                <input value={form.image ?? ''} onChange={e => setForm(f => ({ ...f, image: e.target.value }))} className={inp} placeholder="https://..." />
              </div>
              <div className="flex items-center gap-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-white/70">Активен</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">Отмена</button>
              <button onClick={save} disabled={saving || !form.name || !form.address || !form.phone}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50">
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
