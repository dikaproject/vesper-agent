import { ArrowRight, GitPullRequest, LockKeyhole, Mail, ShieldCheck } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { isEmail } from './auth'
import { Checkbox, DemoNote, FaceHeader, OrDivider, PasskeyButton, SocialRow, Spinner, SwitchPrompt, VIA_LABEL, useAuthFlow, useFocusOnActivate } from './AuthBits'
import { BootLog } from './BootLog'
import { Field } from './Field'

export interface FaceProps {
  active: boolean
  email: string
  onEmail: (value: string) => void
  onSwitch: () => void
  onSuccess: () => void
  onReset: () => void
}

function CrewOnline() {
  return (
    <div className="flex shrink-0 flex-col items-end gap-1.5" aria-label="6 agents online">
      <div className="flex -space-x-2" aria-hidden="true">
        {AGENTS.slice(0, 4).map((agent) => {
          const Icon = agent.icon
          return (
            <span key={agent.id} className="grid size-7 place-items-center rounded-full bg-ink-800 text-ember-200 ring-2 ring-ink-850">
              <Icon className="size-3.5" />
            </span>
          )
        })}
        <span className="grid size-7 place-items-center rounded-full bg-ember-500/15 font-mono text-[10px] text-ember-200 ring-2 ring-ink-850">+2</span>
      </div>
      <span className="flex items-center gap-1.5 font-mono text-[10px] text-mint-300">
        <span className="size-1.5 rounded-full bg-mint-400" />
        online
      </span>
    </div>
  )
}

const QUEUE = [
  { id: '#1432', title: 'feat(billing): usage-based invoices', add: 842, del: 120 },
  { id: '#1433', title: 'fix(checkout): flaky Safari e2e', add: 36, del: 58 },
  { id: '#1434', title: 'chore(deps): stripe 17 → 18', add: 4, del: 4 },
]

function ReviewQueue() {
  return (
    <ul className="divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.02]">
      {QUEUE.map((pr) => (
        <li key={pr.id} className="flex items-center gap-3 px-3.5 py-2.5">
          <GitPullRequest aria-hidden="true" className="size-3.5 shrink-0 text-mint-400" />
          <span className="shrink-0 font-mono text-[10.5px] text-sand-500">{pr.id}</span>
          <span className="min-w-0 flex-1 truncate text-[12.5px] text-sand-100">{pr.title}</span>
          <span className="shrink-0 font-mono text-[10.5px]">
            <span className="text-mint-300">+{pr.add}</span> <span className="text-coral-400">−{pr.del}</span>
          </span>
        </li>
      ))}
    </ul>
  )
}

export function LoginFace({ active, email, onEmail, onSwitch, onSuccess, onReset }: FaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
  const [touched, setTouched] = useState({ email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [shake, setShake] = useState(0)
  const [notice, setNotice] = useState<string | null>(null)
  const flow = useAuthFlow(onSuccess)
  useFocusOnActivate(active, headingRef)

  const errors = {
    email: !email.trim() ? 'Enter your email' : !isEmail(email) ? 'That email looks incomplete' : null,
    password: !password ? 'Enter your password' : password.length < 8 ? 'Passwords are at least 8 characters' : null,
  }
  const visible = (key: keyof typeof errors) => (touched[key] || submitted ? errors[key] : null)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (flow.busy) return
    setSubmitted(true)
    setNotice(null)
    if (errors.email || errors.password) {
      setShake((n) => n + 1)
      document.getElementById(errors.email ? 'login-email' : 'login-password')?.focus()
      return
    }
    flow.start('email')
  }

  const forgot = () => {
    if (!isEmail(email)) {
      setTouched((t) => ({ ...t, email: true }))
      setShake((n) => n + 1)
      document.getElementById('login-email')?.focus()
      return
    }
    setNotice(`Reset link sent to ${email.trim()}`)
  }

  const signOut = () => {
    flow.reset()
    setPassword('')
    setSubmitted(false)
    setTouched({ email: false, password: false })
    onReset()
  }

  const done = flow.status === 'done'
  const name = email.trim() || 'you@company.com'

  return (
    <div className="relative flex h-full flex-col">
      <div inert={done} className={cn('flex h-full flex-col transition-[opacity,transform] duration-500', done && 'scale-[0.98] opacity-0')}>
        <FaceHeader headingRef={headingRef} title="Sign in to Vesper" subtitle="Good to see you again." aside={<CrewOnline />} />
        <SocialRow verb="Sign in" busyVia={flow.status === 'loading' ? flow.via : null} disabled={flow.busy} onPick={flow.start} />
        <OrDivider />
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <Field
            id="login-email"
            label="Email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, email: true }))}
            error={visible('email')}
            shake={shake}
            disabled={flow.busy}
          />
          <Field
            id="login-password"
            label="Password"
            icon={LockKeyhole}
            secret
            autoComplete="current-password"
            placeholder="••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() => setTouched((t) => ({ ...t, password: true }))}
            error={visible('password')}
            shake={shake}
            disabled={flow.busy}
            aside={
              <button type="button" onClick={forgot} className="rounded text-[12px] text-ember-300 transition-colors hover:text-ember-200">
                Forgot?
              </button>
            }
          />
          <Checkbox checked={remember} onChange={setRemember} disabled={flow.busy}>
            Keep me signed in for 30 days
          </Checkbox>
          <Button type="submit" shimmer disabled={flow.busy} className="mt-1 h-12 w-full">
            {flow.status === 'loading' && flow.via === 'email' ? (
              <>
                <Spinner className="size-3.5" /> Waking your crew…
              </>
            ) : (
              <>
                Sign in <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </>
            )}
          </Button>
        </form>
        <PasskeyButton busy={flow.status === 'loading' && flow.via === 'passkey'} disabled={flow.busy} onClick={() => flow.start('passkey')} />
        <p className="mt-4 flex items-center justify-center gap-1.5 text-[11.5px] text-sand-500">
          <ShieldCheck aria-hidden="true" className="size-3.5" />
          SSO, SAML and 2FA on every plan
        </p>
        <AnimatePresence>
          {notice && (
            <motion.p
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              role="status"
              className="mt-3 text-center font-mono text-[11px] text-mint-300"
            >
              {notice}
            </motion.p>
          )}
        </AnimatePresence>
        <div className="mt-auto pt-6">
          <SwitchPrompt text="New to Vesper?" action="Create an account" onClick={onSwitch} />
          <DemoNote />
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
            <BootLog
              title="You're in"
              subtitle={`Signed in with ${VIA_LABEL[flow.via]} · ${name}`}
              lines={[
                { text: 'Workspace acme/web-app restored' },
                { text: '6 agents online · 0 incidents overnight' },
                { text: 'Night run finished at 6:58 AM · 11 commits' },
                { text: '3 pull requests are waiting for your review', next: true },
              ]}
              primary={{ label: 'Review last night', href: '/#night-shift' }}
              secondary={{ label: 'Sign out', onClick: signOut }}
              extra={{ title: 'Waiting for your review', content: <ReviewQueue /> }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
