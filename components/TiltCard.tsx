'use client'

import { useRef, type MouseEvent, type ReactNode } from 'react'

interface Props {
  children: ReactNode
  className?: string
  intensity?: number // degrees, default 12
}

/**
 * Wraps children in a div that tilts toward the cursor on hover.
 * Uses CSS perspective + rotateX/Y — zero dependencies.
 */
export default function TiltCard({ children, className = '', intensity = 12 }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  function handleMove(e: MouseEvent<HTMLDivElement>) {
    const el = ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    // Normalise mouse position to -0.5 … +0.5
    const x = (e.clientX - rect.left) / rect.width  - 0.5
    const y = (e.clientY - rect.top)  / rect.height - 0.5
    // rotateY tilts left/right, rotateX tilts up/down (inverted Y axis)
    el.style.transform = `perspective(600px) rotateX(${(-y * intensity).toFixed(2)}deg) rotateY(${(x * intensity).toFixed(2)}deg) scale3d(1.03,1.03,1.03)`
  }

  function handleLeave() {
    const el = ref.current
    if (!el) return
    el.style.transform = 'perspective(600px) rotateX(0deg) rotateY(0deg) scale3d(1,1,1)'
  }

  return (
    <div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={className}
      style={{
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
        willChange: 'transform',
      }}
    >
      {children}
    </div>
  )
}
