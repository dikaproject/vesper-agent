import { Check, Mail } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { EASE_OUT } from '@/lib/motion'
import { cn, isEmail } from '@/lib/utils'

/** Changelog signup. Demo only: the address stays in component state. */
export function Newsletter() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'done'>('idle')

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setState(isEmail(email) ? 'done' : 'error')
  }

  return (
    <form noValidate onSubmit={submit} className="mt-7 max-w-sm">
      <label htmlFor="footer-email" className="text-[13px] font-medium text-sand-200">
        The changelog, once a month
      </label>
      <p className="mt-1 text-[12.5px] text-sand-500">New agents, guardrails and the occasional postmortem. No spam.</p>
      <div className="relative mt-3 h-12">
        <AnimatePresence mode="wait" initial={false}>
          {state === 'done' ? (
            <motion.p
              key="done"
              role="status"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, ease: EASE_OUT }}
              className="flex h-12 items-center gap-2.5 rounded-full bg-mint-400/10 px-4 text-[13px] text-mint-300 ring-1 ring-inset ring-mint-400/25"
            >
              <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              You’re on the list. See you next month.
            </motion.p>
          ) : (
            <motion.div
              key="form"
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className={cn(
                'glass flex h-12 items-center gap-2 rounded-full py-1 pl-4 pr-1 transition-shadow duration-300 focus-within:shadow-[0_0_0_4px_rgba(255,108,44,0.12)]',
                state === 'error' && 'ring-1 ring-coral-400/50',
              )}
            >
              <Mail aria-hidden="true" className="size-4 shrink-0 text-sand-500" />
              <input
                id="footer-email"
                type="email"
                inputMode="email"
                autoComplete="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value)
                  if (state === 'error') setState('idle')
                }}
                aria-invalid={state === 'error' || undefined}
                aria-describedby={state === 'error' ? 'footer-email-error' : undefined}
                className="h-full min-w-0 flex-1 bg-transparent text-[13.5px] text-sand-50 outline-none placeholder:text-sand-600"
              />
              <Button type="submit" size="sm" className="shrink-0">
                Subscribe
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {state === 'error' && (
        <p id="footer-email-error" className="mt-2 text-[12px] text-coral-400">
          That email looks incomplete.
        </p>
      )}
    </form>
  )
}
