// Edge-safe: no Next.js App-only imports.
// Used by both middleware (proxy.ts) and App Directory code.

export const locales = ['ru', 'kg'] as const
export type Locale = (typeof locales)[number]
export const defaultLocale: Locale = 'ru'

export const hasLocale = (locale: string): locale is Locale =>
  (locales as readonly string[]).includes(locale)
