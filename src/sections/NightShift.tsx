import { ChevronsDown } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useTransform } from 'motion/react'
import { useRef, useState } from 'react'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useMediaQuery } from '@/hooks/useDom'
import { EASE_OUT } from '@/lib/motion'
import { EVENTS, REPORT_AT, actAt, countAt, totalsFor, type Act } from './night-shift/events'
import { MorningReport } from './night-shift/MorningReport'
import { NightClock } from './night-shift/NightClock'
import { NightStats } from './night-shift/NightStats'
import { OvernightLog } from './night-shift/OvernightLog'
import { PrStack } from './night-shift/PrStack'
import { Sky } from './night-shift/Sky'

const CAPTIONS: Record<Act, string> = {
  dusk: 'Your team logs off. The crew picks up the backlog.',
  night: 'Agents plan, build, test and ship — and stop to ask when it matters.',
  dawn: 'By standup, the work is merged and the summary is waiting.',
}

function Caption({ act }: { act: Act }) {
  return (
    <div className="relative mt-4 min-h-12 w-full sm:min-h-7">
      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={act}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: EASE_OUT }}
          className="text-balance text-[15px] text-sand-300 sm:text-[17px]"
        >
          {CAPTIONS[act]}
        </motion.p>
      </AnimatePresence>
    </div>
  )
}

export function NightShift() {
  return (
    <section id="night-shift" className="relative">
      <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-20 sm:px-8 sm:pt-28">
        <SectionHeading
          eyebrow="While you sleep"
          title={'Log off at six.\n*Wake up to merged PRs.*'}
          description="One night with Vesper, hour by hour. Keep scrolling: the crew works through the backlog, fixes what breaks and keeps production healthy — then leaves a summary for standup."
        />
      </div>
      <NightTrack />
    </section>
  )
}

/**
 * 320vh scroll track with a pinned stage. Visuals follow scroll through motion
 * values; React state only changes when an event threshold is crossed.
 */
function NightTrack() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [count, setCount] = useState(0)
  const [act, setAct] = useState<Act>('dusk')
  const [report, setReport] = useState(false)
  const tall = useMediaQuery('(min-height: 860px)', true)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setCount(countAt(v))
    setAct(actAt(v))
    setReport(v >= REPORT_AT)
  })

  const merges = EVENTS.slice(0, count).filter((e) => e.kind === 'merge').length
  const totals = totalsFor(count)
  const panels = useTransform(scrollYProgress, [REPORT_AT - 0.03, REPORT_AT + 0.02], [1, 0.22])
  const hint = useTransform(scrollYProgress, [0, 0.05], [1, 0])

  return (
    <div ref={trackRef} className="relative h-[320vh]">
      <div className="sticky top-0 h-svh overflow-hidden">
        <Sky progress={scrollYProgress} merges={merges} />

        <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col px-5 pb-[150px] pt-24 sm:px-8 lg:pb-[160px]">
          <div className="flex flex-col items-center text-center">
            <NightClock progress={scrollYProgress} />
            <Caption act={act} />
            <NightStats totals={totals} className="mt-4" />
          </div>
          <motion.div style={{ opacity: panels }} className="mt-7 grid min-h-0 flex-1 grid-cols-1 gap-6 lg:grid-cols-12">
            <OvernightLog count={count} max={tall ? 4 : 3} className="self-start lg:col-span-4" />
            <div className="hidden lg:col-span-4 lg:block" />
            <PrStack count={count} className="hidden self-start lg:col-span-4 lg:flex" />
          </motion.div>
        </div>

        <motion.p
          style={{ opacity: hint }}
          className="absolute inset-x-0 bottom-6 z-10 flex items-center justify-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-sand-400"
        >
          <ChevronsDown className="size-3.5 animate-bounce" />
          Scroll to fast-forward the night
        </motion.p>

        <div className="pointer-events-none absolute inset-0 z-20 grid place-items-center px-5">
          <MorningReport show={report} />
        </div>
      </div>
    </div>
  )
}
