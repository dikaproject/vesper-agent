import type { Transition, Variants } from 'motion/react'

/** Signature easing used across the site (expo-out). */
export const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]
export const EASE_IN_OUT: [number, number, number, number] = [0.65, 0, 0.35, 1]

export const springSoft: Transition = { type: 'spring', stiffness: 140, damping: 22, mass: 0.6 }

export const fadeUp: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  show: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.9, ease: EASE_OUT },
  },
}

export const staggerContainer = (stagger = 0.08, delayChildren = 0): Variants => ({
  hidden: {},
  show: { transition: { staggerChildren: stagger, delayChildren } },
})

/** Default viewport config for whileInView reveals. */
export const inViewOnce = { once: true, margin: '0px 0px -12% 0px' } as const
