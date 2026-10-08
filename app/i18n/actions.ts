'use server'

import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { hasLocale, type Locale } from './config'
import { LOCALE_COOKIE } from '../../proxy'

export async function switchLocale(locale: Locale, currentPath: string) {
  if (!hasLocale(locale)) return

  const jar = await cookies()
  jar.set(LOCALE_COOKIE, locale, {
    path: '/',
    maxAge: 60 * 60 * 24 * 365,
    sameSite: 'lax',
  })

  // Replace the locale segment in the current path:
  // /ru/courses  →  /kg/courses
  const segments = currentPath.split('/')
  // segments[0] = '', segments[1] = current locale, rest = page path
  segments[1] = locale
  redirect(segments.join('/') || `/${locale}`)
}
