import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

/** Mono uppercase section label flanked by ember hairlines. */
export function Eyebrow({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 font-mono text-[11px] uppercase tracking-[0.24em] text-ember-300/90',
        className,
      )}
    >
      <span aria-hidden="true" className="h-px w-8 bg-linear-to-r from-transparent to-ember-400/80" />
      {children}
      <span aria-hidden="true" className="h-px w-8 bg-linear-to-l from-transparent to-ember-400/80" />
    </span>
  )
}

/** Small mono tag used inside cards and mockups. */
export function Tag({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[11px] text-sand-300',
        className,
      )}
    >
      {children}
    </span>
  )
}
