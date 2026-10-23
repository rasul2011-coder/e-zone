'use client'

import { useEffect, useState } from 'react'
import { useInView } from 'react-intersection-observer'

interface StatItem {
  value: string
  label: string
  gradient: string
}

function CountUp({
  end,
  hasPlus,
  hasPercent,
}: {
  end: number
  hasPlus: boolean
  hasPercent: boolean
}) {
  const [count, setCount] = useState(0)
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.3 })

  useEffect(() => {
    if (!inView) return
    const duration = 2000
    let startTime: number | null = null
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)
      const easeOut = 1 - Math.pow(1 - progress, 4)
      setCount(Math.floor(easeOut * end))
      if (progress < 1) requestAnimationFrame(animate)
    }
    requestAnimationFrame(animate)
  }, [inView, end])

  return (
    <span ref={ref}>
      {count}
      {hasPlus && '+'}
      {hasPercent && '%'}
    </span>
  )
}

export default function StatsBand({
  title,
  stats,
}: {
  title: string
  stats: StatItem[]
}) {
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
        {/* Label */}
        <p className="text-center text-sm font-semibold uppercase tracking-[0.2em] text-orange-400 mb-14">
          {title}
        </p>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((s, i) => {
            const numMatch = s.value.match(/\d+/)
            const num = numMatch ? parseInt(numMatch[0]) : 0
            const hasPlus = s.value.includes('+')
            const hasPercent = s.value.includes('%')

            return (
              <div
                key={s.label}
                className="group relative flex flex-col items-center gap-5 rounded-3xl p-8 text-center cursor-default"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {/* Glass bg */}
                <div className="absolute inset-0 rounded-3xl bg-white/[0.03] backdrop-blur-sm border border-white/[0.07] transition-all duration-500 group-hover:bg-white/[0.07] group-hover:border-white/[0.15]" />

                {/* Glow */}
                <div
                  className="absolute inset-0 rounded-3xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-20 -z-10"
                  style={{ background: s.gradient }}
                />

                {/* Top accent line */}
                <div
                  className="absolute top-0 left-8 right-8 h-[2px] rounded-full opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:left-4 group-hover:right-4"
                  style={{ background: s.gradient }}
                />

                {/* Number */}
                <div className="relative z-10">
                  <p
                    className="text-5xl font-black tracking-tight text-white transition-transform duration-300 group-hover:scale-110"
                    style={{ textShadow: '0 0 40px rgba(255,255,255,0.15)' }}
                  >
                    <CountUp end={num} hasPlus={hasPlus} hasPercent={hasPercent} />
                  </p>

                  {/* Divider */}
                  <div
                    className="mx-auto my-3 h-px w-8 rounded-full opacity-30 transition-all duration-500 group-hover:w-14 group-hover:opacity-70"
                    style={{ background: s.gradient }}
                  />

                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/40 transition-colors duration-300 group-hover:text-white/70">
                    {s.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
