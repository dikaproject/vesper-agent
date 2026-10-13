import { AnimatePresence, motion } from 'motion/react'
import { EASE_IN_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

export interface Waypoint {
  /** Arrival time (ms). */
  at: number
  x: number
  y: number
  click?: boolean
}

interface AgentCursorProps {
  t: number
  path: Waypoint[]
  label: string
  tone?: 'ember' | 'sand'
}

/**
 * Multiplayer-style cursor. The scene clock only picks the next waypoint;
 * the motion itself is a 60fps tween, so it glides even though the clock
 * ticks at 30fps.
 */
export function AgentCursor({ t, path, label, tone = 'ember' }: AgentCursorProps) {
  const first = path[0]
  if (!first) return null

  let target = path.length - 1
  for (let i = 0; i < path.length; i++) {
    const wp = path[i]
    if (wp && wp.at > t) {
      target = i
      break
    }
  }
  const to = path[target] ?? first
  const from = path[Math.max(0, target - 1)] ?? first
  const duration = Math.max(0.25, ((to.at - from.at) / 1000) * 0.92)

  let clickIndex = -1
  path.forEach((wp, i) => {
    if (wp.click && t >= wp.at && t < wp.at + 450) clickIndex = i
  })

  const ember = tone === 'ember'
  return (
    <motion.div
      aria-hidden="true"
      className="pointer-events-none absolute left-0 top-0 z-50"
      initial={{ x: first.x, y: first.y, opacity: 0 }}
      animate={{ x: to.x, y: to.y, opacity: 1 }}
      transition={{ x: { duration, ease: EASE_IN_OUT }, y: { duration, ease: EASE_IN_OUT }, opacity: { duration: 0.3 } }}
    >
      <AnimatePresence>
        {clickIndex >= 0 && (
          <motion.span
            key={clickIndex}
            className={cn('absolute -left-3 -top-3 size-6 rounded-full border-2', ember ? 'border-ember-300' : 'border-sand-100')}
            initial={{ scale: 0.3, opacity: 0.9 }}
            animate={{ scale: 1.9, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.55, ease: 'easeOut' }}
          />
        )}
      </AnimatePresence>
      <motion.svg
        width="18"
        height="20"
        viewBox="0 0 18 20"
        animate={{ scale: clickIndex >= 0 ? 0.85 : 1 }}
        transition={{ duration: 0.15 }}
        style={{ transformOrigin: '2px 2px' }}
        className="drop-shadow-[0_2px_6px_rgba(0,0,0,0.6)]"
      >
        <path
          d="M2 2v14.6l3.9-3.7 2.6 5.9 2.6-1.2-2.6-5.8 5.6-.2L2 2Z"
          fill={ember ? '#FF8748' : '#F2EDE7'}
          stroke={ember ? '#FFF1E6' : '#0A0908'}
          strokeWidth="1.3"
          strokeLinejoin="round"
        />
      </motion.svg>
      <span
        className={cn(
          'absolute left-4 top-[18px] whitespace-nowrap rounded-full px-2 py-0.5 text-[10.5px] font-semibold shadow-[0_6px_16px_-6px_rgba(0,0,0,0.8)]',
          ember ? 'bg-ember-400 text-ink-950' : 'bg-sand-100 text-ink-950',
        )}
      >
        {label}
      </span>
    </motion.div>
  )
}
