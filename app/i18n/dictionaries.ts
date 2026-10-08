import { notFound } from 'next/navigation'
import { locales, defaultLocale, hasLocale } from './config'
import type { Locale } from './config'

export { locales, defaultLocale, hasLocale } from './config'
export type { Locale } from './config'

// ─── Per-page dictionary loaders ─────────────────────────────────────────────
// Each page imports only its own slice — no giant bundle on the client.

type DictLoader<T> = () => Promise<T>

function loader<T>(ru: DictLoader<T>, kg: DictLoader<T>) {
  return { ru, kg } as Record<Locale, DictLoader<T>>
}

const dictionaries = {
  common: loader(
    () => import('./locales/ru/common.json').then((m) => m.default),
    () => import('./locales/kg/common.json').then((m) => m.default),
  ),
  landing: loader(
    () => import('./locales/ru/landing.json').then((m) => m.default),
    () => import('./locales/kg/landing.json').then((m) => m.default),
  ),
  about: loader(
    () => import('./locales/ru/about.json').then((m) => m.default),
    () => import('./locales/kg/about.json').then((m) => m.default),
  ),
  courses: loader(
    () => import('./locales/ru/courses.json').then((m) => m.default),
    () => import('./locales/kg/courses.json').then((m) => m.default),
  ),
  'course-general': loader(
    () => import('./locales/ru/course-general.json').then((m) => m.default),
    () => import('./locales/kg/course-general.json').then((m) => m.default),
  ),
  'course-kids': loader(
    () => import('./locales/ru/course-kids.json').then((m) => m.default),
    () => import('./locales/kg/course-kids.json').then((m) => m.default),
  ),
  'course-ielts': loader(
    () => import('./locales/ru/course-ielts.json').then((m) => m.default),
    () => import('./locales/kg/course-ielts.json').then((m) => m.default),
  ),
  teachers: loader(
    () => import('./locales/ru/teachers.json').then((m) => m.default),
    () => import('./locales/kg/teachers.json').then((m) => m.default),
  ),
  teacher: loader(
    () => import('./locales/ru/teacher.json').then((m) => m.default),
    () => import('./locales/kg/teacher.json').then((m) => m.default),
  ),
  process: loader(
    () => import('./locales/ru/process.json').then((m) => m.default),
    () => import('./locales/kg/process.json').then((m) => m.default),
  ),
  branches: loader(
    () => import('./locales/ru/branches.json').then((m) => m.default),
    () => import('./locales/kg/branches.json').then((m) => m.default),
  ),
  branch: loader(
    () => import('./locales/ru/branch.json').then((m) => m.default),
    () => import('./locales/kg/branch.json').then((m) => m.default),
  ),
  reviews: loader(
    () => import('./locales/ru/reviews.json').then((m) => m.default),
    () => import('./locales/kg/reviews.json').then((m) => m.default),
  ),
  gallery: loader(
    () => import('./locales/ru/gallery.json').then((m) => m.default),
    () => import('./locales/kg/gallery.json').then((m) => m.default),
  ),
  contacts: loader(
    () => import('./locales/ru/contacts.json').then((m) => m.default),
    () => import('./locales/kg/contacts.json').then((m) => m.default),
  ),
  apply: loader(
    () => import('./locales/ru/apply.json').then((m) => m.default),
    () => import('./locales/kg/apply.json').then((m) => m.default),
  ),
  faq: loader(
    () => import('./locales/ru/faq.json').then((m) => m.default),
    () => import('./locales/kg/faq.json').then((m) => m.default),
  ),
  'thank-you': loader(
    () => import('./locales/ru/thank-you.json').then((m) => m.default),
    () => import('./locales/kg/thank-you.json').then((m) => m.default),
  ),
  'not-found': loader(
    () => import('./locales/ru/not-found.json').then((m) => m.default),
    () => import('./locales/kg/not-found.json').then((m) => m.default),
  ),
}

export type DictionaryKey = keyof typeof dictionaries

// ─── getDictionary ────────────────────────────────────────────────────────────
// Accepts the locale directly — locale comes from [lang] params in every page.
// Usage: const t = await getDictionary(locale, 'landing')

export async function getDictionary<K extends DictionaryKey>(
  locale: Locale,
  page: K,
): Promise<Awaited<ReturnType<(typeof dictionaries)[K][Locale]>>> {
  if (!hasLocale(locale)) notFound()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dictionaries[page][locale] as any)()
}

// ─── getDictionaryByLocale ────────────────────────────────────────────────────
// Use when you already have the locale (e.g. in generateMetadata).
// Usage: const t = await getDictionaryByLocale('ru', 'landing')

export async function getDictionaryByLocale<K extends DictionaryKey>(
  locale: Locale,
  page: K,
): Promise<Awaited<ReturnType<(typeof dictionaries)[K][Locale]>>> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (dictionaries[page][locale] as any)()
}
