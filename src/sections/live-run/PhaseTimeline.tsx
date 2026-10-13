import { AGENTS } from '@/data/agents'
import { cn } from '@/lib/utils'
import { PHASES } from './phases'

interface PhaseTimelineProps {
  phase: number
  t: number
  onSelect: (index: number) => void
}

/** Six clickable phase tabs with a live progress hairline. */
export function PhaseTimeline({ phase, t, onSelect }: PhaseTimelineProps) {
  return (
    <div role="tablist" aria-label="Live run phases" className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {PHASES.map((p, i) => {
        const agent = AGENTS[i]
        const Icon = agent?.icon
        const active = i === phase
        const done = i < phase
        const progress = active ? Math.min(1, t / p.duration) : done ? 1 : 0
        return (
          <button
            key={p.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(i)}
            className={cn(
              'group relative flex flex-col gap-2.5 overflow-hidden rounded-2xl border p-3 text-left transition-[border-color,background-color] duration-300',
              active ? 'border-ember-400/40 bg-ember-500/[0.07]' : 'border-white/[0.07] bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.035]',
            )}
          >
            <span className="flex items-center justify-between">
              <span
                className={cn(
                  'grid size-7 place-items-center rounded-lg transition-colors duration-300',
                  active ? 'bg-ember-500/20 text-ember-200' : done ? 'bg-white/[0.05] text-ember-300/80' : 'bg-white/[0.05] text-sand-400',
                )}
              >
                {Icon && <Icon className="size-3.5" />}
              </span>
              <span className="font-mono text-[10px] text-sand-500">0{i + 1}</span>
            </span>
            <span className="flex flex-col">
              <span className={cn('text-[13px] font-medium tracking-[-0.01em]', active ? 'text-sand-50' : 'text-sand-300')}>{p.title}</span>
              <span className="font-mono text-[10.5px] text-sand-500">{p.agent}</span>
            </span>
            <span className="h-[3px] overflow-hidden rounded-full bg-white/[0.06]">
              <span className="block h-full origin-left rounded-full bg-linear-to-r from-ember-600 to-ember-300" style={{ transform: `scaleX(${progress})` }} />
            </span>
          </button>
        )
      })}
    </div>
  )
}
