'use client'

import { useState, useEffect, useCallback } from 'react'

interface AppStatus { id: number; name: string; description?: string }
interface Application {
  id: number; name: string; phone: string; email?: string
  comment?: string; preferredTime?: string; source?: string
  statusId: number; courseId?: number; branchId?: number
  courseName?: string; isPaid?: boolean
  paymentAmount?: number; paymentReceipt?: string
  createdAt: string
}

const STATUS_COLORS: Record<string, string> = {
  'Новая':        'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'В обработке':  'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  'Подтверждена': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Отклонена':    'bg-red-500/20 text-red-400 border-red-500/30',
  'Завершена':    'bg-gray-500/20 text-gray-400 border-gray-500/30',
}

function statusColor(name: string) {
  return STATUS_COLORS[name] ?? 'bg-white/10 text-white/60 border-white/20'
}

// ─── Receipt lightbox ─────────────────────────────────────────────────────────
function ReceiptLightbox({ src, onClose }: { src: string; onClose: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
        <button onClick={onClose}
          className="absolute -top-10 right-0 flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 text-white hover:bg-white/20 transition">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
        <img src={src} alt="Чек оплаты" className="w-full max-h-[80vh] object-contain rounded-2xl border border-white/10 shadow-2xl" />
        <p className="mt-3 text-center text-sm text-white/50">Чек оплаты</p>
      </div>
    </div>
  )
}

export default function ApplicationsClient() {
  const [apps, setApps]         = useState<Application[]>([])
  const [statuses, setStatuses] = useState<AppStatus[]>([])
  const [total, setTotal]       = useState(0)
  const [page, setPage]         = useState(1)
  const [pages, setPages]       = useState(1)
  const [search, setSearch]     = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [filterPaid,   setFilterPaid]   = useState('')
  const [loading, setLoading]   = useState(true)
  const [selected, setSelected] = useState<Application | null>(null)
  const [receipt, setReceipt]   = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    const q = new URLSearchParams({
      page: String(page), limit: '20',
      ...(search       ? { search }              : {}),
      ...(filterStatus ? { status: filterStatus } : {}),
    })
    const r = await fetch(`/api/admin/applications?${q}`)
    const d = await r.json()
    setApps(d.data ?? [])
    setStatuses(d.statuses ?? [])
    setTotal(d.total ?? 0)
    setPages(d.pages ?? 1)
    setLoading(false)
  }, [page, search, filterStatus])

  useEffect(() => { load() }, [load])

  async function changeStatus(id: number, statusId: number) {
    await fetch(`/api/admin/applications/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statusId }),
    })
    load()
    setSelected(prev => prev?.id === id ? { ...prev, statusId } : prev)
  }

  async function deleteApp(id: number) {
    if (!confirm('Удалить заявку?')) return
    await fetch(`/api/admin/applications/${id}`, { method: 'DELETE' })
    load(); setSelected(null)
  }

  const statusName = (id: number) => statuses.find(s => s.id === id)?.name ?? '—'

  // Filter by paid locally
  const filtered = filterPaid === 'paid'
    ? apps.filter(a => a.isPaid)
    : filterPaid === 'unpaid'
      ? apps.filter(a => !a.isPaid)
      : apps

  const paidCount   = apps.filter(a => a.isPaid).length
  const unpaidCount = apps.filter(a => !a.isPaid).length

  return (
    <div className="space-y-6 pb-10">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Заявки</h1>
          <div className="mt-1 flex items-center gap-3 text-sm">
            <span className="text-white/40">Всего: {total}</span>
            {paidCount > 0 && (
              <span className="flex items-center gap-1 text-emerald-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                {paidCount} с оплатой
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text" placeholder="Поиск по имени или телефону..."
          value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder-white/30 outline-none focus:border-orange-500 w-64"
        />
        <select value={filterStatus} onChange={e => { setFilterStatus(e.target.value); setPage(1) }}
          className="rounded-xl border border-white/10 bg-[#1a2a4a] px-4 py-2 text-sm text-white outline-none focus:border-orange-500">
          <option value="">Все статусы</option>
          {statuses.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
        <select value={filterPaid} onChange={e => setFilterPaid(e.target.value)}
          className="rounded-xl border border-white/10 bg-[#1a2a4a] px-4 py-2 text-sm text-white outline-none focus:border-orange-500">
          <option value="">Все заявки</option>
          <option value="paid">С оплатой ({paidCount})</option>
          <option value="unpaid">Без оплаты ({unpaidCount})</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 bg-white/5">
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Имя</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Телефон</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 hidden md:table-cell">Курс</th>
              <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider text-white/40 hidden sm:table-cell">Оплата</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40">Статус</th>
              <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-white/40 hidden lg:table-cell">Дата</th>
              <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-white/40">Действия</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="py-12 text-center text-white/40">Загрузка...</td></tr>
            ) : filtered.length === 0 ? (
              <tr><td colSpan={7} className="py-12 text-center text-white/40">Заявок не найдено</td></tr>
            ) : filtered.map((app, i) => (
              <tr key={app.id}
                className={`border-b border-white/5 transition hover:bg-white/5 cursor-pointer ${i % 2 === 0 ? '' : 'bg-white/[0.02]'}`}
                onClick={() => setSelected(app)}
              >
                <td className="px-4 py-3 font-medium text-white">{app.name}</td>
                <td className="px-4 py-3 text-white/70">{app.phone}</td>
                <td className="px-4 py-3 text-white/50 hidden md:table-cell">
                  {app.courseName || '—'}
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  {app.isPaid ? (
                    <button
                      onClick={e => { e.stopPropagation(); if (app.paymentReceipt) setReceipt(app.paymentReceipt) }}
                      className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-400 hover:bg-emerald-500/25 transition"
                      title="Нажмите чтобы посмотреть чек"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                      Оплачено
                    </button>
                  ) : (
                    <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-white/30">
                      Не оплачено
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusColor(statusName(app.statusId))}`}>
                    {statusName(app.statusId)}
                  </span>
                </td>
                <td className="px-4 py-3 text-white/40 hidden lg:table-cell">
                  {new Date(app.createdAt).toLocaleDateString('ru-RU')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button onClick={e => { e.stopPropagation(); deleteApp(app.id) }}
                    className="rounded-lg p-1.5 text-white/30 hover:bg-red-500/20 hover:text-red-400 transition" title="Удалить">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                    </svg>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 disabled:opacity-30">← Назад</button>
          <span className="text-sm text-white/40">{page} / {pages}</span>
          <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5 disabled:opacity-30">Вперёд →</button>
        </div>
      )}

      {/* Detail modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4" onClick={() => setSelected(null)}>
          <div className="w-full max-w-lg rounded-2xl border border-white/10 bg-[#1a2a4a] p-6 shadow-2xl max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            {/* Header */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <h2 className="text-lg font-bold text-white">{selected.name}</h2>
                <p className="text-sm text-white/40">Заявка #{selected.id}</p>
              </div>
              <div className="flex items-center gap-2">
                {selected.isPaid && (
                  <span className="flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/15 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                    <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                    Оплачено
                    {selected.paymentAmount && ` · ${selected.paymentAmount.toLocaleString()} сом`}
                  </span>
                )}
                <button onClick={() => setSelected(null)} className="text-white/40 hover:text-white transition">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Info rows */}
            <div className="space-y-2.5 mb-5">
              {[
                { label: 'Телефон',   value: selected.phone },
                { label: 'Email',     value: selected.email ?? '—' },
                { label: 'Курс',      value: selected.courseName ?? '—' },
                { label: 'Удобное время', value: selected.preferredTime ?? '—' },
                { label: 'Комментарий',   value: selected.comment ?? '—' },
                { label: 'Источник',      value: selected.source ?? '—' },
                { label: 'Дата',          value: new Date(selected.createdAt).toLocaleString('ru-RU') },
              ].map(row => (
                <div key={row.label} className="flex gap-3">
                  <span className="w-36 shrink-0 text-xs text-white/40 pt-0.5">{row.label}</span>
                  <span className="text-sm text-white/80 break-all">{row.value}</span>
                </div>
              ))}
            </div>

            {/* Receipt preview */}
            {selected.paymentReceipt && (
              <div className="mb-5">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Чек оплаты</p>
                <button onClick={() => setReceipt(selected.paymentReceipt!)}
                  className="relative w-full rounded-xl overflow-hidden border border-emerald-500/20 hover:border-emerald-500/50 transition group">
                  <img src={selected.paymentReceipt} alt="Чек" className="w-full max-h-48 object-contain bg-white/5" />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 transition rounded-full bg-white/90 px-3 py-1.5 text-xs font-semibold text-gray-900">
                      Открыть полностью
                    </span>
                  </div>
                </button>
              </div>
            )}

            {/* Status change */}
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-white/40 mb-2">Изменить статус</p>
              <div className="flex flex-wrap gap-2">
                {statuses.map(s => (
                  <button key={s.id} onClick={() => changeStatus(selected.id, s.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      s.id === selected.statusId
                        ? 'bg-orange-500 border-orange-500 text-white'
                        : 'border-white/10 text-white/60 hover:border-orange-500/40 hover:text-white'
                    }`}>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button onClick={() => deleteApp(selected.id)}
                className="rounded-xl border border-red-500/30 px-4 py-2 text-sm text-red-400 hover:bg-red-500/10 transition">
                Удалить заявку
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Receipt lightbox */}
      {receipt && <ReceiptLightbox src={receipt} onClose={() => setReceipt(null)} />}
    </div>
  )
}
