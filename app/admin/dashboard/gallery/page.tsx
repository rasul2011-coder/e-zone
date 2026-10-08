import type { Metadata } from 'next'
import GalleryAdminClient from './_components/GalleryAdminClient'
export const metadata: Metadata = { title: 'Галерея · Admin' }
export default function GalleryPage() { return <GalleryAdminClient /> }
