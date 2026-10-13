import { motion } from 'motion/react'
import { useRef, type CSSProperties } from 'react'
import { AGENTS, type Agent, type AgentId } from '@/data/agents'
import { useFitScale, useSvgId } from '@/hooks/useDom'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

/*
 * The crew orbiting the Vesper star. Orbits are flattened circles: a wrapper
 * squashes the plane with scaleY, each arm spins with a CSS animation, and
 * each planet counter-rotates (and un-squashes) so it stays upright. A third
 * animation in the same rhythm shrinks and dims planets on the far side.
 * Every moving part is a compositor transform; React only re-renders when an
 * agent lights up.
 */
const W = 600
const H = 340
const CX = W / 2
const CY = 165
const TILT = 0.34
const PLANET = 46

const ORBITS = [
  { r: 140, dur: 30 },
  { r: 200, dur: 44 },
  { r: 258, dur: 60 },
] as const

const PLACEMENT: Record<AgentId, { orbit: number; phase: number }> = {
  research: { orbit: 0, phase: 0.06 },
  qa: { orbit: 0, phase: 0.56 },
  planning: { orbit: 1, phase: 0.27 },
  deploy: { orbit: 1, phase: 0.77 },
  analysis: { orbit: 2, phase: 0.42 },
  development: { orbit: 2, phase: 0.92 },
}

const STAR_PATH = 'M32 4C33.6 23 41 30.4 60 32 41 33.6 33.6 41 32 60 30.4 41 23 33.6 4 32 23 30.4 30.4 23 32 4Z'

function OrbitLines() {
  const id = useSvgId('orbit-front')
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 size-full" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0.45" stopColor="#FF8748" stopOpacity="0" />
          <stop offset="1" stopColor="#FFB27F" stopOpacity="0.6" />
        </linearGradient>
      </defs>
      {ORBITS.map(({ r }, i) => (
        <g key={r}>
          <ellipse cx={CX} cy={CY} rx={r} ry={r * TILT} fill="none" stroke="rgba(255,255,255,0.08)" strokeDasharray={i === 1 ? '3 7' : undefined} />
          <ellipse cx={CX} cy={CY} rx={r} ry={r * TILT} fill="none" stroke={`url(#${id})`} strokeWidth="1.2" />
        </g>
      ))}
    </svg>
  )
}

function Planet({ agent, lit }: { agent: Agent; lit: boolean }) {
  const { orbit, phase } = PLACEMENT[agent.id]
  const { r, dur } = ORBITS[orbit] ?? ORBITS[0]
  const timing = { animationDuration: `${dur}s`, animationDelay: `${-phase * dur}s` }
  const angle = phase * 360
  // static fallbacks (reduced motion): the same pose the animations start from
  const depth = 0.85 + 0.15 * Math.cos(phase * Math.PI * 2)
  const Icon = agent.icon

  return (
    <div
      className="absolute [animation-iteration-count:infinite] [animation-name:orbit] [animation-timing-function:linear]"
      style={{ left: CX - r, top: CY - r, width: r * 2, height: r * 2, transform: `rotate(${angle}deg)`, ...timing }}
    >
      <div className="absolute left-1/2 top-full">
        <div
          className="absolute [animation-iteration-count:infinite] [animation-name:orbit-counter] [animation-timing-function:linear]"
          style={{ left: -PLANET / 2, top: -PLANET / 2, width: PLANET, height: PLANET, transform: `rotate(${-angle}deg) scaleY(${1 / TILT})`, ...timing }}
        >
          <div
            className="relative size-full [animation-iteration-count:infinite] [animation-name:orbit-depth] [animation-timing-function:ease-in-out]"
            style={{ scale: depth.toFixed(3), opacity: 0.42 + 0.58 * ((depth - 0.7) / 0.3), ...timing }}
          >
            <span
              className={cn(
                'relative grid size-full place-items-center rounded-full border transition-[border-color,box-shadow,color] duration-700',
                lit
                  ? 'border-ember-300/60 bg-[radial-gradient(circle_at_35%_30%,#3d2617,#150f0c)] text-ember-100 shadow-[0_0_28px_-4px_rgba(255,108,44,0.8)]'
                  : 'border-white/10 bg-ink-800 text-sand-500',
              )}
            >
              <Icon className="size-[18px]" />
              {lit && (
                <span className="absolute inset-0 rounded-full ring-1 ring-ember-200/80 animate-[ping-slow_1.5s_cubic-bezier(0.22,1,0.36,1)_1_forwards]" />
              )}
            </span>
            <span
              className={cn(
                'absolute left-1/2 top-full mt-1.5 -translate-x-1/2 whitespace-nowrap font-mono text-[11.5px] transition-opacity duration-700',
                lit ? 'text-ember-200 opacity-100' : 'text-sand-600 opacity-60',
              )}
            >
              {agent.codename}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

interface OrreryProps {
  /** How many agents (in crew order) are lit. */
  lit: number
  /** Increment to fire a shockwave from the star (successful sign-in). */
  pulse: number
  /** Banks the orbital plane a few degrees; flips with the card. */
  bank: number
  className?: string
}

export function Orrery({ lit, pulse, bank, className }: OrreryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const scale = useFitScale(ref, W)

  return (
    <div ref={ref} aria-hidden="true" className={cn('relative w-full', className)} style={{ height: H * scale, '--inv': String(1 / TILT) } as CSSProperties}>
      <motion.div
        className="absolute left-1/2 top-0"
        style={{ width: W, height: H, marginLeft: -W / 2, scale, transformOrigin: '50% 0%' }}
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0, rotate: bank }}
        transition={{ opacity: { duration: 1.1, ease: EASE_OUT }, y: { duration: 1.1, ease: EASE_OUT }, rotate: { type: 'spring', stiffness: 60, damping: 14 } }}
      >
        <div className="absolute size-[380px] -translate-x-1/2 -translate-y-1/2 animate-breathe rounded-full bg-[radial-gradient(closest-side,rgba(255,170,120,0.3),rgba(255,108,44,0.1)_45%,transparent)]" style={{ left: CX, top: CY }} />
        <OrbitLines />

        {/* flattened orbital plane */}
        <div className="absolute inset-0" style={{ transform: `scaleY(${TILT})`, transformOrigin: `${CX}px ${CY}px` }}>
          {AGENTS.map((agent, i) => (
            <Planet key={agent.id} agent={agent} lit={i < lit} />
          ))}
        </div>

        {/* the Vesper star */}
        <div className="absolute" style={{ left: CX, top: CY }}>
          <span className="absolute size-[104px] -translate-x-1/2 -translate-y-1/2 animate-spin-slower rounded-full border border-dashed border-ember-300/30" />
          <svg viewBox="0 0 64 64" className="absolute size-16 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_0_14px_rgba(255,170,120,0.8)]">
            <path d={STAR_PATH} fill="#FFE3CC" />
            <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
          </svg>
          {pulse > 0 && (
            <span
              key={pulse}
              className="absolute size-[220px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember-200/70 shadow-[0_0_40px_rgba(255,135,72,0.45)] animate-[shockwave_1.8s_cubic-bezier(0.16,1,0.3,1)_forwards]"
            />
          )}
        </div>
      </motion.div>
    </div>
  )
}
