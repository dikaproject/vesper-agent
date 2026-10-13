import { ArrowLeft } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Logo } from '@/components/brand/Logo'
import { Starfield } from '@/components/effects/Starfield'
import { Eyebrow } from '@/components/ui/Badge'
import { Link } from '@/components/ui/Link'
import { Reveal } from '@/components/ui/Reveal'
import { RevealText } from '@/components/ui/RevealText'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'
import { getEntry, navigate } from '@/lib/router'
import { cn } from '@/lib/utils'
import { MODE_COPY, parsePlan, type AuthMode } from './auth'
import { FlipCard } from './FlipCard'
import { LoginFace } from './LoginFace'
import { Orrery } from './Orrery'
import { RegisterFace } from './RegisterFace'

export type { AuthMode } from './auth'

function AuthBackdrop({ mode }: { mode: AuthMode }) {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <motion.div className="absolute -inset-x-16 inset-y-0" animate={{ x: mode === 'login' ? 0 : -40 }} transition={{ type: 'spring', stiffness: 36, damping: 15 }}>
        <Starfield density={0.85} twinkles={20} seed={61} />
      </motion.div>
      <div className="bg-grid absolute inset-0 opacity-40 [mask-image:radial-gradient(ellipse_60%_55%_at_50%_42%,#000_20%,transparent_75%)]" />
      <div className="absolute left-[32%] top-[48%] h-[780px] w-[1000px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.12),transparent)]" />
      {/* horizon sits behind the page footer, below every card */}
      <div className="absolute left-1/2 top-[calc(100%-6px)] h-[760px] w-[2400px] -translate-x-1/2">
        <div className="absolute inset-0 rounded-[50%] border-t border-ember-300/30 bg-[radial-gradient(48%_36%_at_50%_0%,rgba(255,108,44,0.16),transparent)] shadow-[0_-40px_110px_-30px_rgba(255,108,44,0.45)]" />
        <div className="absolute left-1/2 top-0 h-px w-[560px] -translate-x-1/2 bg-linear-to-r from-transparent via-ember-100 to-transparent" />
      </div>
    </div>
  )
}

const TABS = [
  { id: 'login', label: 'Sign in' },
  { id: 'register', label: 'Create account' },
] as const

function AuthTabs({ mode, onChange }: { mode: AuthMode; onChange: (mode: AuthMode) => void }) {
  const listRef = useRef<HTMLDivElement>(null)
  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
    event.preventDefault()
    const next: AuthMode = mode === 'login' ? 'register' : 'login'
    onChange(next)
    listRef.current?.querySelector<HTMLButtonElement>(`#auth-tab-${next}`)?.focus()
  }

  return (
    <div ref={listRef} role="tablist" aria-label="Choose how to continue" onKeyDown={onKeyDown} className="glass mx-auto flex w-fit items-center rounded-full p-1">
      {TABS.map((tab) => {
        const active = tab.id === mode
        return (
          <button
            key={tab.id}
            id={`auth-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`auth-panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            className="relative h-9 rounded-full px-5 text-[13px] font-medium"
          >
            {active && (
              <motion.span
                layoutId="auth-tab-pill"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.55 }}
                className="absolute inset-0 rounded-full bg-[linear-gradient(180deg,#ffc9a6_0%,#ff8b4d_46%,#ee5d1c_100%)] shadow-[0_8px_24px_-8px_rgba(255,108,44,0.8),inset_0_1px_0_rgba(255,255,255,0.5)]"
              />
            )}
            <span className={cn('relative z-10 transition-colors', active ? 'text-ink-950' : 'text-sand-300 hover:text-sand-50')}>{tab.label}</span>
          </button>
        )
      })}
    </div>
  )
}

const fade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
  transition: { duration: 0.4, ease: EASE_OUT },
}

function StatusCard({ mode, lit, done, className }: { mode: AuthMode; lit: number; done: boolean; className?: string }) {
  const next = AGENTS[lit]
  return (
    <div className={cn('glass relative w-full max-w-[520px] overflow-hidden rounded-2xl px-5 py-4', className)}>
      <AnimatePresence mode="wait" initial={false}>
        {mode === 'login' ? (
          <motion.div key="login" {...fade}>
            <p className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-sand-500">
              While you were away
              <span className="normal-case tracking-normal text-sand-600">11:40 PM → 6:58 AM</span>
            </p>
            <dl className="mt-3 grid grid-cols-3 gap-3">
              {[
                ['3', 'PRs merged'],
                ['142', 'tests green'],
                ['0', 'incidents'],
              ].map(([value, label]) => (
                <div key={label} className="flex flex-col-reverse">
                  <dt className="text-[11.5px] text-sand-500">{label}</dt>
                  <dd className="font-mono text-[20px] font-medium tracking-[-0.03em] text-sand-50">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        ) : (
          <motion.div key="register" {...fade}>
            <p className="flex items-center justify-between font-mono text-[10.5px] uppercase tracking-[0.18em] text-sand-500">
              Crew briefing
              <span className="normal-case tracking-normal tabular-nums text-ember-200">{lit} / 6 briefed</span>
            </p>
            <div className="mt-3 flex gap-1.5" aria-hidden="true">
              {AGENTS.map((agent, i) => (
                <span key={agent.id} className={cn('h-1.5 flex-1 rounded-full transition-colors duration-500', i < lit ? 'bg-ember-400' : 'bg-white/10')} />
              ))}
            </div>
            <p className="mt-2.5 text-[12.5px] text-sand-400">
              {done
                ? 'All six agents are standing by.'
                : lit === 0
                  ? 'Fill in the form to wake the crew.'
                  : next
                    ? `${next.codename} (${next.name}) is next.`
                    : 'Everyone is briefed. Create the account to launch.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export function AuthPage({ mode }: { mode: AuthMode }) {
  const [entry] = useState(getEntry)
  const [plan] = useState(() => parsePlan(new URLSearchParams(window.location.search).get('plan')))
  const [email, setEmail] = useState('')
  const [progress, setProgress] = useState(0)
  const [pulse, setPulse] = useState(0)
  const [signedIn, setSignedIn] = useState(false)
  const copy = MODE_COPY[mode]
  const intro = entry.portal ? 0.3 : 0.05
  // after the first flip the headline swaps immediately (no intro delay)
  const [initialMode] = useState(mode)
  const swapped = useRef(false)
  if (mode !== initialMode) swapped.current = true
  const textDelay = swapped.current ? 0 : intro

  useEffect(() => {
    document.title = copy.doc
  }, [copy.doc])

  const switchTo = (next: AuthMode) => {
    if (next === mode) return
    void navigate(next === 'login' ? '/login' : `/register${plan ? `?plan=${plan}` : ''}`, { replace: true })
  }
  const succeed = () => {
    setSignedIn(true)
    setPulse((n) => n + 1)
  }
  const reset = () => setSignedIn(false)
  const lit = signedIn || mode === 'login' ? AGENTS.length : progress

  const faceProps = { email, onEmail: setEmail, onSuccess: succeed, onReset: reset }

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-x-clip">
      <AuthBackdrop mode={mode} />

      <header className="relative z-10 mx-auto flex h-[68px] w-full max-w-7xl shrink-0 items-center justify-between px-5 sm:px-8">
        <Link href="/" aria-label="Vesper home" className="rounded-xl">
          <Logo />
        </Link>
        <Link
          href="/"
          className="glass group/back flex items-center gap-2 rounded-full px-3.5 py-2 text-[13px] text-sand-300 transition-colors hover:text-sand-50"
        >
          <ArrowLeft aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/back:-translate-x-0.5" />
          Back to site
        </Link>
      </header>

      <main className="relative mx-auto grid w-full max-w-7xl flex-1 items-center gap-8 px-5 pb-10 pt-2 sm:px-8 lg:grid-cols-[minmax(0,1fr)_440px] lg:gap-14 xl:gap-20">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <Reveal immediate y={10} delay={intro}>
            <Eyebrow>Vesper console</Eyebrow>
          </Reveal>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={mode} exit={{ opacity: 0, y: -10, transition: { duration: 0.16, ease: EASE_OUT } }} className="mt-5">
              <RevealText
                as="h1"
                immediate
                delay={textDelay + 0.05}
                stagger={0.06}
                text={copy.title}
                className="text-balance text-[2.1rem] font-medium leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-[3.3rem]"
              />
              <Reveal immediate blur delay={textDelay + 0.25} y={12} className="mx-auto mt-4 max-w-md text-pretty text-[14.5px] leading-relaxed text-sand-400 sm:text-[15px] lg:mx-0 lg:max-w-lg">
                {copy.description}
              </Reveal>
            </motion.div>
          </AnimatePresence>
          <Orrery className="mt-6 hidden lg:block" lit={lit} pulse={pulse} bank={mode === 'login' ? -4 : 4} />
          <Reveal immediate y={16} delay={intro + 0.45} className="hidden w-full lg:block">
            <StatusCard mode={mode} lit={lit} done={signedIn} />
          </Reveal>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 34, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: intro + 0.1, ease: EASE_OUT }}
          className="mx-auto w-full max-w-[440px]"
        >
          <AuthTabs mode={mode} onChange={switchTo} />
          <div className="mt-5">
            <FlipCard
              flipped={mode === 'register'}
              frontId="auth-panel-login"
              backId="auth-panel-register"
              frontLabel="Sign in"
              backLabel="Create account"
              front={<LoginFace {...faceProps} active={mode === 'login'} onSwitch={() => switchTo('register')} />}
              back={<RegisterFace {...faceProps} active={mode === 'register'} plan={plan} onProgress={setProgress} onSwitch={() => switchTo('login')} />}
            />
          </div>
        </motion.div>
      </main>

      <footer className="relative mx-auto flex w-full max-w-7xl shrink-0 flex-col items-center justify-between gap-2 px-5 pb-6 font-mono text-[10.5px] text-sand-600 sm:flex-row sm:px-8">
        <span>© 2026 Vesper · a portfolio concept by INXORA Studio</span>
        <span className="flex items-center gap-2">
          <span aria-hidden="true" className="size-1.5 rounded-full bg-mint-400" />
          All systems normal
        </span>
      </footer>
    </div>
  )
}
