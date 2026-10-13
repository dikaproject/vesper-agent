import { Check } from 'lucide-react'
import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export type StepState = 'pending' | 'running' | 'done'

/** Derive a step state from the scene clock. */
export const stepState = (t: number, start: number, end: number): StepState =>
  t < start ? 'pending' : t < end ? 'running' : 'done'

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-block size-3.5 shrink-0 animate-spin-slow rounded-full border-2 border-ember-400/25 border-t-ember-300 [animation-duration:0.85s]',
        className,
      )}
    />
  )
}

export function StatusIcon({ state, className }: { state: StepState | 'failed'; className?: string }) {
  if (state === 'running') return <Spinner className={className} />
  if (state === 'failed')
    return <span className={cn('grid size-4 shrink-0 place-items-center rounded-full bg-coral-400/15 text-[10px] font-bold text-coral-400', className)}>×</span>
  if (state === 'done')
    return (
      <span className={cn('grid size-4 shrink-0 place-items-center rounded-full bg-mint-400/15 text-mint-300', className)}>
        <Check className="size-2.5" strokeWidth={3.2} />
      </span>
    )
  return <span className={cn('size-4 shrink-0 rounded-full border border-white/15', className)} />
}

export function StepRow({ label, state, meta }: { label: ReactNode; state: StepState; meta?: ReactNode }) {
  return (
    <div className="flex items-center gap-2.5 text-[12px]">
      <StatusIcon state={state} />
      <span className={cn('min-w-0 truncate', state === 'pending' ? 'text-sand-600' : state === 'running' ? 'text-sand-50' : 'text-sand-300')}>
        {label}
      </span>
      {meta && <span className="ml-auto shrink-0 font-mono text-[10.5px] text-sand-500">{meta}</span>}
    </div>
  )
}

/** Braille spinner frame for terminal output, driven by the scene clock. */
const FRAMES = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
export const brailleFrame = (t: number) => FRAMES[Math.floor(t / 80) % FRAMES.length]
