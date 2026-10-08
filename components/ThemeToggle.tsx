'use client'

import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

interface Props {
  isDark?: boolean // optional — passed from Header to avoid double mount check
}

export default function ThemeToggle({ isDark: isDarkProp }: Props = {}) {
  const { theme, toggle } = useTheme()
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  const isDark = isDarkProp !== undefined ? isDarkProp : (mounted && theme === 'dark')

  return (
    <button
      onClick={toggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      suppressHydrationWarning
      className={[
        'flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-200',
        isDark
          ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/15 hover:text-white'
          : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-orange-500 shadow-sm',
      ].join(' ')}
    >
      {isDark ? (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/>
          <line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/>
          <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
          <line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/>
          <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
        </svg>
      ) : (
        <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
        </svg>
      )}
    </button>
  )
}
