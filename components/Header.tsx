'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LanguageSwitcher from './LanguageSwitcher'
import ThemeToggle from './ThemeToggle'
import AuthButton from './AuthButton'
import { useTheme } from './ThemeProvider'
import type { Locale } from '@/app/i18n/config'

interface NavItem { href: string; label: string }
interface Props {
  locale: Locale
  nav: NavItem[]
  applyLabel: string
}

export default function Header({ locale, nav, applyLabel }: Props) {
  const pathname = usePathname()
  const { theme } = useTheme()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 8)
    window.addEventListener('scroll', h, { passive: true })
    return () => window.removeEventListener('scroll', h)
  }, [])
  useEffect(() => { setMenuOpen(false) }, [pathname])
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [menuOpen])

  const isDark = mounted && theme === 'dark'

  // Logo text colours depend on theme
  const logoText  = isDark ? 'text-white' : 'text-gray-900'
  const logoAccent = 'text-orange-500'

  // Nav item classes
  function navCls(href: string) {
    const isHome = href === `/${locale}` || href === `/${locale}/`
    const active = isHome
      ? pathname === `/${locale}` || pathname === `/${locale}/`
      : pathname === href || pathname.startsWith(href + '/')
    return [
      'rounded-lg px-3 py-1.5 text-sm font-medium transition-all duration-150',
      active ? 'nav-link-active' : 'nav-link',
    ].join(' ')
  }

  // Burger / close button colours
  const burgerCls = isDark
    ? 'border-white/10 bg-white/5 text-white hover:bg-white/10'
    : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50 shadow-sm'

  // ThemeToggle wrapper (always needed for dark bg in dark mode)
  const toggleWrap = isDark
    ? 'border-white/10 bg-white/5 text-white/70 hover:bg-white/10 hover:text-white'
    : 'border-gray-200 bg-white text-gray-500 hover:bg-gray-50 hover:text-gray-900 shadow-sm'

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 header-bg',
          scrolled ? 'shadow-[0_2px_20px_rgba(0,0,0,0.08)]' : '',
        ].join(' ')}
        suppressHydrationWarning
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 md:px-8">

          {/* Logo */}
          <Link href={`/${locale}`} className={`flex items-center gap-0.5 text-xl font-extrabold tracking-tight shrink-0 ${logoText}`}>
            English<span className={logoAccent}>Zone</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Main navigation">
            {nav.map(item => (
              <Link key={item.href} href={item.href} className={navCls(item.href)}>
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Right controls */}
          <div className="flex items-center gap-2">
            <ThemeToggle isDark={isDark} />
            <LanguageSwitcher currentLocale={locale} />
            <AuthButton locale={locale} isDark={isDark} />

            {/* Payment button */}
            <Link
              href={`/${locale}/apply/thank-you`}
              className="hidden items-center gap-1.5 rounded-full bg-orange-500 px-4 py-2 text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30 lg:flex"
              suppressHydrationWarning
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
              {locale === 'kg' ? 'Төлөө' : 'Оплатить'}
            </Link>

            {/* Burger */}
            <button
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(v => !v)}
              className={`relative flex h-9 w-9 flex-col items-center justify-center gap-1.5 rounded-xl border transition lg:hidden ${burgerCls}`}
              suppressHydrationWarning
            >
              <span className={`block h-0.5 w-5 rounded bg-current transition-all duration-200 ${menuOpen ? 'translate-y-2 rotate-45' : ''}`} />
              <span className={`block h-0.5 w-5 rounded bg-current transition-all duration-200 ${menuOpen ? 'opacity-0' : ''}`} />
              <span className={`block h-0.5 w-5 rounded bg-current transition-all duration-200 ${menuOpen ? '-translate-y-2 -rotate-45' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile backdrop */}
      <div
        aria-hidden
        onClick={() => setMenuOpen(false)}
        className={[
          'fixed inset-0 z-40 transition-opacity duration-300 lg:hidden',
          isDark ? 'bg-black/60' : 'bg-black/30',
          'backdrop-blur-sm',
          menuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        ].join(' ')}
      />

      {/* Mobile drawer */}
      <div
        role="dialog"
        aria-modal
        aria-label="Mobile navigation"
        className={[
          'fixed right-0 top-0 z-50 flex h-full w-72 flex-col shadow-2xl transition-transform duration-300 ease-in-out lg:hidden',
          isDark ? 'bg-[#0f1d35]' : 'bg-white',
          menuOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
        suppressHydrationWarning
      >
        {/* Drawer header */}
        <div className={`flex items-center justify-between px-5 py-4 border-b ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <Link href={`/${locale}`} onClick={() => setMenuOpen(false)}
            className={`text-xl font-extrabold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>
            English<span className="text-orange-500">Zone</span>
          </Link>
          <button onClick={() => setMenuOpen(false)} aria-label="Закрыть меню"
            className={`flex h-8 w-8 items-center justify-center rounded-lg transition ${isDark ? 'text-white/60 hover:bg-white/10 hover:text-white' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-700'}`}>
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>
        </div>

        {/* Drawer nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-0.5">
          {nav.map(item => {
            const isHome = item.href === `/${locale}` || item.href === `/${locale}/`
            const active = isHome
              ? pathname === `/${locale}` || pathname === `/${locale}/`
              : pathname === item.href || pathname.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href} onClick={() => setMenuOpen(false)}
                className={[
                  'flex items-center rounded-xl px-4 py-3 text-base font-medium transition-colors',
                  active
                    ? 'bg-orange-500 text-white'
                    : isDark
                      ? 'text-white/70 hover:bg-white/5 hover:text-white'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900',
                ].join(' ')}>
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Drawer footer */}
        <div className={`border-t px-5 py-5 space-y-3 ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
          <Link href={`/${locale}/apply/thank-you`} onClick={() => setMenuOpen(false)}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-orange-500 px-5 py-3 text-center text-sm font-semibold text-white hover:bg-orange-600 transition shadow-lg shadow-orange-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
              <line x1="1" y1="10" x2="23" y2="10"/>
            </svg>
            {locale === 'kg' ? 'Төлөө' : 'Оплатить'}
          </Link>
          <p className={`text-center text-xs ${isDark ? 'text-white/40' : 'text-gray-400'}`} suppressHydrationWarning>
            {locale === 'kg' ? 'Аккаунт барбы?' : 'Уже есть аккаунт?'}{' '}
            <Link href={`/${locale}/login`} onClick={() => setMenuOpen(false)}
              className="font-semibold text-orange-500 hover:text-orange-600 transition">
              {locale === 'kg' ? 'Кирүү' : 'Войти'}
            </Link>
          </p>
          <div className="flex items-center justify-between">
            <LanguageSwitcher currentLocale={locale} />
            <ThemeToggle isDark={isDark} />
          </div>
        </div>
      </div>
    </>
  )
}
