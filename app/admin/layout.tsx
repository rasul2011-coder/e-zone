import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: {
    template: '%s · English Zone Admin',
    default:  'English Zone Admin',
  },
  robots: { index: false, follow: false },
}

// Admin layout: no Header/Footer from the public site.
// Route protection is handled by middleware.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
