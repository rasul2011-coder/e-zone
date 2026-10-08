'use client'

import { useState, useEffect, useCallback } from 'react'

interface Course  { id: number; name: string }
interface Branch  { id: number; name: string }
interface Teacher { id: number; name: string }

interface Group {
  id: number
  courseId: number;  courseName?: string
  branchId: number;  branchName?: string
  dayOfWeek: number
  startTime: string; endTime: string
  format: string;    isActive: boolean
  teacherId?: number | null
  startDate?: string | null
  endDate?: string | null
}

const DAYS: Record<number, string> = {
  1: 'Пн', 2: 'Вт', 3: 'Ср', 4: 'Чт', 5: 'Пт', 6: 'Сб', 7: 'Вс',
}
const DAYS_FULL: Record<number, string> = {
  1: 'Понедельник', 2: 'Вторник', 3: 'Среда',
  4: 'Четверг',     5: 'Пятница', 6: 'Суббота', 7: 'Воскресенье',
}

const FORMATS = [
  { value: 'offline', label: 'Офлайн' },
  { value: 'online',  label: 'Онлайн' },
  { value: 'hybrid',  label: 'Гибрид' },
]

const FORMAT_COLORS: Record<string, string> = {
  offline: 'bg-blue-500/20 text-blue-400',
  online:  'bg-emerald-500/20 text-emerald-400',
  hybrid:  'bg-violet-500/20 text-violet-400',
}

const DAY_COLORS = [
  'bg-orange-500/20 text-orange-300',
  'bg-blue-500/20 text-blue-300',
  'bg-emerald-500/20 text-emerald-300',
  'bg-violet-500/20 text-violet-300',
  'bg-pink-500/20 text-pink-300',
  'bg-yellow-500/20 text-yellow-300',
  'bg-cyan-500/20 text-cyan-300',
]

const EMPTY: Partial<Group> = {
  courseId: undefined, branchId: undefined, dayOfWeek: 1,
  startTime: '09:00', endTime: '10:30', format: 'offline',
  isActive: true, teacherId: null, startDate: '', endDate: '',
}

// 10 placeholder groups shown on public page when DB is empty
export const PLACEHOLDER_GROUPS: Omit<Group, 'id'>[] = [
  { courseId: 0, courseName: 'General English', branchId: 0, branchName: 'Филиал на Чуй',      dayOfWeek: 1, startTime: '09:00', endTime: '10:30', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'General English', branchId: 0, branchName: 'Филиал на Чуй',      dayOfWeek: 3, startTime: '09:00', endTime: '10:30', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'General English', branchId: 0, branchName: 'Филиал на Манас',    dayOfWeek: 2, startTime: '11:00', endTime: '12:30', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'IELTS Prep',      branchId: 0, branchName: 'Филиал на Чуй',      dayOfWeek: 2, startTime: '14:00', endTime: '16:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'IELTS Prep',      branchId: 0, branchName: 'Филиал на Ибраимова',dayOfWeek: 4, startTime: '14:00', endTime: '16:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'IELTS Prep',      branchId: 0, branchName: 'Филиал на Манас',    dayOfWeek: 6, startTime: '10:00', endTime: '12:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'Kids Club',       branchId: 0, branchName: 'Филиал на Чуй',      dayOfWeek: 1, startTime: '15:00', endTime: '16:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'Kids Club',       branchId: 0, branchName: 'Филиал Асанбай',     dayOfWeek: 3, startTime: '15:00', endTime: '16:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'Kids Club',       branchId: 0, branchName: 'Филиал Асанбай',     dayOfWeek: 5, startTime: '15:00', endTime: '16:00', format: 'offline', isActive: true },
  { courseId: 0, courseName: 'General English', branchId: 0, branchName: 'Филиал на Ибраимова',dayOfWeek: 5, startTime: '18:00', endTime: '19:30', format: 'online',  isActive: true },
]

export default function GroupsClient() {
  const [groups,   setGroups]   = useState<Group[]>([])
  const [courses,  setCourses]  = useState<Course[]>([])
  const [branches, setBranches] = useState<Branch[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'add' | 'edit' | null>(null)
  const [form,     setForm]     = useState<Partial<Group>>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [filterCourse, setFilterCourse] = useState('')

  const load = useCallback(async () => {
    setLoading(true)
    const [gr, co, br, te] = await Promise.all([
      fetch('/api/admin/groups').then(r => r.json()),
      fetch('/api/admin/courses').then(r => r.json()),
      fetch('/api/admin/branches').then(r => r.json()),
      fetch('/api/admin/teachers').then(r => r.json()),
    ])
    setGroups(gr.data ?? [])
    setCourses(co.data ?? [])
    setBranches(br.data ?? [])
    setTeachers(te.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    if (modal === 'add') {
      await fetch('/api/admin/groups', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/groups/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false); setModal(null); load()
  }

  async function toggleActive(g: Group) {
    await fetch(`/api/admin/groups/${g.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !g.isActive }),
    })
    load()
  }

  async function del(id: number) {
    if (!confirm('Удалить группу?')) return
    await fetch(`/api/admin/groups/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'
  const sel = inp + ' appearance-none'

  const filtered = filterCourse
    ? groups.filter(g => String(g.courseId) === filterCourse)
    : groups

  // Group by course for display
  const byCourse: Record<string, Group[]> = {}
  filtered.forEach(g => {
    const key = g.courseName ?? String(g.courseId)
    if (!byCourse[key]) byCourse[key] = []
    byCourse[key].push(g)
  })

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Группы</h1>
          <p className="mt-0.5 text-sm text-white/40">{groups.length} групп</p>
        </div>
        <button
          onClick={() => { setForm({ ...EMPTY, courseId: Number(filterCourse) || undefined }); setModal('add') }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить группу
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-3 flex-wrap">
        <select
          value={filterCourse}
          onChange={e => setFilterCourse(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#1a2a4a] px-4 py-2 text-sm text-white outline-none focus:border-orange-500"
        >
          <option value="">Все курсы</option>
          {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Groups by course */}
      {loading ? (
        <p className="py-12 text-center text-white/40">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-white/40 mb-3">Групп нет</p>
          <button onClick={() => { setForm(EMPTY); setModal('add') }}
            className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
            Добавить первую
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(byCourse).map(([courseName, courseGroups]) => (
            <div key={courseName}>
              <h2 className="text-sm font-semibold text-orange-400 mb-3 uppercase tracking-widest">{courseName}</h2>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {courseGroups.map(g => (
                  <div key={g.id} className="rounded-2xl border border-white/10 bg-white/5 p-4 hover:border-white/20 transition">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`inline-flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${DAY_COLORS[(g.dayOfWeek - 1) % DAY_COLORS.length]}`}>
                          {DAYS[g.dayOfWeek]}
                        </span>
                        <span className="text-sm font-semibold text-white">
                          {g.startTime?.slice(0, 5)} – {g.endTime?.slice(0, 5)}
                        </span>
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${FORMAT_COLORS[g.format] ?? 'bg-white/10 text-white/50'}`}>
                          {FORMATS.find(f => f.value === g.format)?.label ?? g.format}
                        </span>
                      </div>
                      <button onClick={() => toggleActive(g)}
                        className={`h-6 w-11 shrink-0 rounded-full border transition ${g.isActive ? 'bg-emerald-500 border-emerald-500' : 'bg-white/10 border-white/20'}`}>
                        <span className={`block h-4 w-4 rounded-full bg-white shadow transition-transform mx-0.5 ${g.isActive ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>
                    <p className="text-xs text-white/50 mb-1 flex items-center gap-1.5">
                      <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400 shrink-0">
                        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
                      </svg>
                      {g.branchName ?? `Филиал #${g.branchId}`}
                    </p>
                    <div className="mt-3 flex gap-2">
                      <button onClick={() => { setForm(g); setModal('edit') }}
                        className="flex-1 rounded-xl border border-white/10 py-1.5 text-xs font-medium text-white/60 hover:bg-white/5 hover:text-white transition">
                        Изменить
                      </button>
                      <button onClick={() => del(g.id)}
                        className="rounded-xl border border-red-500/20 px-2.5 py-1.5 text-xs text-red-400 hover:bg-red-500/10 transition">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-white">
              {modal === 'add' ? 'Добавить группу' : 'Редактировать группу'}
            </h2>
            <div className="space-y-4">
              {/* Course */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Курс *</label>
                <select
                  value={form.courseId ?? ''}
                  onChange={e => setForm(f => ({ ...f, courseId: Number(e.target.value) }))}
                  className={sel}
                >
                  <option value="">Выберите курс</option>
                  {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              {/* Branch */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Филиал *</label>
                <select
                  value={form.branchId ?? ''}
                  onChange={e => setForm(f => ({ ...f, branchId: Number(e.target.value) }))}
                  className={sel}
                >
                  <option value="">Выберите филиал</option>
                  {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                </select>
              </div>
              {/* Day */}
              <div>
                <label className="mb-1 block text-xs text-white/50">День недели *</label>
                <select
                  value={form.dayOfWeek ?? 1}
                  onChange={e => setForm(f => ({ ...f, dayOfWeek: Number(e.target.value) }))}
                  className={sel}
                >
                  {Object.entries(DAYS_FULL).map(([num, name]) => (
                    <option key={num} value={num}>{name}</option>
                  ))}
                </select>
              </div>
              {/* Time */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Начало *</label>
                  <input
                    type="time"
                    value={form.startTime ?? '09:00'}
                    onChange={e => setForm(f => ({ ...f, startTime: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Конец *</label>
                  <input
                    type="time"
                    value={form.endTime ?? '10:30'}
                    onChange={e => setForm(f => ({ ...f, endTime: e.target.value }))}
                    className={inp}
                  />
                </div>
              </div>
              {/* Format */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Формат</label>
                <select
                  value={form.format ?? 'offline'}
                  onChange={e => setForm(f => ({ ...f, format: e.target.value }))}
                  className={sel}
                >
                  {FORMATS.map(f => <option key={f.value} value={f.value}>{f.label}</option>)}
                </select>
              </div>
              {/* Teacher */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Преподаватель</label>
                <select
                  value={form.teacherId ?? ''}
                  onChange={e => setForm(f => ({ ...f, teacherId: e.target.value ? Number(e.target.value) : null }))}
                  className={sel}
                >
                  <option value="">Не назначен</option>
                  {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              </div>
              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-white/50">Дата начала</label>
                  <input
                    type="date"
                    value={form.startDate ?? ''}
                    onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                    className={inp}
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-white/50">Дата окончания</label>
                  <input
                    type="date"
                    value={form.endDate ?? ''}
                    onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                    className={inp}
                  />
                </div>
              </div>
              {/* Active */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isActive}
                  onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-white/70">Активна</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
                Отмена
              </button>
              <button
                onClick={save}
                disabled={saving || !form.courseId || !form.branchId || !form.dayOfWeek}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
