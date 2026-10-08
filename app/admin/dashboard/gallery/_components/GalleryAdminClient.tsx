'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'

interface GalleryItem {
  id: number
  title?: string | null
  image: string
  description?: string | null
  category?: string | null
  isPublished: boolean
  sortOrder: number
}

const CATEGORIES = [
  { value: 'classes',  label: 'Занятия' },
  { value: 'events',   label: 'События' },
  { value: 'branches', label: 'Филиалы' },
  { value: 'teachers', label: 'Преподаватели' },
  { value: 'other',    label: 'Другое' },
]

const CAT_COLORS: Record<string, string> = {
  classes:  'bg-blue-500/20 text-blue-300',
  events:   'bg-orange-500/20 text-orange-300',
  branches: 'bg-emerald-500/20 text-emerald-300',
  teachers: 'bg-violet-500/20 text-violet-300',
  other:    'bg-white/10 text-white/50',
}

const EMPTY: Partial<GalleryItem> = {
  title: '', image: '', description: '', category: 'classes',
  isPublished: true, sortOrder: 0,
}

export default function GalleryAdminClient() {
  const [items,    setItems]    = useState<GalleryItem[]>([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState<'add' | 'edit' | null>(null)
  const [form,     setForm]     = useState<Partial<GalleryItem>>(EMPTY)
  const [saving,   setSaving]   = useState(false)
  const [filterCat, setFilterCat] = useState('')
  const [preview,  setPreview]  = useState<GalleryItem | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const r = await fetch('/api/admin/gallery')
    const d = await r.json()
    setItems(d.data ?? [])
    setLoading(false)
  }, [])

  useEffect(() => { load() }, [load])

  async function save() {
    setSaving(true)
    if (modal === 'add') {
      await fetch('/api/admin/gallery', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    } else {
      await fetch(`/api/admin/gallery/${form.id}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
    }
    setSaving(false); setModal(null); load()
  }

  async function togglePublished(item: GalleryItem) {
    await fetch(`/api/admin/gallery/${item.id}`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isPublished: !item.isPublished }),
    })
    load()
  }

  async function del(id: number) {
    if (!confirm('Удалить фото из галереи?')) return
    await fetch(`/api/admin/gallery/${id}`, { method: 'DELETE' })
    load()
  }

  const inp = 'w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500'
  const sel = inp + ' appearance-none'

  const filtered = filterCat ? items.filter(i => i.category === filterCat) : items

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Галерея</h1>
          <p className="mt-0.5 text-sm text-white/40">{items.length} фотографий</p>
        </div>
        <button
          onClick={() => { setForm(EMPTY); setModal('add') }}
          className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Добавить фото
        </button>
      </div>

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setFilterCat('')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${!filterCat ? 'bg-orange-500 text-white' : 'border border-white/10 text-white/50 hover:bg-white/5'}`}
        >
          Все ({items.length})
        </button>
        {CATEGORIES.map(cat => {
          const count = items.filter(i => i.category === cat.value).length
          return (
            <button
              key={cat.value}
              onClick={() => setFilterCat(cat.value)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition ${filterCat === cat.value ? 'bg-orange-500 text-white' : 'border border-white/10 text-white/50 hover:bg-white/5'}`}
            >
              {cat.label} ({count})
            </button>
          )
        })}
      </div>

      {/* Grid */}
      {loading ? (
        <p className="py-12 text-center text-white/40">Загрузка...</p>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-4xl mb-4">🖼️</p>
          <p className="text-white/40 mb-3">Фотографий нет</p>
          <button onClick={() => { setForm(EMPTY); setModal('add') }}
            className="rounded-xl bg-orange-500 px-5 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition">
            Добавить первое фото
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map(item => (
            <div key={item.id} className="group relative rounded-2xl border border-white/10 overflow-hidden bg-white/5 hover:border-white/20 transition">
              {/* Image */}
              <div
                className="relative h-44 cursor-pointer bg-[#1a2a4a]"
                onClick={() => setPreview(item)}
              >
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.title ?? ''}
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-4xl text-white/20">🖼️</div>
                )}
                {/* Overlay on hover */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15 3h6v6M9 21H3v-6M21 3l-7 7M3 21l7-7"/>
                  </svg>
                </div>
                {/* Published badge */}
                {!item.isPublished && (
                  <div className="absolute top-2 left-2 rounded-full bg-red-500/80 px-2 py-0.5 text-[10px] font-medium text-white">
                    Скрыто
                  </div>
                )}
                {/* Category badge */}
                {item.category && (
                  <div className={`absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium ${CAT_COLORS[item.category] ?? 'bg-white/10 text-white/50'}`}>
                    {CATEGORIES.find(c => c.value === item.category)?.label ?? item.category}
                  </div>
                )}
              </div>

              {/* Info + actions */}
              <div className="p-3">
                <p className="text-sm font-medium text-white truncate mb-1">{item.title || <span className="text-white/30 italic">Без названия</span>}</p>
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => togglePublished(item)}
                    className={`flex-1 rounded-lg py-1.5 text-[11px] font-medium transition ${item.isPublished ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30' : 'bg-white/5 text-white/40 hover:bg-white/10'}`}
                  >
                    {item.isPublished ? '✓ Опубликовано' : '○ Скрыто'}
                  </button>
                  <button
                    onClick={() => { setForm(item); setModal('edit') }}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-white/10 hover:text-white transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => del(item.id)}
                    className="rounded-lg p-1.5 text-white/40 hover:bg-red-500/20 hover:text-red-400 transition"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setModal(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <h2 className="mb-5 text-lg font-bold text-white">
              {modal === 'add' ? 'Добавить фото' : 'Редактировать фото'}
            </h2>
            <div className="space-y-4">
              {/* Image URL */}
              <div>
                <label className="mb-1 block text-xs text-white/50">URL фотографии *</label>
                <input
                  value={form.image ?? ''}
                  onChange={e => setForm(f => ({ ...f, image: e.target.value }))}
                  className={inp}
                  placeholder="https://..."
                />
                {form.image && (
                  <div className="mt-2 rounded-xl overflow-hidden h-40 bg-white/5">
                    <img
                      src={form.image}
                      alt="preview"
                      className="w-full h-full object-cover"
                      onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                    />
                  </div>
                )}
              </div>
              {/* Title */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Подпись к фото</label>
                <input
                  value={form.title ?? ''}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  className={inp}
                  placeholder="Урок General English"
                />
              </div>
              {/* Category */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Категория</label>
                <select
                  value={form.category ?? 'classes'}
                  onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                  className={sel}
                >
                  {CATEGORIES.map(c => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
              </div>
              {/* Description */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Описание</label>
                <textarea
                  value={form.description ?? ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inp + ' resize-none'}
                  rows={2}
                  placeholder="Краткое описание фотографии"
                />
              </div>
              {/* Sort order */}
              <div>
                <label className="mb-1 block text-xs text-white/50">Порядок (меньше = выше)</label>
                <input
                  type="number"
                  value={form.sortOrder ?? 0}
                  onChange={e => setForm(f => ({ ...f, sortOrder: Number(e.target.value) }))}
                  className={inp}
                />
              </div>
              {/* Published */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!form.isPublished}
                  onChange={e => setForm(f => ({ ...f, isPublished: e.target.checked }))}
                  className="w-4 h-4 accent-orange-500"
                />
                <span className="text-sm text-white/70">Опубликовано (видно на сайте)</span>
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setModal(null)} className="rounded-xl border border-white/10 px-5 py-2.5 text-sm text-white/60 hover:bg-white/5 transition">
                Отмена
              </button>
              <button
                onClick={save}
                disabled={saving || !form.image}
                className="rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-orange-600 transition disabled:opacity-50"
              >
                {saving ? 'Сохранение...' : 'Сохранить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox preview */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
          onClick={() => setPreview(null)}
        >
          <div className="relative max-w-3xl w-full" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setPreview(null)}
              className="absolute -top-10 right-0 text-white/60 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <img
              src={preview.image}
              alt={preview.title ?? ''}
              className="w-full rounded-2xl object-contain max-h-[80vh]"
            />
            {preview.title && (
              <p className="mt-3 text-center text-sm text-white/60">{preview.title}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
