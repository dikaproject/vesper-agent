import { Sunrise } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoIcon } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { EASE_OUT } from '@/lib/motion'
import { totalsFor, EVENTS } from './events'

const TOTALS = totalsFor(EVENTS.length)

/** Digest card that greets the team at 7:00 AM. */
export function MorningReport({ show }: { show: boolean }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.7, ease: EASE_OUT }}
          className="glass-solid pointer-events-auto w-[min(560px,calc(100vw-2.5rem))] rounded-3xl p-5 shadow-[0_40px_100px_-30px_rgba(0,0,0,0.95),0_0_80px_-30px_rgba(255,140,80,0.55)] sm:p-6"
        >
          <div className="flex items-center gap-3">
            <LogoIcon size={42} />
            <div className="min-w-0">
              <p className="font-mono text-[11px] text-sand-500">Vesper · #eng-standup · 7:00 AM</p>
              <p className="flex items-center gap-2 text-[18px] font-medium tracking-[-0.02em] text-sand-50">
                Good morning, Ava
                <Sunrise aria-hidden="true" className="size-4.5 text-ember-300" />
              </p>
            </div>
          </div>
          <p className="mt-4 text-pretty text-[14px] leading-relaxed text-sand-300">
            The crew merged {TOTALS.prs} pull requests overnight, handled {TOTALS.incidents} incidents without paging anyone, and
            left a summary for standup. Nothing needs your attention before 10:00.
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {[
              [TOTALS.prs.toString(), 'PRs merged'],
              [TOTALS.tests.toLocaleString('en-US'), 'tests passed'],
              [TOTALS.incidents.toString(), 'incidents'],
              ['0', 'pages'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-2xl border border-white/[0.07] bg-white/[0.03] p-3">
                <p className="font-mono text-[20px] font-medium text-sand-50">{value}</p>
                <p className="text-[11px] text-sand-500">{label}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button href="#pricing" size="sm" arrow>
              Review the night
            </Button>
            <Button href="#under-the-hood" size="sm" variant="secondary">
              How guardrails work
            </Button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
