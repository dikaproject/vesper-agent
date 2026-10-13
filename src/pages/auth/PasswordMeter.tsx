import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import { SCORE_LABEL, passwordChecks, passwordScore } from './auth'

const TONE = ['bg-white/10', 'bg-coral-400', 'bg-ember-400', 'bg-ember-300', 'bg-mint-400'] as const
const TEXT = ['text-sand-500', 'text-coral-400', 'text-ember-300', 'text-ember-200', 'text-mint-300'] as const

/** Four segments that fill with scaleX (compositor only) + a live checklist. */
export function PasswordMeter({ value, id }: { value: string; id: string }) {
  const score = passwordScore(value)
  const checks = passwordChecks(value)

  return (
    <div id={id} className="mt-2.5">
      <div className="flex items-center gap-3">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {[0, 1, 2, 3].map((i) => (
            <span key={i} className="relative h-1 flex-1 overflow-hidden rounded-full bg-white/[0.07]">
              <span
                className={cn(
                  'absolute inset-0 origin-left rounded-full transition-[transform,background-color] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]',
                  TONE[score],
                )}
                style={{ transform: `scaleX(${i < score ? 1 : 0})`, transitionDelay: `${i * 60}ms` }}
              />
            </span>
          ))}
        </div>
        <span className={cn('w-16 text-right font-mono text-[10.5px] transition-colors duration-300', TEXT[score])} aria-live="polite">
          {value ? SCORE_LABEL[score] : ''}
        </span>
      </div>
      <ul className="mt-2 grid grid-cols-2 gap-1.5 sm:flex sm:flex-wrap" aria-label="Password requirements">
        {checks.map((check) => (
          <li
            key={check.id}
            className={cn(
              'flex items-center gap-1 rounded-full px-2 py-0.5 font-mono text-[10.5px] ring-1 ring-inset transition-colors duration-300',
              check.ok ? 'bg-mint-400/10 text-mint-300 ring-mint-400/25' : 'bg-white/[0.03] text-sand-500 ring-white/[0.07]',
            )}
          >
            <Check aria-hidden="true" strokeWidth={3} className={cn('size-2.5 transition-transform duration-300', check.ok ? 'scale-100' : 'scale-0')} />
            {check.label}
            <span className="sr-only">{check.ok ? '(met)' : '(not met)'}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
