import { motion, useTransform, type MotionValue } from 'motion/react'
import type { CSSProperties } from 'react'
import { Starfield } from '@/components/effects/Starfield'
import { Skyline } from './Skyline'

const METEORS: CSSProperties[] = [
  { left: '74%', top: '12%' },
  { left: '40%', top: '9%' },
  { left: '88%', top: '24%' },
  { left: '60%', top: '17%' },
  { left: '30%', top: '21%' },
]

function VesperStar({ pulse }: { pulse: number }) {
  return (
    <div className="relative size-14">
      <div className="absolute -inset-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,206,168,0.42),rgba(255,108,44,0.12)_55%,transparent)]" />
      <svg viewBox="0 0 64 64" aria-hidden="true" className="absolute inset-0 size-full">
        <defs>
          <radialGradient id="vesper-star" cx="0.5" cy="0.5" r="0.5">
            <stop offset="0" stopColor="#FFFFFF" />
            <stop offset="0.4" stopColor="#FFE3CC" />
            <stop offset="1" stopColor="#FF9A5C" />
          </radialGradient>
        </defs>
        <path d="M32 4C33.6 23 41 30.4 60 32 41 33.6 33.6 41 32 60 30.4 41 23 33.6 4 32 23 30.4 30.4 23 32 4Z" fill="url(#vesper-star)" />
        <circle cx="32" cy="32" r="4.5" fill="#FFFFFF" />
      </svg>
      {pulse > 0 && (
        <span key={pulse} className="absolute -inset-1 animate-[ping-slow_1.4s_ease-out_1_forwards] rounded-full border border-ember-200/80" />
      )}
      <span className="absolute left-1/2 top-full mt-3 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.24em] text-ember-200/70">
        Vesper
      </span>
    </div>
  )
}

interface SkyProps {
  progress: MotionValue<number>
  /** Number of merge events so far — each one fires a meteor + star pulse. */
  merges: number
}

/** Dusk → night → dawn. Every moving part is an opacity or transform motion value. */
export function Sky({ progress, merges }: SkyProps) {
  const dusk = useTransform(progress, [0, 0.18, 0.34], [1, 0.75, 0])
  const night = useTransform(progress, [0.16, 0.34, 0.74, 0.88], [0, 1, 1, 0])
  const dawn = useTransform(progress, [0.74, 0.92, 1], [0, 0.85, 1])
  const stars = useTransform(progress, [0.04, 0.3, 0.8, 0.97], [0.15, 1, 1, 0.2])

  const sunY = useTransform(progress, [0, 0.26], [0, 230])
  const sunOpacity = useTransform(progress, [0.12, 0.27], [1, 0])
  const dawnY = useTransform(progress, [0.74, 1], [170, 0])
  const dawnOpacity = useTransform(progress, [0.74, 0.95], [0, 1])

  const arc = useTransform(progress, [0.04, 0.96], [-68, 68])
  const upright = useTransform(arc, (deg) => -deg)
  const starOpacity = useTransform(progress, [0.02, 0.1, 0.88, 0.98], [0, 1, 1, 0.45])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-ink-950" />
      <motion.div style={{ opacity: dusk }} className="absolute inset-0 bg-[linear-gradient(180deg,#0a0908_0%,#140d0a_42%,#3a190b_76%,#6e2c0f_100%)] will-change-[opacity]" />
      <motion.div style={{ opacity: night }} className="absolute inset-0 bg-[linear-gradient(180deg,#040303_0%,#080706_58%,#130c09_100%)] will-change-[opacity]" />
      <motion.div style={{ opacity: dawn }} className="absolute inset-0 bg-[linear-gradient(180deg,#0a0908_0%,#1a110d_45%,#4c2414_80%,#9a4a22_100%)] will-change-[opacity]" />

      <motion.div style={{ opacity: stars }} className="absolute inset-0 will-change-[opacity]">
        <Starfield density={0.9} twinkles={18} shootingStars={false} seed={23} />
      </motion.div>

      {/* sun sinking behind the skyline */}
      <motion.div
        style={{ y: sunY, opacity: sunOpacity }}
        className="absolute bottom-[90px] left-[58%] size-[300px] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,#ffe0c4_0%,#ff9a5c_30%,rgba(255,108,44,0.45)_55%,transparent)] sm:bottom-[130px]"
      />
      {/* dawn light rising */}
      <motion.div
        style={{ y: dawnY, opacity: dawnOpacity }}
        className="absolute -bottom-40 left-1/2 h-[520px] w-[1500px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,170,110,0.5),rgba(255,108,44,0.16)_55%,transparent)]"
      />

      {/* Vesper — the evening star — arcs across the night */}
      <motion.div style={{ rotate: arc, opacity: starOpacity }} className="absolute -bottom-[40vh] left-1/2 h-[96vh] w-px origin-bottom">
        <motion.div style={{ rotate: upright }} className="absolute -left-7 -top-7">
          <VesperStar pulse={merges} />
        </motion.div>
      </motion.div>

      {merges > 0 && <span key={merges} className="meteor" style={METEORS[(merges - 1) % METEORS.length]} />}

      <Skyline progress={progress} />
    </div>
  )
}
