import { animate, motion, useMotionValue, useReducedMotion, useTransform, type MotionValue } from 'motion/react'
import { useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

/*
 * A real card flip: both faces live in one grid cell (the taller face sets
 * the height, so nothing reflows), the card turns on a spring, lifts toward
 * the viewer while it is edge-on, a light band sweeps across the faces and
 * the shadow underneath shrinks. Everything is driven by ONE motion value
 * and only touches transform / opacity.
 */
const DEG = Math.PI / 180

interface FlipCardProps {
  flipped: boolean
  front: ReactNode
  back: ReactNode
  /** ids for the tabpanel pattern */
  frontId: string
  backId: string
  frontLabel: string
  backLabel: string
}

export function FlipCard({ flipped, front, back, frontId, backId, frontLabel, backLabel }: FlipCardProps) {
  const reduce = useReducedMotion()
  const rotate = useMotionValue(flipped ? 180 : 0)
  useEffect(() => {
    const target = flipped ? 180 : 0
    if (reduce) {
      rotate.set(target)
      return
    }
    // interruptible: a second click mid-flip turns back from the current angle and velocity
    const controls = animate(rotate, target, { type: 'spring', visualDuration: 0.95, bounce: 0.2 })
    return () => controls.stop()
  }, [flipped, reduce, rotate])

  /** 0 when flat, 1 when edge-on. */
  const edge = useTransform(rotate, (r) => Math.abs(Math.sin(r * DEG)))
  const z = useTransform(edge, (e) => e * 130)
  const tilt = useTransform(rotate, (r) => Math.sin(r * DEG) * -6)
  const shadowScale = useTransform(edge, (e) => 1 - e * 0.42)
  const shadowOpacity = useTransform(edge, (e) => 1 - e * 0.55)

  return (
    <div className="relative [perspective:1900px]">
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[6%] -bottom-10 h-20 rounded-[50%] bg-[radial-gradient(closest-side,rgba(0,0,0,0.85),transparent)]"
        style={{ scaleX: shadowScale, opacity: shadowOpacity }}
      />
      <motion.div className="relative grid [transform-style:preserve-3d]" style={{ rotateY: rotate, rotateX: tilt, z }}>
        <Face id={frontId} label={frontLabel} rotate={rotate} side="front" active={!flipped}>
          {front}
        </Face>
        <Face id={backId} label={backLabel} rotate={rotate} side="back" active={flipped}>
          {back}
        </Face>
      </motion.div>
    </div>
  )
}

interface FaceProps {
  id: string
  label: string
  side: 'front' | 'back'
  active: boolean
  rotate: MotionValue<number>
  children: ReactNode
}

function Face({ id, label, side, active, rotate, children }: FaceProps) {
  const back = side === 'back'
  /** This face's own turn away from the viewer: 0 facing → 90 edge-on. */
  const turn = useTransform(rotate, (r) => Math.min(90, Math.abs(back ? 180 - r : r)))
  const shade = useTransform(turn, (t) => Math.sin(t * DEG) * 0.6)
  const sheenOpacity = useTransform(turn, (t) => Math.max(0, Math.sin(2 * t * DEG)))
  // the band always travels left → right on screen as the card turns forward
  const sheenX = useTransform(turn, (t): string => `${-110 + 320 * (back ? 1 - t / 90 : t / 90)}%`)

  return (
    <div
      id={id}
      role="tabpanel"
      aria-label={label}
      inert={!active}
      className={cn(
        'relative overflow-hidden rounded-[30px] border border-white/[0.09] p-5 [backface-visibility:hidden] [grid-area:1/1] [-webkit-backface-visibility:hidden] sm:p-8',
        'bg-[linear-gradient(180deg,#1e1a17_0%,#131110_52%,#0e0c0b_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.07),0_50px_120px_-50px_rgba(0,0,0,0.95)]',
      )}
      style={back ? { transform: 'rotateY(180deg)' } : undefined}
    >
      <span aria-hidden="true" className="pointer-events-none absolute inset-x-12 top-0 h-px bg-linear-to-r from-transparent via-ember-200/70 to-transparent" />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[70%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,135,72,0.16),transparent)]"
      />
      <div className="relative h-full">{children}</div>
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-ink-950" style={{ opacity: shade }} />
      <motion.div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-y-[15%] left-0 w-1/2 bg-linear-to-r from-transparent via-ember-50/[0.16] to-transparent"
        style={{ x: sheenX, skewX: -14, opacity: sheenOpacity }}
      />
    </div>
  )
}
