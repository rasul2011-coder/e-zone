'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface Stat {
  value: string
  label: string
  icon: React.ReactNode
  gradient: string
}

interface StatsSectionProps {
  stats: Stat[]
  title?: React.ReactNode
  subtitle?: string
}

function CountUpNumber({
  end,
  duration = 2000,
  hasPlus = false,
  hasPercent = false,
}: {
  end: number
  duration?: number
  hasPlus?: boolean
  hasPercent?: boolean
}) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, end, duration])

  return (
    <span ref={ref}>
      {count}
      {hasPlus && '+'}
      {hasPercent && '%'}
    </span>
  )
}

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const numMatch = stat.value.match(/\d+/)
  const num = numMatch ? parseInt(numMatch[0]) : 0
  const hasPlus = stat.value.includes('+')
  const hasPercent = stat.value.includes('%')

  return (
    <div
      className="group relative flex flex-col items-center gap-6 rounded-3xl p-8 text-center cursor-default"
      style={{ animationDelay: `${index * 0.1}s` }}
    >
      {/* Glass background */}
      <div className="absolute inset-0 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-white/[0.15]" />

      {/* Colored glow on hover */}
      <div
        className="absolute inset-0 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-15 -z-10"
        style={{ background: stat.gradient }}
      />

      {/* Top accent line */}
      <div
        className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:left-4 group-hover:right-4"
        style={{ background: stat.gradient }}
      />

      {/* Icon bubble */}
      <div className="relative z-10">
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl text-white shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:shadow-2xl"
          style={{ background: stat.gradient }}
        >
          {/* inner shine */}
          <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/20 to-transparent" />
          <span className="relative z-10">{stat.icon}</span>
        </div>
        {/* halo ring */}
        <div
          className="absolute -inset-2 rounded-3xl opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: stat.gradient }}
        />
      </div>

      {/* Number */}
      <div className="relative z-10">
        <p
          className="text-5xl font-black tracking-tight text-white transition-all duration-300 group-hover:scale-105"
          style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}
        >
          <CountUpNumber end={num} hasPlus={hasPlus} hasPercent={hasPercent} />
        </p>

        {/* Divider */}
        <div
          className="mx-auto my-3 h-px w-8 rounded-full opacity-30 transition-all duration-500 group-hover:w-16 group-hover:opacity-60"
          style={{ background: stat.gradient }}
        />

        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 group-hover:text-white/70">
          {stat.label}
        </p>
      </div>
    </div>
  )
}

export default function StatsSection({ stats, title, subtitle }: StatsSectionProps) {
  return (
    <section className="relative overflow-hidden py-20 md:py-28" style={{ background: 'var(--bg-section)' }}>
      {/* Dot grid */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.035]"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
          backgroundSize: '28px 28px',
        }}
      />

      {/* Ambient blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute left-1/4 top-0 h-96 w-96 -translate-x-1/2 -translate-y-1/2 rounded-full bg-orange-500/10 blur-[100px]" />
      <div aria-hidden="true" className="pointer-events-none absolute right-1/4 bottom-0 h-96 w-96 translate-x-1/2 translate-y-1/2 rounded-full bg-blue-500/10 blur-[100px]" />

      <div className="relative mx-auto max-w-7xl px-4 md:px-8">
        {/* Header */}
        {(title || subtitle) && (
          <div className="mb-14 text-center">
            {title && (
              <h2 className="text-3xl font-black text-white sm:text-4xl md:text-5xl">
                {title}
              </h2>
            )}
            {subtitle && (
              <p className="mt-4 text-base text-white/50">{subtitle}</p>
            )}
          </div>
        )}

        {/* Cards grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <StatCard key={stat.label} stat={stat} index={index} />
          ))}
        </div>
      </div>
    </section>
  )
}
