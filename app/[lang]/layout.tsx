import { notFound } from 'next/navigation'
import { hasLocale, getDictionaryByLocale, type Locale } from '@/app/i18n/dictionaries'
import Header from '@/components/Header'

export function generateStaticParams() {
  return [{ lang: 'ru' }, { lang: 'kg' }]
}

export default async function LangLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params

  if (!hasLocale(lang)) notFound()

  const locale = lang as Locale
  const t = await getDictionaryByLocale(locale, 'common')

  const nav = [
    { href: `/${locale}`,           label: t.nav.home },
    { href: `/${locale}/about`,     label: t.nav.about },
    { href: `/${locale}/courses`,   label: t.nav.courses },
    { href: `/${locale}/teachers`,  label: t.nav.teachers },
    { href: `/${locale}/branches`,  label: t.nav.branches },
    { href: `/${locale}/reviews`,   label: t.nav.reviews },
    { href: `/${locale}/contacts`,  label: t.nav.contacts },
    { href: `/${locale}/faq`,       label: t.nav.faq },
  ]

  return (
    <>
      <Header locale={locale} nav={nav} applyLabel={t.nav.apply} />
      <main className="flex-1">{children}</main>
    </>
  )
}
