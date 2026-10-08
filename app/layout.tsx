import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import ThemeProvider from '@/components/ThemeProvider'
import { db, schema } from '@/lib/db'
import { inArray } from 'drizzle-orm'
import './globals.css'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'English Zone — Языковой центр',
  description: 'Языковой центр English Zone — эффективное обучение английскому для детей и взрослых в Бишкеке',
}

// Load brand colors from DB — applied as inline CSS vars so they override globals.css defaults
async function getBrandColors(): Promise<Record<string, string>> {
  try {
    const COLOR_KEYS = ['brand_primary', 'brand_accent', 'brand_navy', 'brand_navy_mid']
    const rows = await db
      .select()
      .from(schema.siteSettings)
      .where(inArray(schema.siteSettings.key, COLOR_KEYS))
    const out: Record<string, string> = {}
    for (const row of rows) { out[row.key] = row.value }
    return out
  } catch { return {} }
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const brandColors = await getBrandColors()

  // Build inline <style> with CSS variable overrides only if colors are set in DB
  let brandStyle = ''
  if (brandColors.brand_primary) brandStyle += `--orange:${brandColors.brand_primary};`
  if (brandColors.brand_accent)  brandStyle += `--orange-dark:${brandColors.brand_accent};`
  if (brandColors.brand_navy)    brandStyle += `--navy:${brandColors.brand_navy};--bg-section:${brandColors.brand_navy};--bg-section-deep:${brandColors.brand_navy};`
  if (brandColors.brand_navy_mid) brandStyle += `--navy-mid:${brandColors.brand_navy_mid};--bg-section-mid:${brandColors.brand_navy_mid};--bg-card-header:${brandColors.brand_navy_mid};`

  return (
    <html
      lang="ru"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {/* Inline script runs synchronously before React hydrates — prevents flash of wrong theme */}
        {/* eslint-disable-next-line @next/next/no-sync-scripts */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme');if(!t){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light';}document.documentElement.classList.toggle('dark',t==='dark');}catch(e){}})();`,
          }}
        />
        {/* Brand color overrides from DB — injected before first paint */}
        {brandStyle && (
          <style dangerouslySetInnerHTML={{ __html: `:root{${brandStyle}}` }} />
        )}
      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
