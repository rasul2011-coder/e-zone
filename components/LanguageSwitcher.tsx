'use client'

import { usePathname } from 'next/navigation'
import { useTransition } from 'react'
import { switchLocale } from '@/app/i18n/actions'
import { locales, type Locale } from '@/app/i18n/config'

const labels: Record<Locale, string> = {
  ru: 'Рус',
  kg: 'Кыр',
}

interface Props {
  currentLocale: Locale
}

export default function LanguageSwitcher({ currentLocale }: Props) {
  const pathname = usePathname()
  const [isPending, startTransition] = useTransition()

  function handleSwitch(locale: Locale) {
    if (locale === currentLocale) return
    startTransition(() => {
      switchLocale(locale, pathname)
    })
  }

  return (
    <div className="flex items-center gap-1 rounded-full border border-white/20 p-0.5">
      {locales.map((locale) => (
        <button
          key={locale}
          onClick={() => handleSwitch(locale)}
          disabled={isPending}
          aria-pressed={locale === currentLocale}
          className={[
            'rounded-full px-3 py-1 text-sm font-medium transition-colors',
            locale === currentLocale
              ? 'bg-white text-[#1a2a4a] shadow-sm'
              : 'text-white/80 hover:text-white',
            isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          ].join(' ')}
        >
          {labels[locale]}
        </button>
      ))}
    </div>
  )
}
