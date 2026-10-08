import { NextResponse, type NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { locales, defaultLocale, hasLocale } from './app/i18n/config'

export const LOCALE_COOKIE         = 'LOCALE'
export const ADMIN_SESSION_COOKIE  = 'admin_session'
export const OTP_SESSION_COOKIE    = 'admin_otp_pending'

// ─── Admin route helpers ───────────────────────────────────────────────────────

const PUBLIC_ADMIN_PATHS = ['/admin/login', '/admin/verify', '/admin']

function isAdminPath(pathname: string) {
  return pathname.startsWith('/admin')
}

function isPublicAdminPath(pathname: string) {
  return (
    pathname === '/admin' ||
    pathname === '/admin/login' ||
    pathname.startsWith('/admin/login/') ||
    pathname === '/admin/verify' ||
    pathname.startsWith('/admin/verify/')
  )
}

async function verifyJwt(token: string): Promise<boolean> {
  try {
    const secret = new TextEncoder().encode(process.env.ADMIN_JWT_SECRET)
    await jwtVerify(token, secret)
    return true
  } catch {
    return false
  }
}

// ─── Locale detection ─────────────────────────────────────────────────────────

function detectLocale(request: NextRequest): string {
  const cookie = request.cookies.get(LOCALE_COOKIE)?.value
  if (cookie && hasLocale(cookie)) return cookie

  const acceptLanguage = request.headers.get('accept-language') ?? ''
  for (const segment of acceptLanguage.split(',')) {
    const tag = segment.split(';')[0].trim().toLowerCase()
    if (hasLocale(tag)) return tag
    const lang = tag.split('-')[0]
    if (hasLocale(lang)) return lang
  }

  return defaultLocale
}

// ─── Main middleware ───────────────────────────────────────────────────────────

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and Next internals (API routes handled separately)
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    /\.(.+)$/.test(pathname)
  ) {
    return NextResponse.next()
  }

  // ── Admin routes ─────────────────────────────────────────────────────────────
  if (isAdminPath(pathname)) {
    const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value
    const isAuthenticated = sessionToken ? await verifyJwt(sessionToken) : false

    // Authenticated admin visiting login/verify → DO NOT auto-redirect.
    // Admin must always go through login + OTP manually.
    // (Just let them see the login page — pressing submit will issue a new session)

    // Unauthenticated trying to access protected admin pages
    if (!isAuthenticated && !isPublicAdminPath(pathname)) {
      // /admin/verify is allowed if OTP-pending cookie exists
      if (pathname === '/admin/verify' || pathname.startsWith('/admin/verify/')) {
        const otpToken = request.cookies.get(OTP_SESSION_COOKIE)?.value
        const otpValid = otpToken ? await verifyJwt(otpToken) : false
        if (otpValid) return NextResponse.next()
      }

      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    return NextResponse.next()
  }

  // ── Public / landing routes — locale detection & redirect ────────────────────
  const pathnameHasLocale = locales.some(
    (locale) =>
      pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`,
  )

  if (pathnameHasLocale) return NextResponse.next()

  const locale = detectLocale(request)
  const url = request.nextUrl.clone()
  url.pathname = `/${locale}${pathname}`

  const response = NextResponse.redirect(url)
  response.cookies.set(LOCALE_COOKIE, locale, {
    path:     '/',
    maxAge:   60 * 60 * 24 * 365,
    sameSite: 'lax',
  })
  return response
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
}
