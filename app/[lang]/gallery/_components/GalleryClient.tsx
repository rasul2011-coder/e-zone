'use client'

import { useState } from 'react'
import Image from 'next/image'

interface GalleryItem {
  id: number
  category: string
  label: string
  src: string
  author?: string
}

interface Filters {
  all: string
  classes: string
  events: string
  branches: string
}

interface Props {
  items: GalleryItem[]
  filters: Filters
}

export default function GalleryClient({ items, filters }: Props) {
  const [activeFilter, setActiveFilter] = useState<string>('all')
  const [lightbox, setLightbox]         = useState<GalleryItem | null>(null)

  const filtered = activeFilter === 'all'
    ? items
    : items.filter((item) => item.category === activeFilter)

  const filterTabs = [
    { key: 'all',      label: filters.all },
    { key: 'classes',  label: filters.classes },
    { key: 'events',   label: filters.events },
    { key: 'branches', label: filters.branches },
  ]

  function openLightbox(item: GalleryItem) {
    setLightbox(item)
    document.body.style.overflow = 'hidden'
  }

  function closeLightbox() {
    setLightbox(null)
    document.body.style.overflow = ''
  }

  function navLightbox(dir: -1 | 1) {
    if (!lightbox) return
    const idx = filtered.findIndex((i) => i.id === lightbox.id)
    const next = filtered[(idx + dir + filtered.length) % filtered.length]
    setLightbox(next)
  }

  return (
    <>
      <section className="py-12 md:py-16">
        <div className="mx-auto max-w-7xl px-4 md:px-8">
          {/* Filter tabs */}
          <div className="mb-8 flex flex-wrap gap-2">
            {filterTabs.map((f) => (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`rounded-full px-5 py-2 text-sm font-medium transition ${
                  activeFilter === f.key
                    ? 'bg-orange-500 text-white shadow-md shadow-orange-500/30'
                    : 'border border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-muted)] hover:border-orange-500/40 hover:text-orange-500'
                }`}
              >
                {f.label}
                <span className={`ml-2 rounded-full px-1.5 py-0.5 text-xs ${activeFilter === f.key ? 'bg-white/20' : 'bg-[var(--bg-alt)]'}`}>
                  {f.key === 'all' ? items.length : items.filter((i) => i.category === f.key).length}
                </span>
              </button>
            ))}
          </div>

          {/* Masonry-style grid */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {filtered.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => openLightbox(item)}
                className={`group relative overflow-hidden rounded-2xl bg-[var(--bg-card)] cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                  // Make first item and every 7th item span 2 columns for visual variety
                  (idx === 0 || idx === 6) ? 'sm:col-span-2' : ''
                }`}
                style={{ aspectRatio: (idx === 0 || idx === 6) ? '2/1' : '1/1' }}
                aria-label={item.label}
              >
                <Image
                  src={item.src}
                  alt={item.label}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                  <p className="text-left text-xs font-semibold text-white leading-tight">{item.label}</p>
                </div>
                {/* Zoom icon */}
                <div className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/>
                    <line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/>
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightbox && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            aria-label="Закрыть"
            className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
            </svg>
          </button>

          {/* Prev */}
          <button
            onClick={(e) => { e.stopPropagation(); navLightbox(-1) }}
            aria-label="Предыдущее"
            className="absolute left-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6"/>
            </svg>
          </button>

          {/* Next */}
          <button
            onClick={(e) => { e.stopPropagation(); navLightbox(1) }}
            aria-label="Следующее"
            className="absolute right-16 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 transition z-10"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18l6-6-6-6"/>
            </svg>
          </button>

          {/* Image */}
          <div
            className="relative mx-16 max-h-[80vh] max-w-4xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full" style={{ aspectRatio: '4/3' }}>
              <Image
                src={lightbox.src}
                alt={lightbox.label}
                fill
                sizes="(max-width: 1024px) 90vw, 800px"
                className="rounded-2xl object-cover"
              />
            </div>
            <p className="mt-3 text-center text-sm font-medium text-white/80">{lightbox.label}</p>
            <p className="mt-1 text-center text-xs text-white/40">
              Photo: {lightbox.author} · Unsplash
            </p>
          </div>
        </div>
      )}
    </>
  )
}
