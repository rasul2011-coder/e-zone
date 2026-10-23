import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDictionary, getDictionaryByLocale } from '@/app/i18n/dictionaries'
import { hasLocale } from '@/app/i18n/config'
import type { Locale } from '@/app/i18n/config'
import type { Metadata } from 'next'
import ContactForm from './_components/ContactForm'

export async function generateMetadata({ params }: { params: Promise<{ lang: string }> }): Promise<Metadata> {
  const { lang } = await params
  if (!hasLocale(lang)) return {}
  const t = await getDictionaryByLocale(lang as Locale, 'contacts')
  return { title: `${t.title} · English Zone` }
}

export default async function ContactsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  if (!hasLocale(lang)) notFound()
  const locale = lang as Locale
  const [t, tc] = await Promise.all([
    getDictionary(locale, 'contacts'),
    getDictionary(locale, 'common'),
  ])

  const contactItems = [
    { icon: 'phone', label: t.phone, value: '+996 (700) 123-456', href: 'tel:+996700123456' },
    { icon: 'mail',  label: t.email, value: 'info@english-zone.kg', href: 'mailto:info@english-zone.kg' },
    { icon: 'map',   label: t.address, value: 'г. Бишкек, ул. Чуй 123', href: null },
    { icon: 'clock', label: t.schedule, value: 'Пн–Сб: 09:00–20:00', href: null },
  ]

  return (
    <div className="min-h-screen bg-[var(--bg)]">
      {/* Breadcrumb */}
      <div className="border-b border-[var(--border)] bg-[var(--bg-alt)]">
        <div className="mx-auto max-w-7xl px-4 py-3 md:px-8">
          <nav className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <Link href={`/${locale}`} className="hover:text-orange-500 transition">{tc.breadcrumbs.home}</Link>
            <span>/</span>
            <span className="text-[var(--text)]">{t.breadcrumb}</span>
          </nav>
        </div>
      </div>

      {/* Header */}
      <section className="section-hero py-16 relative overflow-hidden">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(circle at 1px 1px,white 1px,transparent 0)', backgroundSize: '28px 28px' }} />
        <div className="relative mx-auto max-w-7xl px-4 md:px-8 text-center">
          <span className="mb-4 inline-block rounded-full bg-orange-500/15 px-4 py-1.5 text-sm font-semibold text-orange-400">{t.title}</span>
          <h1 className="text-3xl font-extrabold text-white sm:text-4xl">{t.title}</h1>
          <p className="mt-4 text-white/60 max-w-xl mx-auto">{t.subtitle}</p>
        </div>
      </section>

      <section className="py-14 md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-start">

            {/* Contact info */}
            <div className="flex flex-col h-full space-y-4">
              <h2 className="text-xl font-bold text-[var(--text)]">{t.info_title}</h2>
              <div className="flex flex-col flex-1 gap-4">
                {contactItems.map((item) => {
                  const icons: Record<string, React.ReactNode> = {
                    phone: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.13 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.05 1.2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.09 8.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7a2 2 0 0 1 1.72 2.01z"/></svg>,
                    mail:  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
                    map:   <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
                    clock: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
                  }
                  return (
                    <div key={item.icon} className="flex flex-1 items-center gap-4 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)] p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500">
                        {icons[item.icon]}
                      </div>
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wide text-[var(--text-subtle)] mb-0.5">{item.label}</p>
                        {item.href ? (
                          <a href={item.href} className="text-sm font-medium text-[var(--text)] hover:text-orange-500 transition">{item.value}</a>
                        ) : (
                          <p className="text-sm font-medium text-[var(--text)]">{item.value}</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

            </div>

            {/* Contact form */}
            <div>
              <h2 className="mb-5 text-xl font-bold text-[var(--text)]">{t.form.title}</h2>
              <ContactForm locale={locale} t={t} />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
