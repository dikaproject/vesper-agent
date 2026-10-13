import { ArrowRight, LockKeyhole, Mail, Moon, Sparkles, Sunset, UserRound } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/utils'
import { PLAN_CHIP, briefingProgress, isEmail, passwordScore, type PlanParam } from './auth'
import { DemoNote, FaceHeader, OrDivider, SocialRow, Spinner, SwitchPrompt, VIA_LABEL, useAuthFlow, useFocusOnActivate } from './AuthBits'
import { BootLog } from './BootLog'
import { Field } from './Field'
import type { FaceProps } from './LoginFace'
import { PasswordMeter } from './PasswordMeter'

interface RegisterFaceProps extends FaceProps {
  plan: PlanParam | null
  onProgress: (agents: number) => void
}

function PlanBadge({ plan }: { plan: PlanParam | null }) {
  const Icon = plan === 'dusk' ? Sunset : plan === 'night' ? Moon : Sparkles
  const chip = plan ? PLAN_CHIP[plan] : { label: 'Free to start', note: '50 agent-hours' }
  return (
    <div className="flex shrink-0 items-center gap-2 rounded-2xl bg-ember-500/[0.08] py-1.5 pl-1.5 pr-3 ring-1 ring-inset ring-ember-400/25">
      <span className="grid size-7 place-items-center rounded-xl bg-ember-500/15 text-ember-200">
        <Icon aria-hidden="true" className="size-3.5" />
      </span>
      <span className="leading-tight">
        <span className="block text-[12px] font-medium text-sand-100">{chip.label}</span>
        <span className="block font-mono text-[9.5px] text-ember-200/80">{chip.note}</span>
      </span>
    </div>
  )
}

const STEPS = ['Connect GitHub, GitLab or Bitbucket', 'Write the first brief. One sentence is enough', 'Approve the plan, then log off for the night']

function NextSteps() {
  return (
    <ol className="flex flex-col gap-2">
      {STEPS.map((step, i) => (
        <li
          key={step}
          className={cn(
            'flex items-center gap-3 rounded-xl border px-3 py-2.5 text-[12.5px]',
            i === 0 ? 'border-ember-400/30 bg-ember-500/[0.07] text-sand-50' : 'border-white/[0.06] bg-white/[0.02] text-sand-400',
          )}
        >
          <span
            className={cn(
              'grid size-5 shrink-0 place-items-center rounded-full font-mono text-[10px]',
              i === 0 ? 'bg-ember-500 text-ink-950' : 'bg-white/[0.06] text-sand-400',
            )}
          >
            {i + 1}
          </span>
          {step}
        </li>
      ))}
    </ol>
  )
}

const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'there'
const slug = (name: string) => firstName(name).toLowerCase().replace(/[^a-z0-9]/g, '') || 'my'

export function RegisterFace({ active, email, onEmail, onSwitch, onSuccess, onReset, plan, onProgress }: RegisterFaceProps) {
  const headingRef = useRef<HTMLHeadingElement>(null)
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState({ name: false, email: false, password: false })
  const [submitted, setSubmitted] = useState(false)
  const [shake, setShake] = useState(0)
  const flow = useAuthFlow(onSuccess)
  useFocusOnActivate(active, headingRef)

  const progress = briefingProgress(name, email, password)
  useEffect(() => onProgress(progress), [progress, onProgress])

  const score = passwordScore(password)
  const errors = {
    name: !name.trim() ? 'Tell us what to call you' : name.trim().length < 2 ? 'At least 2 characters' : null,
    email: !email.trim() ? 'Enter your work email' : !isEmail(email) ? 'That email looks incomplete' : null,
    password: !password
      ? 'Choose a password'
      : password.length < 8
        ? 'Use at least 8 characters'
        : score < 2
          ? 'Mix in a number, a symbol or a capital'
          : null,
  }
  const visible = (key: keyof typeof errors) => (touched[key] || submitted ? errors[key] : null)
  const blur = (key: keyof typeof errors) => () => setTouched((t) => ({ ...t, [key]: true }))

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (flow.busy) return
    setSubmitted(true)
    const firstInvalid = (['name', 'email', 'password'] as const).find((key) => errors[key])
    if (firstInvalid) {
      setShake((n) => n + 1)
      document.getElementById(`register-${firstInvalid}`)?.focus()
      return
    }
    flow.start('email')
  }

  const startOver = () => {
    flow.reset()
    setName('')
    setPassword('')
    setSubmitted(false)
    setTouched({ name: false, email: false, password: false })
    onReset()
  }

  const done = flow.status === 'done'
  const viaSocial = flow.via !== 'email'

  return (
    <div className="relative flex h-full flex-col">
      <div inert={done} className={cn('flex h-full flex-col transition-[opacity,transform] duration-500', done && 'scale-[0.98] opacity-0')}>
        <FaceHeader stack headingRef={headingRef} title="Create your account" subtitle="No credit card. Cancel anytime." aside={<PlanBadge plan={plan} />} />
        <SocialRow verb="Sign up" busyVia={flow.status === 'loading' ? flow.via : null} disabled={flow.busy} onPick={flow.start} />
        <OrDivider />
        <form noValidate onSubmit={submit} className="flex flex-col gap-4">
          <Field
            id="register-name"
            label="Full name"
            icon={UserRound}
            autoComplete="name"
            placeholder="Ava Chen"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={blur('name')}
            error={visible('name')}
            shake={shake}
            disabled={flow.busy}
          />
          <Field
            id="register-email"
            label="Work email"
            icon={Mail}
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ava@company.com"
            value={email}
            onChange={(e) => onEmail(e.target.value)}
            onBlur={blur('email')}
            error={visible('email')}
            shake={shake}
            disabled={flow.busy}
          />
          <Field
            id="register-password"
            label="Password"
            icon={LockKeyhole}
            secret
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={blur('password')}
            error={visible('password')}
            shake={shake}
            disabled={flow.busy}
            aria-describedby="register-password-meter"
          >
            <PasswordMeter id="register-password-meter" value={password} />
          </Field>
          <Button type="submit" shimmer disabled={flow.busy} className="mt-1 h-12 w-full">
            {flow.status === 'loading' && flow.via === 'email' ? (
              <>
                <Spinner className="size-3.5" /> Assembling your crew…
              </>
            ) : (
              <>
                Create account <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
              </>
            )}
          </Button>
          <p className="text-center text-[11.5px] leading-relaxed text-sand-500">
            By creating an account you agree to the <span className="text-sand-300 underline decoration-white/20 underline-offset-2">Terms</span> and{' '}
            <span className="text-sand-300 underline decoration-white/20 underline-offset-2">Privacy Policy</span>.
          </p>
        </form>
        <div className="mt-auto pt-6">
          <SwitchPrompt text="Already have an account?" action="Sign in" onClick={onSwitch} />
          <DemoNote />
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div key="boot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0">
            <BootLog
              title="Crew assembled"
              subtitle={viaSocial ? `Signed up with ${VIA_LABEL[flow.via]}` : `Welcome aboard, ${firstName(name)}`}
              lines={[
                { text: `Workspace created · ${viaSocial ? 'my' : slug(name)}-crew` },
                { text: plan === 'night' ? '14-day Night Shift trial started' : '50 free agent-hours added' },
                { text: 'Sandbox booted in 380 ms · toolchain cached' },
                { text: 'Connect a repository to send the first brief', next: true },
              ]}
              primary={{ label: 'Watch a live run', href: '/#platform' }}
              secondary={{ label: 'Start over', onClick: startOver }}
              extra={{ title: 'Next up', content: <NextSteps /> }}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
