import { animate, motion, useInView, useMotionValue, useTransform } from 'motion/react'
import { useEffect, useRef } from 'react'
import { EASE_OUT } from '@/lib/motion'

interface CounterProps {
  to: number
  from?: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}

/** Counts up once when scrolled into view. Screen readers get the final value. */
export function Counter({ to, from = 0, duration = 1.8, decimals = 0, prefix = '', suffix = '', className }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '0px 0px -10% 0px' })
  const value = useMotionValue(from)
  const format = (v: number) =>
    `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`
  const text = useTransform(value, format)

  useEffect(() => {
    if (!inView) return
    const controls = animate(value, to, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [inView, value, to, duration])

  return (
    <span ref={ref} className={className}>
      <span className="sr-only">{format(to)}</span>
      <motion.span aria-hidden="true">{text}</motion.span>
    </span>
  )
}
