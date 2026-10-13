import { Pause, Play } from 'lucide-react'
import { AnimatePresence, motion, useInView, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { Starfield } from '@/components/effects/Starfield'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'
import { Monitor } from './live-run/Monitor'
import { PhaseTimeline } from './live-run/PhaseTimeline'
import { PHASES } from './live-run/phases'
import { usePlayhead } from './live-run/usePlayhead'

export function LiveRun() {
  return (
    <section id="platform" className="relative isolate overflow-hidden py-24 sm:py-32">
      <LiveRunBackdrop />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Live run"
          title={'Watch one prompt\n*become a release.*'}
          description="A real-time replay of Vesper shipping usage-based billing for Acme — from the first web search to the live page. The agents do the work; you approve the plan and the release."
        />
      </div>
      <Player />
    </section>
  )
}

/** Same language as the hero: stars, a masked grid and one warm glow. */
function LiveRunBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.45} twinkles={10} shootingStars={false} seed={19} />
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_45%_at_50%_58%,#000,transparent)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(900px,90vw)] -translate-x-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-1/2 top-[58%] h-[760px] w-[1300px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.13),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-ink-900" />
    </div>
  )
}

const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches

function Player() {
  const wrapRef = useRef<HTMLDivElement>(null)
  const inView = useInView(wrapRef, { margin: '-12% 0px -12% 0px' })
  const [paused, setPaused] = useState(prefersReducedMotion)
  const { phase, run, t, jump } = usePlayhead(inView && !paused)

  // monitor leans back and settles as it scrolls in (transform only)
  const { scrollYProgress } = useScroll({ target: wrapRef, offset: ['start end', 'start 0.3'] })
  const rotateX = useTransform(scrollYProgress, [0, 1], [16, 0])
  const scale = useTransform(scrollYProgress, [0, 1], [0.92, 1])
  const y = useTransform(scrollYProgress, [0, 1], [70, 0])

  const current = PHASES[phase] ?? PHASES[0]
  const Icon = AGENTS[phase]?.icon

  return (
    <div ref={wrapRef} className="relative mx-auto mt-14 max-w-[1240px] px-4 sm:mt-16 sm:px-8">
      <div style={{ perspective: 1800 }}>
        <motion.div style={{ rotateX, scale, y, transformOrigin: '50% 100%' }}>
          <Monitor phase={phase} run={run} t={t} />
        </motion.div>
      </div>

      <div className="mx-auto mt-4 max-w-[1180px] sm:mt-2">
        <div className="mb-4 flex items-center gap-4">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ember-500/12 text-ember-200 ring-1 ring-inset ring-ember-400/30">
            {Icon && <Icon className="size-4" />}
          </span>
          <div aria-live="polite" className="relative min-h-[44px] min-w-0 flex-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={phase}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.35, ease: EASE_OUT }}
              >
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-ember-300">
                  {String(phase + 1).padStart(2, '0')} · {current?.title} · {current?.agent}
                </p>
                <p className="mt-1 text-pretty text-[14px] leading-snug text-sand-300 sm:text-[15px]">{current?.summary}</p>
              </motion.div>
            </AnimatePresence>
          </div>
          <button
            type="button"
            onClick={() => setPaused((p) => !p)}
            aria-label={paused ? 'Play the live run' : 'Pause the live run'}
            className="glass grid size-10 shrink-0 place-items-center rounded-full text-sand-100 transition-colors hover:text-ember-200"
          >
            {paused ? <Play className="size-4" /> : <Pause className="size-4" />}
          </button>
        </div>
        <PhaseTimeline
          phase={phase}
          t={t}
          onSelect={(index) => {
            jump(index)
            setPaused(false)
          }}
        />
      </div>
    </div>
  )
}
