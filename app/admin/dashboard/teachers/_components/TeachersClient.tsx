'use client'

import { useState, useEffect, useCallback } from 'react'

interface Teacher {
  id: number; name: string; slug: string; photo?: string
  position?: string; specialization?: string; experienceYears?: number
  qualification?: string; languages?: string; bio?: string
  isActive: boolean; sortOrder: number
}

const EMPTY: Partial<Teacher> = {
  name: '', position: '', specialization: '', experienceYears: undefined,
  qualification: '', languages: 'English', bio: '', isActive: true, sortOrder: 0,
}

// Deterministic colour palette for avatar backgrounds
const AVATAR_COLORS = [
  { bg: 'bg-orange-500/25',  text: 'text-orange-300' },
  { bg: 'bg-blue-500/25',    text: 'text-blue-300' },
  { bg: 'bg-emerald-500/25', text: 'text-emerald-300' },
  { bg: 'bg-violet-500/25',  text: 'text-violet-300' },
  { bg: 'bg-pink-500/25',    text: 'text-pink-300' },
  { bg: 'bg-yellow-500/25',  text: 'text-yellow-300' },
  { bg: 'bg-cyan-500/25',    text: 'text-cyan-300' },
  { bg: 'bg-rose-500/25',    text: 'text-rose-300' },
]

function avatarColor(id: number) {
  return AVATAR_COLORS[id % AVATAR_COLORS.length]
}

function TeacherAvatar({ teacher }: { teacher: Pick<Teacher, 'id' | 'name' | 'photo'> }) {
  const color = avatarColor(teacher.id)
  if (teacher.photo) {
    return (
      <img
        src={teacher.photo}
        alt={teacher.name}
        className="h-12 w-12 shrink-0 rounded-xl object-cover"
      />
    )
  }
  return (
    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${color.bg} text-lg font-bold ${color.text}`}>
      {teacher.name.charAt(0).toUpperCase()}
    </div>
  )
}

export default function TeachersClient() {
  const [list, setList]       = useState<Teacher[]>([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal]     = useState<'add' | 'edit' | null>(null)
  const [form, setForm]       = useState<Partial<Teacher>>(EMPTY)
  const [saving, setSaving]   = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/teachers')
    const d = await r.json()
    setList(d.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    if (modal === 'add') {
      await fetch('/api/admin/teachers', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/teachers/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form),
      })
    }
    setSaving(false); setModal(null); load()
  }

  async function toggleActive(t: Teacher) {
    await fetch(`/api/admin/teachers/${t.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !t.isActive }),
    })
    load()
  }

  async function del(id: number) {
    if (!confirm('Удалить преподавателя?')) return
    await fetch(`/api/admin/teachers/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'

  return (
    <div className="space-y-6 pb-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Преподаватели</h1>
          <p className="mt-0.5 text-sm text-white/40">{list.length} преподавателей</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModal('add') }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Добавить
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          <p className="col-span-3 text-center py-12 text-white/40">Загрузка...</p>
        ) : list.length === 0 ? (
          <div className="col-span-3 py-12 text-center">
            <p className="text-white/40 mb-3">Преподавателей нет</p>
            <button onClick={() => { setForm(EMPTY); setModal('add') }}
              className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
              Добавить первого
            </button>
          </div>
        ) : list.map(t => (
          <div key={t.id} className="rounded-2xl border border-white/10 bg-white/5 p-5 hover:border-white/20 transition">
            <div className="flex items-start gap-3 mb-3">
              <TeacherAvatar teacher={t} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-white truncate">{t.name}</p>
                <p className="text-xs text-orange-400 truncate">{t.position ?? '—'}</p>
              </div>
              <button onClick={() => toggleActive(t)}
                className={`h-6 w-11 shrink-0 rounded-full border transition ${t.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white/10 border-white/20'}`}>
                <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${t.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
              </button>
            </div>
            <p className="text-xs text-white/40 mb-3 line-clamp-2">{t.specialization ?? 'Специализация не указана'}</p>
            {t.experienceYears && (
              <p className="text-xs text-white/30 mb-4">Опыт: {t.experienceYears} лет</p>
            )}
            <div className="flex gap-2">
              <button onClick={() => { setForm(t); setModal('edit') }}
                className="flex-1 rounded-xl border border-white/10 py-2 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white transition">
                Редактировать
              </button>
              <button onClick={() => del(t.id)}
                className="rounded-xl border border-red-500/20 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition">
                <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-white">{modal === 'add' ? 'Добавить преподавателя' : 'Редактировать'}</h2>
            <div className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-white/50">Имя *</label>
                <input value={form.name ?? ''} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className={inp} placeholder="Имя преподавателя" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Должность</label>
                  <input value={form.position ?? ''} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} className={inp} placeholder="Senior Teacher" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Опыт (лет)</label>
                  <input type="number" value={form.experienceYears ?? ''} onChange={e => setForm(f => ({ ...f, experienceYears: Number(e.target.value) || undefined }))} className={inp} placeholder="5" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Специализация</label>
                <input value={form.specialization ?? ''} onChange={e => setForm(f => ({ ...f, specialization: e.target.value }))} className={inp} placeholder="General English, IELTS" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Квалификация</label>
                <input value={form.qualification ?? ''} onChange={e => setForm(f => ({ ...f, qualification: e.target.value }))} className={inp} placeholder="CELTA, DELTA" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Биография</label>
                <textarea value={form.bio ?? ''} onChange={e => setForm(f => ({ ...f, bio: e.target.value }))} className={inp + ' resize-none'} rows={3} />
              </div>
              <div>
                <label className="mb-1 block text-xs text-white/50">Фото (URL)</label>
                <input value={form.photo ?? ''} onChange={e => setForm(f => ({ ...f, photo: e.target.value }))} className={inp} placeholder="https://..." />
                {form.photo && (
                  <div className="mt-2 flex items-center gap-3">
                    <img src={form.photo} alt="preview" className="h-14 w-14 rounded-xl object-cover border border-white/10" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
                    <span className="text-xs text-white/30">Предпросмотр</span>
                  </div>
                )}
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={!!form.isActive} onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))} className="w-4 h-4 accent-orange-500" />
                <span className="text-sm text-white/70">Активен</span>
              </label>
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
