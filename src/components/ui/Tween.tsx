import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { EASE_OUT } from '@/lib/motion'

interface TweenProps {
  value: number
  decimals?: number
  prefix?: string
  suffix?: string
  duration?: number
  className?: string
}

/**
 * Tweens from the previous value to the new one (no animation on mount).
 * Text is written straight to the DOM by a motion value — no re-renders.
 */
export function Tween({ value, decimals = 0, prefix = '', suffix = '', duration = 0.9, className }: TweenProps) {
  const mv = useMotionValue(value)
  const text = useTransform(
    mv,
    (v) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}${suffix}`,
  )
  useEffect(() => {
    const controls = animate(mv, value, { duration, ease: EASE_OUT })
    return () => controls.stop()
  }, [mv, value, duration])
  return <motion.span className={className ?? 'tabular-nums'}>{text}</motion.span>
}
