import { Check } from 'lucide-react'
import { animate, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect, type CSSProperties } from 'react'
import type { Agent } from '@/data/agents'
import { cn } from '@/lib/utils'
import { STAGE_MS, type StageState } from './flow'

interface AgentPillProps {
  agent: Agent
  state: StageState
  className?: string
  style?: CSSProperties
}

/** Status pill for one agent — pending, running (ember, progress) or done. */
export function AgentPill({ agent, state, className, style }: AgentPillProps) {
  const Icon = agent.icon
  const active = state === 'active'
  const done = state === 'done'

  return (
    <div
      style={style}
      className={cn(
        'relative flex h-[42px] items-center gap-2.5 overflow-hidden rounded-full border pl-1.5 pr-4 transition-[background-color,border-color,box-shadow,opacity] duration-500',
        active &&
        'border-ember-300/60 bg-[linear-gradient(90deg,rgba(226,78,16,0.96),rgba(255,148,92,0.9))] shadow-[0_0_0_1px_rgba(255,170,120,0.25),0_10px_40px_-6px_rgba(255,108,44,0.8),inset_0_1px_0_rgba(255,255,255,0.42)]',
        done && 'border-white/10 bg-ink-750/90 shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        state === 'pending' && 'border-white/[0.07] bg-ink-800/70 opacity-55',
        className,
      )}
    >
      {active && (
        <motion.span
          aria-hidden="true"
          className="absolute inset-y-0 left-0 w-full origin-left bg-linear-to-r from-white/5 to-white/25"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: STAGE_MS / 1000, ease: 'linear' }}
        />
      )}

      <span
        className={cn(
          'relative grid size-[30px] shrink-0 place-items-center rounded-full transition-colors duration-500',
          active && 'bg-white/25 text-white',
          done && 'bg-ember-500/15 text-ember-300 ring-1 ring-inset ring-ember-400/25',
          state === 'pending' && 'bg-white/[0.05] text-sand-400',
        )}
      >
        {done ? <Check className="size-3.5" strokeWidth={2.6} /> : <Icon className="size-3.5" />}
        {active && (
          <span className="absolute inset-0 animate-spin-slow rounded-full border border-white/60 border-t-transparent [animation-duration:1.1s]" />
        )}
      </span>

      <span className={cn('relative text-[13px] font-medium tracking-[-0.01em]', active ? 'text-white' : 'text-sand-100')}>
        {agent.name}
      </span>

      <span
        className={cn(
          'relative ml-auto truncate pl-2 font-mono text-[10.5px]',
          active ? 'text-white/90' : done ? 'text-sand-400' : 'text-sand-500',
        )}
      >
        {active ? <StageProgress label={agent.live} /> : done ? agent.done : 'queued'}
      </span>
    </div>
  )
}

function StageProgress({ label }: { label: string }) {
  const value = useMotionValue(0)
  const pct = useTransform(value, (v) => `${Math.round(v)}%`)

  useEffect(() => {
    const controls = animate(value, 100, { duration: (STAGE_MS / 1000) * 0.96, ease: 'linear' })
    return () => controls.stop()
  }, [value])

  return (
    <span className="inline-flex items-center gap-2">
      <span className="truncate">{label}</span>
      <motion.span className="tabular-nums">{pct}</motion.span>
    </span>
  )
}
