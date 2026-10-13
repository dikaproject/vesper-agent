import { motion, useTransform, type MotionValue } from 'motion/react'
import { CLOCK_MINUTES, CLOCK_STOPS } from './events'

const START = 18 * 60 // 6:00 PM
const wall = (m: number) => (START + Math.floor(m)) % (24 * 60)

/**
 * Scroll-driven wall clock. Digits are motion values written straight to the
 * DOM, so scrolling never re-renders React.
 */
export function NightClock({ progress }: { progress: MotionValue<number> }) {
  const minutes = useTransform(progress, CLOCK_STOPS, CLOCK_MINUTES)
  const hours = useTransform(minutes, (m) => String(Math.floor(wall(m) / 60) % 12 || 12).padStart(2, '0'))
  const mins = useTransform(minutes, (m) => String(wall(m) % 60).padStart(2, '0'))
  const meridiem = useTransform(minutes, (m): string => (wall(m) >= 720 ? 'PM' : 'AM'))
  const day = useTransform(minutes, (m): string => (m >= 360 ? 'Wednesday' : 'Tuesday'))

  return (
    <div className="flex flex-col items-center">
      <p className="flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.24em] text-ember-300/90">
        <span className="size-1.5 animate-pulse rounded-full bg-ember-400" />
        The night shift · <motion.span>{day}</motion.span>
      </p>
      <p className="mt-3 flex items-baseline font-mono font-medium leading-none tracking-[-0.06em] tabular-nums" aria-label="Simulated time">
        <motion.span className="text-gradient text-[64px] sm:text-[88px] lg:text-[104px]">{hours}</motion.span>
        <span className="text-gradient animate-blink px-1 text-[64px] [animation-duration:2s] sm:text-[88px] lg:text-[104px]">:</span>
        <motion.span className="text-gradient text-[64px] sm:text-[88px] lg:text-[104px]">{mins}</motion.span>
        <motion.span className="ml-3 text-[18px] tracking-normal text-ember-300 sm:text-[22px]">{meridiem}</motion.span>
      </p>
    </div>
  )
}
