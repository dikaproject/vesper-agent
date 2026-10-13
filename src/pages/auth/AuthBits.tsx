import { ArrowRight, Check, Fingerprint } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react'
import { siGithub, siGoogle } from 'simple-icons'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { cn } from '@/lib/utils'
import { DEMO_LATENCY } from './auth'

export type Via = 'email' | 'github' | 'google' | 'passkey'
export const VIA_LABEL: Record<Via, string> = { email: 'email', github: 'GitHub', google: 'Google', passkey: 'a passkey' }

/** idle → loading → done, with the fake network delay and timer cleanup. */
export function useAuthFlow(onSuccess: () => void) {
  const [status, setStatus] = useState<'idle' | 'loading' | 'done'>('idle')
  const [via, setVia] = useState<Via>('email')
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const start = (method: Via) => {
    setVia(method)
    setStatus('loading')
    timer.current = window.setTimeout(() => {
      setStatus('done')
      onSuccess()
    }, DEMO_LATENCY)
  }
  const reset = () => {
    window.clearTimeout(timer.current)
    setStatus('idle')
  }
  return { status, via, busy: status !== 'idle', start, reset }
}

/** Move focus to `ref` when a face becomes the visible one (not on first mount). */
export function useFocusOnActivate(active: boolean, ref: RefObject<HTMLElement | null>) {
  const previous = useRef(active)
  useEffect(() => {
    if (active && !previous.current) {
      const id = window.setTimeout(() => ref.current?.focus({ preventScroll: true }), 360)
      previous.current = active
      return () => window.clearTimeout(id)
    }
    previous.current = active
  }, [active, ref])
}

export function Spinner({ className }: { className?: string }) {
  return <span aria-hidden="true" className={cn('inline-block size-4 animate-spin rounded-full border-2 border-current border-r-transparent', className)} />
}

const PROVIDERS = [
  { id: 'github', label: 'GitHub', icon: siGithub },
  { id: 'google', label: 'Google', icon: siGoogle },
] as const

interface SocialRowProps {
  busyVia: Via | null
  disabled: boolean
  onPick: (via: Via) => void
  verb: string
}

export function SocialRow({ busyVia, disabled, onPick, verb }: SocialRowProps) {
  return (
    <div className="grid grid-cols-2 gap-2.5">
      {PROVIDERS.map((p) => (
        <button
          key={p.id}
          type="button"
          disabled={disabled}
          onClick={() => onPick(p.id)}
          aria-label={`${verb} with ${p.label}`}
          className="flex h-11 items-center justify-center gap-2.5 rounded-xl bg-white/[0.04] text-[13.5px] font-medium text-sand-100 ring-1 ring-inset ring-white/10 transition-[background-color,box-shadow,transform] duration-300 hover:bg-white/[0.07] hover:ring-white/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {busyVia === p.id ? <Spinner className="size-3.5" /> : <BrandIcon icon={p.icon} className="size-4" />}
          {p.label}
        </button>
      ))}
    </div>
  )
}

export function OrDivider({ label = 'or with email' }: { label?: string }) {
  return (
    <div className="my-5 flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.2em] text-sand-600">
      <span aria-hidden="true" className="h-px flex-1 bg-linear-to-r from-transparent to-white/10" />
      {label}
      <span aria-hidden="true" className="h-px flex-1 bg-linear-to-l from-transparent to-white/10" />
    </div>
  )
}

interface FaceHeaderProps {
  title: string
  subtitle: string
  aside?: ReactNode
  headingRef: RefObject<HTMLHeadingElement | null>
  /** Put the aside above the title (wide asides that would squeeze the heading). */
  stack?: boolean
}

export function FaceHeader({ title, subtitle, aside, headingRef, stack = false }: FaceHeaderProps) {
  return (
    <div className={cn('mb-6 flex gap-4', stack ? 'flex-col-reverse items-start gap-3.5' : 'items-start justify-between')}>
      <div className="min-w-0">
        <h2 ref={headingRef} tabIndex={-1} className="text-[22px] font-medium tracking-[-0.03em] text-sand-50 outline-none">
          {title}
        </h2>
        <p className="mt-1 text-[13.5px] text-sand-400">{subtitle}</p>
      </div>
      {aside}
    </div>
  )
}

export function SwitchPrompt({ text, action, onClick }: { text: string; action: string; onClick: () => void }) {
  return (
    <p className="text-center text-[13px] text-sand-400">
      {text}{' '}
      <button type="button" onClick={onClick} className="group/switch inline-flex items-center gap-1 rounded font-medium text-ember-300 transition-colors hover:text-ember-200">
        {action}
        <ArrowRight aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/switch:translate-x-0.5" />
      </button>
    </p>
  )
}

export function DemoNote() {
  return (
    <p className="mt-3 flex items-center justify-center gap-2 font-mono text-[10.5px] text-sand-600">
      <span aria-hidden="true" className="size-1 rounded-full bg-mint-400/70" />
      Demo · nothing you type leaves this browser
    </p>
  )
}

export function Checkbox({ checked, onChange, children, disabled }: { checked: boolean; onChange: (v: boolean) => void; children: ReactNode; disabled?: boolean }) {
  return (
    <label className="flex w-fit cursor-pointer select-none items-center gap-2.5 text-[13px] text-sand-300">
      <span className="relative grid size-4 place-items-center">
        <input
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer size-4 cursor-pointer appearance-none rounded-[5px] bg-white/[0.04] ring-1 ring-inset ring-white/15 transition-colors checked:bg-ember-500 checked:ring-ember-300/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember-400"
        />
        <Check aria-hidden="true" strokeWidth={3.4} className="pointer-events-none absolute size-2.5 scale-50 text-ink-950 opacity-0 transition-[opacity,transform] duration-200 peer-checked:scale-100 peer-checked:opacity-100" />
      </span>
      {children}
    </label>
  )
}

export function PasskeyButton({ busy, disabled, onClick }: { busy: boolean; disabled: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="group/pk mt-3 flex h-11 w-full items-center justify-center gap-2.5 rounded-full text-[13.5px] text-sand-300 ring-1 ring-inset ring-white/[0.07] transition-[background-color,color,box-shadow] duration-300 hover:bg-white/[0.04] hover:text-sand-50 hover:ring-white/15 disabled:cursor-not-allowed disabled:opacity-50"
    >
      {busy ? <Spinner className="size-3.5 text-ember-300" /> : <Fingerprint aria-hidden="true" className="size-4 text-ember-300 transition-transform duration-500 group-hover/pk:scale-110" />}
      {busy ? 'Waiting for your device…' : 'Sign in with a passkey'}
    </button>
  )
}
