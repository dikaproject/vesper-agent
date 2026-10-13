import { CircleAlert, Eye, EyeOff, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type ComponentPropsWithoutRef, type KeyboardEvent, type ReactNode } from 'react'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

const SHAKE: Keyframe[] = [
  { transform: 'translateX(0)' },
  { transform: 'translateX(-7px)' },
  { transform: 'translateX(6px)' },
  { transform: 'translateX(-4px)' },
  { transform: 'translateX(2px)' },
  { transform: 'translateX(0)' },
]

interface FieldProps extends Omit<ComponentPropsWithoutRef<'input'>, 'size' | 'id'> {
  id: string
  label: string
  icon: LucideIcon
  error?: string | null
  /** Rendered on the right of the label row (e.g. "Forgot?"). */
  aside?: ReactNode
  /** Increment to replay the error shake (no remount, so focus is kept). */
  shake?: number
  /** Password field with a show / hide toggle and a Caps Lock hint. */
  secret?: boolean
  children?: ReactNode
}

export function Field({ id, label, icon: Icon, error, aside, shake = 0, secret = false, className, children, ...input }: FieldProps) {
  const boxRef = useRef<HTMLDivElement>(null)
  const [shown, setShown] = useState(false)
  const [caps, setCaps] = useState(false)
  const errorId = `${id}-error`

  useEffect(() => {
    if (!shake || !error || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    boxRef.current?.animate(SHAKE, { duration: 420, easing: 'cubic-bezier(0.22, 1, 0.36, 1)' })
  }, [shake]) // replay only when the counter changes, not when the message does

  const onKey = (event: KeyboardEvent<HTMLInputElement>) => {
    if (secret) setCaps(event.getModifierState('CapsLock'))
  }

  return (
    <div className={className}>
      <div className="mb-1.5 flex h-5 items-center justify-between">
        <label htmlFor={id} className="text-[12.5px] font-medium text-sand-300">
          {label}
        </label>
        {aside}
      </div>
      <div ref={boxRef} className="group/field relative">
        <Icon
          aria-hidden="true"
          className={cn(
            'pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 transition-colors duration-300',
            error ? 'text-coral-400' : 'text-sand-500 group-focus-within/field:text-ember-300',
          )}
        />
        <input
          id={id}
          {...input}
          type={secret ? (shown ? 'text' : 'password') : input.type}
          aria-invalid={error ? true : undefined}
          aria-describedby={[error ? errorId : null, input['aria-describedby']].filter(Boolean).join(' ') || undefined}
          onKeyDown={onKey}
          onKeyUp={onKey}
          className={cn(
            'h-11 w-full rounded-xl bg-white/[0.035] pl-10 text-[14px] text-sand-50 outline-none ring-1 ring-inset transition-[box-shadow,background-color] duration-300 placeholder:text-sand-600 disabled:opacity-60',
            'focus:bg-white/[0.055] focus:shadow-[0_0_0_4px_rgba(255,108,44,0.12)]',
            secret ? 'pr-11' : 'pr-3.5',
            error ? 'ring-coral-400/55 focus:ring-coral-400/70' : 'ring-white/10 hover:ring-white/15 focus:ring-ember-400/60',
          )}
        />
        {secret && (
          <button
            type="button"
            onClick={() => setShown((s) => !s)}
            aria-label={shown ? 'Hide password' : 'Show password'}
            aria-pressed={shown}
            className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-sand-500 transition-colors hover:bg-white/[0.06] hover:text-sand-100"
          >
            {shown ? <EyeOff aria-hidden="true" className="size-4" /> : <Eye aria-hidden="true" className="size-4" />}
          </button>
        )}
      </div>
      <AnimatePresence initial={false}>
        {error ? (
          <motion.p
            key="error"
            id={errorId}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.3, ease: EASE_OUT }}
            className="mt-1.5 flex items-center gap-1.5 text-[12px] text-coral-400"
          >
            <CircleAlert aria-hidden="true" className="size-3.5 shrink-0" />
            {error}
          </motion.p>
        ) : secret && caps ? (
          <motion.p key="caps" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 text-[12px] text-ember-200">
            Caps Lock is on
          </motion.p>
        ) : null}
      </AnimatePresence>
      {children}
    </div>
  )
}
