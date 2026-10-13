import { Check } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useRef, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'

export interface BootLine {
  text: ReactNode
  /** "next" lines are the call to action, drawn in ember with an arrow. */
  next?: boolean
}

interface BootLogProps {
  title: string
  subtitle: string
  lines: BootLine[]
  primary: { label: string; href: string }
  secondary: { label: string; onClick: () => void }
  /** What happens next (PRs to review, onboarding steps). */
  extra?: { title: string; content: ReactNode }
}

const LINE_START = 0.25
const LINE_STEP = 0.34

/** Success state: session log lines arrive one by one, then the crew checks in. */
export function BootLog({ title, subtitle, lines, primary, secondary, extra }: BootLogProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const rollAt = LINE_START + lines.length * LINE_STEP + 0.05

  useEffect(() => {
    const id = window.setTimeout(() => headingRef.current?.focus({ preventScroll: true }), 60)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <div role="status" className="flex h-full flex-col">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: EASE_OUT }}
        className="flex items-center gap-3.5"
      >
        <span className="relative grid size-12 shrink-0 place-items-center rounded-2xl bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30">
          <span aria-hidden="true" className="absolute inset-0 rounded-2xl ring-1 ring-mint-400/60 animate-[ping-slow_1.6s_cubic-bezier(0.22,1,0.36,1)_2_forwards]" />
          <Check aria-hidden="true" className="size-5" strokeWidth={2.6} />
        </span>
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-medium tracking-[-0.03em] text-sand-50 outline-none">
            {title}
          </h2>
          <p className="truncate text-[13px] text-sand-400">{subtitle}</p>
        </div>
      </motion.div>

      <div className="mt-6 rounded-2xl border border-white/[0.07] bg-ink-950/60 p-4 font-mono text-[12px] leading-relaxed">
        <p className="mb-2.5 flex items-center gap-2 text-[10.5px] text-sand-600">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-mint-400" />
          vesper · session
        </p>
        <ul className="flex flex-col gap-2">
          {lines.map((line, i) => (
            <motion.li
              key={i}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: LINE_START + i * LINE_STEP, duration: 0.45, ease: EASE_OUT }}
              className="flex gap-2.5"
            >
              {line.next ? (
                <span aria-hidden="true" className="w-3.5 shrink-0 text-ember-300">
                  →
                </span>
              ) : (
                <Check aria-hidden="true" className="mt-[3px] size-3.5 shrink-0 text-mint-400" strokeWidth={3} />
              )}
              <span className={line.next ? 'text-ember-100' : 'text-sand-200'}>{line.text}</span>
            </motion.li>
          ))}
        </ul>
      </div>

      <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-sand-500">Crew online</p>
      <ul className="mt-2.5 grid grid-cols-6 gap-1.5 sm:gap-2">
        {AGENTS.map((agent, i) => {
          const Icon = agent.icon
          return (
            <motion.li
              key={agent.id}
              initial={{ opacity: 0, scale: 0.6, y: 8 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ delay: rollAt + i * 0.07, type: 'spring', stiffness: 340, damping: 19 }}
              className="flex min-w-0 flex-col items-center gap-1.5"
            >
              <span className="grid size-10 place-items-center rounded-xl bg-ember-500/10 text-ember-200 shadow-[0_0_22px_-8px_rgba(255,108,44,0.9)] ring-1 ring-inset ring-ember-400/30">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="max-w-full truncate font-mono text-[9.5px] text-sand-400">{agent.codename}</span>
            </motion.li>
          )
        })}
      </ul>

      {extra && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: rollAt + 0.5, duration: 0.6, ease: EASE_OUT }}
          className="mt-6"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-sand-500">{extra.title}</p>
          <div className="mt-2.5">{extra.content}</div>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: rollAt + (extra ? 0.85 : 0.55), duration: 0.6, ease: EASE_OUT }}
        className="mt-auto flex gap-2.5 pt-6"
      >
        <Button href={primary.href} arrow className="flex-1">
          {primary.label}
        </Button>
        <Button variant="secondary" onClick={secondary.onClick}>
          {secondary.label}
        </Button>
      </motion.div>
    </div>
  )
}
