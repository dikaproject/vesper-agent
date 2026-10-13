import { motion } from 'motion/react'
import type { ComponentType, CSSProperties, ReactNode } from 'react'
import { EASE_OUT } from '@/lib/motion'
import { mulberry32 } from '@/lib/random'
import { cn } from '@/lib/utils'
import type { PlanId } from './plans'

/* Tiny animated skies for each plan header — CSS / SVG only, no canvas. */

interface Star {
  x: number
  y: number
  size: number
  twinkle: boolean
  delay: number
  alpha: number
}

const makeStars = (seed: number, count: number, maxY = 78): Star[] => {
  const r = mulberry32(seed)
  return Array.from({ length: count }, () => ({
    x: r() * 100,
    y: r() * maxY,
    size: r() < 0.16 ? 2 : 1,
    twinkle: r() < 0.3,
    delay: -r() * 4,
    alpha: 0.35 + r() * 0.55,
  }))
}

function Stars({ stars }: { stars: Star[] }) {
  return (
    <div className="absolute inset-0">
      {stars.map((s, i) => (
        <span
          key={i}
          className={cn('absolute rounded-full bg-sand-50', s.twinkle && 'animate-twinkle')}
          style={{ left: `${s.x}%`, top: `${s.y}%`, width: s.size, height: s.size, opacity: s.alpha, animationDelay: `${s.delay}s` }}
        />
      ))}
    </div>
  )
}

const skylinePath = (seed: number, w = 300, h = 36) => {
  const r = mulberry32(seed)
  let d = `M0 ${h}`
  let x = 0
  while (x < w) {
    const bw = 8 + r() * 16
    const bh = 8 + r() * (h - 10)
    d += ` V${(h - bh).toFixed(1)} H${Math.min(w, x + bw).toFixed(1)}`
    x += bw
  }
  return `${d} V${h} Z`
}

function SkyLabel({ children }: { children: ReactNode }) {
  return (
    <span className="absolute left-3 top-3 rounded-full bg-black/40 px-2.5 py-1 font-mono text-[10px] text-sand-200 ring-1 ring-inset ring-white/10">
      {children}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/* Dusk — the sun sets a little further when you hover the card         */
/* ------------------------------------------------------------------ */
const DUSK_STARS = makeStars(3, 10, 46)
const DUSK_SKYLINE = skylinePath(8)

function DuskSky() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#0f0a08_0%,#26120a_52%,#5e260e_100%)]">
      <Stars stars={DUSK_STARS} />
      <div className="absolute bottom-[-62px] left-[64%] size-[136px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#ffe7d2,#ffa56d_36%,rgba(255,108,44,0.42)_62%,transparent)] transition-[translate] duration-[1400ms] ease-out group-hover/plan:translate-y-6" />
      <svg viewBox="0 0 300 36" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[30px] w-full">
        <path d={DUSK_SKYLINE} fill="#070605" />
      </svg>
      <SkyLabel>6:00 PM · team logs off</SkyLabel>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Night Shift — Vesper star, twinkles and a shooting star              */
/* ------------------------------------------------------------------ */
const NIGHT_STARS = makeStars(14, 26)
const NIGHT_SKYLINE = skylinePath(21, 300, 30)

function NightSky() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#040303_0%,#0b0807_62%,#1e100a_100%)]">
      <Stars stars={NIGHT_STARS} />
      <span
        className="shooting-star"
        style={{ left: '78%', top: '10%', width: 110, '--dur': '7s', '--delay': '1.2s', '--dx': '-210px', '--dy': '95px' } as CSSProperties}
      />
      <div className="absolute right-[17%] top-[22%] size-11">
        <div className="absolute -inset-8 animate-breathe rounded-full bg-[radial-gradient(closest-side,rgba(255,206,168,0.5),rgba(255,108,44,0.14)_55%,transparent)]" />
        <svg viewBox="0 0 64 64" aria-hidden="true" className="relative size-full">
          <path d="M32 4C33.6 23 41 30.4 60 32 41 33.6 33.6 41 32 60 30.4 41 23 33.6 4 32 23 30.4 30.4 23 32 4Z" fill="#FFE3CC" />
          <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
        </svg>
      </div>
      <svg viewBox="0 0 300 30" preserveAspectRatio="none" aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[24px] w-full">
        <path d={NIGHT_SKYLINE} fill="#050404" />
      </svg>
      <SkyLabel>2:14 AM · 3 PRs merged</SkyLabel>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Constellation — lines draw themselves once the card is in view       */
/* ------------------------------------------------------------------ */
const CONST_STARS = makeStars(29, 14)
const NODES: [number, number][] = [
  [34, 92],
  [72, 64],
  [108, 78],
  [146, 44],
  [184, 58],
  [218, 30],
  [252, 66],
  [282, 46],
]
const CONST_PATH = `M${NODES.map(([x, y]) => `${x} ${y}`).join(' L')} M146 44 L170 96 L218 104`

function ConstellationSky() {
  return (
    <div className="absolute inset-0 bg-[linear-gradient(180deg,#050404_0%,#0d0a09_60%,#170e0a_100%)]">
      <Stars stars={CONST_STARS} />
      <svg viewBox="0 0 300 128" preserveAspectRatio="xMidYMid slice" aria-hidden="true" className="absolute inset-0 size-full">
        <motion.path
          d={CONST_PATH}
          fill="none"
          stroke="rgba(255,200,170,0.5)"
          strokeWidth="1"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 2.4, ease: EASE_OUT, delay: 0.3 }}
          className="transition-[stroke] duration-500 group-hover/plan:stroke-[rgba(255,190,150,0.9)]"
        />
        {[...NODES, [170, 96] as [number, number], [218, 104] as [number, number]].map(([x, y], i) => (
          <g key={i}>
            <circle cx={x} cy={y} r="7" fill="rgba(255,135,72,0.16)" />
            <circle
              cx={x}
              cy={y}
              r={i % 3 === 0 ? 2.6 : 1.9}
              fill="#FFF1E6"
              className="animate-twinkle"
              style={{ animationDelay: `${i * 0.37}s`, transformBox: 'fill-box', transformOrigin: 'center' }}
            />
          </g>
        ))}
      </svg>
      <SkyLabel>Always on · 12 regions</SkyLabel>
    </div>
  )
}

export const PLAN_SKIES: Record<PlanId, ComponentType> = {
  dusk: DuskSky,
  night: NightSky,
  constellation: ConstellationSky,
}
