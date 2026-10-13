import { motion, useScroll } from 'motion/react'

/** Hairline ember progress bar pinned to the bottom of the header. */
export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  return (
    <motion.div
      aria-hidden="true"
      style={{ scaleX: scrollYProgress, transformOrigin: '0% 50%' }}
      className="absolute inset-x-0 bottom-[-1px] h-px bg-linear-to-r from-ember-700 via-ember-400 to-ember-100"
    />
  )
}
