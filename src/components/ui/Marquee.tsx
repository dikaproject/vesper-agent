import type { CSSProperties, ReactNode } from 'react'
import { cn } from '@/lib/utils'

interface MarqueeProps {
  children: ReactNode
  className?: string
  /** Seconds for one full loop. */
  duration?: number
  gap?: string
  reverse?: boolean
  pauseOnHover?: boolean
  /** How many copies of the content to render (>= 2 for a seamless loop). */
  repeat?: number
}

/** Seamless CSS marquee: every copy translates by its own width + gap. */
export function Marquee({
  children,
  className,
  duration = 40,
  gap = '3rem',
  reverse = false,
  pauseOnHover = true,
  repeat = 2,
}: MarqueeProps) {
  return (
    <div
      className={cn('group/marquee flex overflow-hidden', className)}
      style={{ '--duration': `${duration}s`, '--gap': gap, gap } as CSSProperties}
    >
      {Array.from({ length: repeat }, (_, i) => (
        <div
          key={i}
          aria-hidden={i > 0 ? true : undefined}
          className={cn(
            'flex shrink-0 items-center justify-around animate-marquee',
            pauseOnHover && 'group-hover/marquee:[animation-play-state:paused]',
            reverse && '[animation-direction:reverse]',
          )}
          style={{ gap }}
        >
          {children}
        </div>
      ))}
    </div>
  )
}
