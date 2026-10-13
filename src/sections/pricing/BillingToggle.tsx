import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import type { Billing } from './plans'

const OPTIONS: { id: Billing; label: string }[] = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'yearly', label: 'Yearly' },
]

/** Segmented control with a spring pill that slides between options. */
export function BillingToggle({ value, onChange }: { value: Billing; onChange: (value: Billing) => void }) {
  return (
    <div role="group" aria-label="Billing period" className="glass inline-flex items-center rounded-full p-1">
      {OPTIONS.map((option) => {
        const active = value === option.id
        return (
          <button
            key={option.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.id)}
            className="relative h-9 rounded-full px-4 text-[13px] font-medium transition-colors"
          >
            {active && (
              <motion.span
                layoutId="billing-pill"
                transition={{ type: 'spring', bounce: 0.22, duration: 0.5 }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#ffc9a6_0%,#ff8b4d_46%,#ee5d1c_100%)] shadow-[0_8px_24px_-8px_rgba(255,108,44,0.8),inset_0_1px_0_rgba(255,255,255,0.5)]"
              />
            )}
            <span className={cn('relative z-10 flex items-center gap-2', active ? 'text-ink-950' : 'text-sand-300 hover:text-sand-50')}>
              {option.label}
              {option.id === 'yearly' && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-px font-mono text-[10px] transition-colors',
                    active ? 'bg-ink-950/15 text-ink-950' : 'bg-mint-400/15 text-mint-300',
                  )}
                >
                  −20%
                </span>
              )}
            </span>
          </button>
        )
      })}
    </div>
  )
}
