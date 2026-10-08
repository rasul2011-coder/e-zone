'use client'

import { useState, useEffect, useCallback } from 'react'

interface Course {
  id: number; name: string; slug: string
  shortDescription: string; price?: string; currency: string
  duration?: string; ageFrom?: number; ageTo?: number
  isActive: boolean; isFeatured: boolean; sortOrder: number
  createdAt: string
}

const EMPTY: Partial<Course> = {
  name: '', shortDescription: '', price: '', currency: 'KGS',
  duration: '', ageFrom: undefined, ageTo: undefined,
  isActive: true, isFeatured: false, sortOrder: 0,
}

export default function CoursesClient() {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [form, setForm]       = useState<Partial<Course>>(EMPTY)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/courses')
    const d = await r.json()
    setCourses(d.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  function openAdd() { setForm(EMPTY); setModal('add') }
  function openEdit(c: Course) { setForm(c); setModal('edit') }

  async function save() {
    setSaving(true)
    if (modal === 'add') {
      await fetch('/api/admin/courses', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/courses/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    }
    setSaving(false)
    setModal(null)
    load()
  }

  async function toggleActive(c: Course) {
    await fetch(`/api/admin/courses/${c.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !c.isActive }),
    })
    load()
  }

  async function deleteCourse(id: number) {
    if (!confirm('Удалить курс?')) return
    await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Курсы</h1>
          <p className="mt-0.5 text-sm text-white/40">{courses.length} курсов</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить
        </button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Название</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 hidden md:table-cell">Цена</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 hidden lg:table-cell">Возраст</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/40">Активен</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/40">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="py-12 text-center text-white/40">Загрузка...</td></tr>
            ) : courses.length === 0 ? (
              <tr><td colSpan={5} className="py-12 text-center text-white/40">
                Курсов нет. <button onClick={openAdd} className="text-orange-400 underline">Добавить первый</button>
              </td></tr>
            ) : courses.map((c, i) => (
              <tr key={c.id} className={`border-b border-white/5 hover:bg-white/5 transition ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}>
                <td className="px-4 py-3">
                  <p className="font-medium text-white">{c.name}</p>
                  <p className="text-xs text-white/40 truncate max-w-xs">{c.shortDescription}</p>
                </td>
                <td className="px-4 py-3 text-white/70 hidden md:table-cell">
                  {c.price ? `${c.price} ${c.currency}` : '—'}
                </td>
                <td className="px-4 py-3 text-white/50 hidden lg:table-cell">
                  {c.ageFrom && c.ageTo ? `${c.ageFrom}–${c.ageTo}` : c.ageFrom ? `${c.ageFrom}+` : '—'}
                </td>
                <td className="px-4 py-3 text-center">
                  <button onClick={() => toggleActive(c)}
                    className={`h-6 w-11 rounded-full border transition ${c.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white/10 border-white/20'}`}>
                    <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${c.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => openEdit(c)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition" title="Редактировать">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                    <button onClick={() => deleteCourse(c.id)}
                      className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition" title="Удалить">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-white">{modal === 'add' ? 'Добавить курс' : 'Редактировать курс'}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Название *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="General English" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Краткое описание *</label>
                <textarea value={form.shortDescription ?? ''} onChange={e => setForm(f => ({ ...f, shortDescription: e.target.value }))} className={inp + ' resize-none'} rows={2} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Цена (сом)</label>
                  <input type="number" value={form.price ?? ''} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} className={inp} placeholder="3500" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Продолжительность</label>
                  <input value={form.duration ?? ''} onChange={e => setForm(f => ({ ...f, duration: e.target.value }))} className={inp} placeholder="3–6 месяцев" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Возраст от</label>
                  <input type="number" value={form.ageFrom ?? ''} onChange={e => setForm(f => ({ ...f, ageFrom: Number(e.target.value) || undefined }))} className={inp} placeholder="16" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Возраст до</label>
                  <input type="number" value={form.ageTo ?? ''} onChange={e => setForm(f => ({ ...f, ageTo: Number(e.target.value) || undefined }))} className={inp} placeholder="99" />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-white/70">Активен</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={!!form.isFeatured} onChange={e => setForm(f => ({ ...f, isFeatured: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                  <span className="text-sm text-white/70">Рекомендуемый</span>
                </label>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">Отмена</button>
              <button onClick={save} disabled={saving || !form.name}
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
