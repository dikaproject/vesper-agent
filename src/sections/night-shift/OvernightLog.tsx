import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { EVENTS, type EventKind } from './events'

const BADGE: Record<EventKind, { label: string; cls: string }> = {
  info: { label: 'update', cls: 'bg-white/[0.06] text-sand-300' },
  pr: { label: 'PR opened', cls: 'bg-ember-500/12 text-ember-200' },
  merge: { label: 'merged', cls: 'bg-ember-500/15 text-ember-200 ring-1 ring-inset ring-ember-400/25' },
  fix: { label: 'fixed', cls: 'bg-mint-400/12 text-mint-300' },
  incident: { label: 'auto-resolved', cls: 'bg-coral-400/12 text-coral-400' },
}

/** Newest-first feed of what the crew did overnight. */
export function OvernightLog({ count, max = 5, className }: { count: number; max?: number; className?: string }) {
  const items = EVENTS.slice(0, count).reverse().slice(0, max)

  return (
    <div className={cn('glass-solid flex flex-col overflow-hidden rounded-3xl p-4', className)}>
      <div className="flex items-center justify-between px-1">
        <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sand-500">Overnight log</p>
        <p className="font-mono text-[10.5px] tabular-nums text-sand-500">
          {count}/{EVENTS.length}
        </p>
      </div>
      <ul className="relative mt-3 flex flex-col gap-2">
        {count === 0 && (
          <li className="flex items-center gap-2.5 rounded-2xl border border-dashed border-white/10 px-3 py-3 text-[12.5px] text-sand-500">
            <span className="size-1.5 animate-pulse rounded-full bg-sand-500" />
            Waiting for the team to log off…
          </li>
        )}
        <AnimatePresence initial={false} mode="popLayout">
          {items.map((event, i) => {
            const Icon = event.icon
            const badge = BADGE[event.kind]
            return (
              <motion.li
                key={event.time}
                layout
                initial={{ opacity: 0, y: -16, scale: 0.97 }}
                animate={{ opacity: 1 - i * 0.14, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                transition={{ duration: 0.5, ease: EASE_OUT }}
                className={cn(
                  'flex items-start gap-3 rounded-2xl border px-3 py-2.5',
                  i === 0 ? 'border-ember-400/25 bg-ember-500/[0.06]' : 'border-white/[0.06] bg-white/[0.02]',
                )}
              >
                <span className="mt-0.5 grid size-8 shrink-0 place-items-center rounded-xl bg-white/[0.05] text-ember-200 ring-1 ring-inset ring-white/[0.06]">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span className="font-mono text-[10.5px] text-sand-500">{event.time}</span>
                    <span className="text-[11.5px] font-medium text-sand-200">{event.agent}</span>
                    <span className={cn('ml-auto rounded-full px-2 py-px font-mono text-[9.5px]', badge.cls)}>{badge.label}</span>
                  </span>
                  <span className="mt-0.5 block truncate text-[12.5px] text-sand-100">{event.text}</span>
                </span>
              </motion.li>
            )
          })}
        </AnimatePresence>
      </ul>
    </div>
  )
}
