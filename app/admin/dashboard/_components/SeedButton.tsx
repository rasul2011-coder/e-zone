'use client'

import { useState } from 'react'

export default function SeedButton() {
  const [loading,  setLoading]  = useState(false)
  const [results,  setResults]  = useState<string[]>([])
  const [done,     setDone]     = useState(false)

  async function handleSeed() {
    setLoading(true)
    setResults([])
    try {
      const res = await fetch('/api/admin/seed', { method: 'POST' })
      const data = await res.json()
      setResults(data.results ?? [])
      setDone(true)
    } catch {
      setResults(['Ошибка при заполнении данными'])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <button
        onClick={handleSeed}
        disabled={loading || done}
        className="flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            Заполняем...
          </>
        ) : done ? (
          <>✓ Готово</>
        ) : (
          <>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
            </svg>
            Заполнить демо-данными
          </>
        )}
      </button>

      {results.length > 0 && (
        <ul className="space-y-1">
          {results.map((r, i) => (
            <li key={i} className="text-xs text-white/60 flex items-center gap-2">
              <span className={r.startsWith('✓') ? 'text-emerald-400' : 'text-white/30'}>{r}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
