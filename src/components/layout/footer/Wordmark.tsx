import { motion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'

const TEXT = 'Vesper'
const type = 'absolute inset-x-0 top-0 text-center font-semibold leading-[0.9] tracking-[-0.075em]'
const rise = {
  initial: { y: '22%', opacity: 0 },
  whileInView: { y: '0%', opacity: 1 },
  viewport: { once: true, margin: '0px 0px -4% 0px' },
  transition: { duration: 1.6, ease: EASE_OUT },
} as const

/*
 * Giant wordmark rising over the planet's horizon. The light sweep only
 * lights the letters, without repainting them: inside a black, screen-blended
 * group, a moving band is multiplied by a white-on-black copy of the word.
 * The band is the only thing that moves (a transform), so the compositor
 * does all the work. The root is isolated on a solid page-coloured fill so
 * the blend is the same no matter what sits behind the footer.
 */
export function Wordmark() {
  return (
    <div aria-hidden="true" className="pointer-events-none relative isolate h-[0.86em] select-none overflow-hidden bg-ink-900 text-[clamp(5.5rem,24vw,23rem)]">
      <div className="absolute bottom-[-0.32em] left-1/2 h-[1.1em] w-[2.6em] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.28),rgba(255,108,44,0.08)_55%,transparent)]" />

      <motion.p
        {...rise}
        className={`${type} bg-[linear-gradient(180deg,rgba(255,242,232,0.2)_0%,rgba(255,196,160,0.13)_48%,rgba(255,120,60,0.34)_82%)] bg-clip-text text-transparent`}
      >
        {TEXT}
      </motion.p>

      <motion.div {...rise} className="absolute inset-0 bg-black mix-blend-screen">
        <span className="wordmark-band" />
        <div className="absolute inset-0 bg-black mix-blend-multiply">
          <p className={`${type} text-white`}>{TEXT}</p>
        </div>
      </motion.div>

      {/* the planet the word is rising over */}
      <div className="absolute left-1/2 top-[0.7em] h-[3em] w-[9em] -translate-x-1/2 rounded-[50%] border-t border-ember-300/45 bg-[linear-gradient(180deg,#130f0d_0%,#0a0908_12%)] shadow-[0_-0.06em_0.3em_-0.08em_rgba(255,108,44,0.55)]" />
      <div className="absolute left-1/2 top-[0.7em] h-px w-[1.1em] -translate-x-1/2 bg-linear-to-r from-transparent via-ember-100/90 to-transparent" />
    </div>
  )
}
