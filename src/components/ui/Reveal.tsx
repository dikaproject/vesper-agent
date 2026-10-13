import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { EASE_OUT, inViewOnce } from '@/lib/motion'

interface RevealProps {
  children: ReactNode
  className?: string
  delay?: number
  y?: number
  blur?: boolean
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean
}

/**
 * Fade + rise reveal used for most blocks on the page.
 * `blur` is opt-in and meant for short text only — animating a blur filter
 * on large containers is expensive.
 */
export function Reveal({ children, className, delay = 0, y = 24, blur = false, immediate = false }: RevealProps) {
  const from = { opacity: 0, y, filter: blur ? 'blur(8px)' : 'blur(0px)' }
  const to = { opacity: 1, y: 0, filter: 'blur(0px)' }
  return (
    <motion.div
      className={className}
      initial={from}
      {...(immediate ? { animate: to } : { whileInView: to, viewport: inViewOnce })}
      transition={{ duration: 0.95, delay, ease: EASE_OUT }}
    >
      {children}
    </motion.div>
  )
}
