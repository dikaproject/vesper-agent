import { CircleCheck, GitMerge } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { EVENTS } from './events'

/** Merged pull requests drop onto a deck; older cards recede behind. */
export function PrStack({ count, className }: { count: number; className?: string }) {
  const merged = EVENTS.slice(0, count)
    .filter((e) => e.pr)
    .reverse()
    .slice(0, 4)

  return (
    <div className={cn('flex flex-col', className)}>
      <div className="mb-3 flex items-center justify-between px-1">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sand-500">Merged while you slept</p>
        <GitMerge className="size-3.5 text-ember-300" />
      </div>
      <div className="relative h-[230px]">
        {merged.length === 0 && (
          <div className="absolute inset-x-0 top-0 flex h-[118px] items-center justify-center rounded-3xl border border-dashed border-white/10 text-[12.5px] text-sand-500">
            No merges yet
          </div>
        )}
        <AnimatePresence initial={false}>
          {merged.map((event, i) => {
            const pr = event.pr
            if (!pr) return null
            return (
              <motion.div
                key={pr.number}
                initial={{ opacity: 0, y: -70, rotate: -5, scale: 1.04 }}
                animate={{ opacity: Math.max(0, 1 - i * 0.24), y: i * 26, rotate: 0, scale: 1 - i * 0.045 }}
                exit={{ opacity: 0, y: 120, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 210, damping: 24, mass: 0.9 }}
                style={{ zIndex: 10 - i, transformOrigin: '50% 0%' }}
                className="glass-solid absolute inset-x-0 top-0 rounded-3xl p-4"
              >
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1.5 rounded-full bg-ember-500/15 px-2 py-0.5 text-[10.5px] font-medium text-ember-200 ring-1 ring-inset ring-ember-400/30">
                    <GitMerge className="size-3" />
                    Merged
                  </span>
                  <span className="font-mono text-[11px] text-sand-400">#{pr.number}</span>
                  <span className="ml-auto font-mono text-[10.5px] text-sand-500">{event.time}</span>
                </div>
                <p className="mt-2.5 truncate font-mono text-[12.5px] text-sand-50">{pr.title}</p>
                <div className="mt-2.5 flex items-center gap-3 font-mono text-[10.5px]">
                  <span className="text-mint-300">{pr.add}</span>
                  <span className="text-coral-400">{pr.del}</span>
                  <span className="flex items-center gap-1 text-sand-400">
                    <CircleCheck className="size-3 text-mint-400" />
                    {event.tests ?? 0} checks
                  </span>
                  <span className="ml-auto text-sand-500">by {event.agent}</span>
                </div>
              </motion.div>
            )
          })}
        </AnimatePresence>
      </div>
    </div>
  )
}
