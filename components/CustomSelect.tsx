'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'

interface Option {
  value: string
  label: string
}

interface CustomSelectProps {
  value: string
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  className?: string
  required?: boolean
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Выберите...',
  className = '',
  required,
}: CustomSelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.value === value)

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Hidden native input for form validation */}
      {required && (
        <input
          tabIndex={-1}
          required={required}
          value={value}
          onChange={() => {}}
          className="absolute inset-0 opacity-0 pointer-events-none"
        />
      )}

      {/* Trigger button */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className={[
          'w-full flex items-center justify-between rounded-xl border px-4 py-3 text-sm transition-all duration-200 outline-none',
          open
            ? 'border-orange-500 ring-2 ring-orange-500/20 bg-[var(--bg-alt)]'
            : 'border-[var(--border)] bg-[var(--bg-alt)] hover:border-orange-500/50',
          selected ? 'text-[var(--text)]' : 'text-[var(--text-subtle)]',
        ].join(' ')}
      >
        <span className="truncate">{selected ? selected.label : placeholder}</span>
        <ChevronDown
          className={`ml-2 shrink-0 text-[var(--text-muted)] transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          size={16}
        />
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] shadow-2xl">
          <ul className="max-h-56 overflow-y-auto py-1">
            {options.map(option => {
              const isSelected = option.value === value
              return (
                <li key={option.value}>
                  <button
                    type="button"
                    onClick={() => {
                      onChange(option.value)
                      setOpen(false)
                    }}
                    className={[
                      'flex w-full items-center justify-between px-4 py-2.5 text-sm transition-colors duration-150',
                      isSelected
                        ? 'bg-orange-500/10 text-orange-500 font-medium'
                        : 'text-[var(--text)] hover:bg-[var(--bg-alt)]',
                    ].join(' ')}
                  >
                    <span>{option.label}</span>
                    {isSelected && <Check size={14} className="text-orange-500" />}
                  </button>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
