import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface GlowFrameProps {
  children: ReactNode
  /** Outer element — put the border radius here (e.g. `rounded-full`). */
  className?: string
  /** Inner surface — needs an opaque background to hide the spinning gradient. */
  innerClassName?: string
  /** Seconds per revolution. */
  speed?: number
}

/**
 * 1px border with a light that orbits the shape. The conic gradient is painted
 * once and rotated with `transform`, so the effect stays on the compositor.
 */
export function GlowFrame({ children, className, innerClassName, speed = 6 }: GlowFrameProps) {
  return (
    <div className={cn('glow-frame', className)}>
      <span aria-hidden="true" className="glow-frame-spin" style={{ animationDuration: `${speed}s` }} />
      <div className={cn('relative h-full rounded-[inherit]', innerClassName)}>{children}</div>
    </div>
  )
}
