import { ReactLenis } from 'lenis/react'
import { useReducedMotion } from 'motion/react'
import type { ReactNode } from 'react'

/** Global Lenis smooth scrolling; anchor links glide with a header offset. */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  return (
    <ReactLenis
      root
      options={{
        lerp: reduce ? 1 : 0.085,
        smoothWheel: !reduce,
        anchors: { offset: -84 },
        autoRaf: true,
      }}
    >
      {children}
    </ReactLenis>
  )
}
