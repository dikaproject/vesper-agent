import { ArrowUp, ChevronRight, Mail, SquareTerminal } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useEffect, useRef, useState, type FormEvent } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { Button } from '@/components/ui/Button'
import { useTypewriterCycle } from '@/hooks/useTypewriter'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { TrafficLights } from '@/sections/live-run/ui/ScreenWindow'
import { Exchange } from './Exchange'
import { FAQS, faqById, matchQuestion, type Faq } from './faqs'

interface Asked {
  key: number
  faq: Faq
  text: string
}

const PLACEHOLDERS = [
  'Does it support monorepos?',
  'Can we self-host on AWS?',
  'What does an agent-hour cost?',
  'What if a deploy breaks prod?',
] as const

function QuestionList({ activeId, onAsk }: { activeId: string | null; onAsk: (id: string) => void }) {
  return (
    <ul className="flex flex-col gap-1">
      {FAQS.map((faq, i) => {
        const active = faq.id === activeId
        return (
          <li key={faq.id} className="relative">
            {active && (
              <motion.span
                layoutId="faq-active"
                transition={{ type: 'spring', bounce: 0.18, duration: 0.55 }}
                className="absolute inset-0 rounded-2xl border border-ember-400/30 bg-ember-500/[0.07] shadow-[0_0_40px_-18px_rgba(255,108,44,0.8)]"
              />
            )}
            <button
              type="button"
              onClick={() => onAsk(faq.id)}
              aria-pressed={active}
              aria-controls="faq-console"
              className="group relative flex w-full items-center gap-4 rounded-2xl px-4 py-3.5 text-left"
            >
              <span className={cn('font-mono text-[11px] transition-colors', active ? 'text-ember-300' : 'text-sand-600')}>0{i + 1}</span>
              <span className={cn('flex-1 text-[15px] tracking-[-0.01em] transition-colors', active ? 'text-sand-50' : 'text-sand-300 group-hover:text-sand-100')}>
                {faq.question}
              </span>
              <ChevronRight
                aria-hidden="true"
                className={cn('size-4 transition-[transform,color]', active ? 'translate-x-0.5 text-ember-300' : 'text-sand-600 group-hover:translate-x-0.5')}
              />
            </button>
          </li>
        )
      })}
    </ul>
  )
}

function AskInput({ onSubmit }: { onSubmit: (text: string) => void }) {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const placeholder = useTypewriterCycle(PLACEHOLDERS, !focused && value.length === 0)

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const text = value.trim()
    if (!text) return
    onSubmit(text)
    setValue('')
  }

  return (
    <form onSubmit={submit} className="border-t border-white/[0.06] bg-ink-900/60 p-3">
      <div className="flex items-center gap-3 rounded-2xl bg-white/[0.04] py-1.5 pl-4 pr-1.5 ring-1 ring-inset ring-white/[0.08] transition-shadow focus-within:ring-ember-400/45 focus-within:shadow-[0_0_30px_-12px_rgba(255,108,44,0.8)]">
        <SquareTerminal aria-hidden="true" className="size-4 shrink-0 text-ember-300" />
        <label htmlFor="faq-ask" className="sr-only">
          Ask the crew a question
        </label>
        <div className="relative min-w-0 flex-1">
          <input
            id="faq-ask"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            maxLength={140}
            placeholder={focused ? 'Ask anything about Vesper…' : ''}
            className="h-9 w-full bg-transparent text-[14px] text-sand-50 outline-none placeholder:text-sand-500"
          />
          {!focused && value.length === 0 && (
            <span aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center text-[14px] text-sand-500">
              {placeholder}
              <span className="ml-0.5 inline-block h-4 w-[1.5px] animate-blink bg-ember-300" />
            </span>
          )}
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          aria-label="Send question"
          className="grid size-9 shrink-0 place-items-center rounded-xl bg-[linear-gradient(180deg,#ffc9a6,#ff8b4d_46%,#ee5d1c)] text-ink-950 shadow-[0_6px_20px_-6px_rgba(255,108,44,0.8)] transition-[opacity,transform] active:scale-95 disabled:opacity-35"
        >
          <ArrowUp className="size-4" strokeWidth={2.5} />
        </button>
      </div>
      <p className="mt-2 px-1 font-mono text-[10px] text-sand-600">Answers come from the Vesper docs · matched on your device, nothing is sent</p>
    </form>
  )
}

function EmptyState() {
  return (
    <div className="grid h-full place-items-center text-center">
      <div className="flex flex-col items-center gap-3">
        <span className="grid size-12 place-items-center rounded-2xl bg-ember-500/12 ring-1 ring-inset ring-ember-400/30">
          <LogoMark size={26} />
        </span>
        <p className="text-[15px] text-sand-200">The crew is listening.</p>
        <p className="text-[13px] text-sand-500">Pick a question or type your own below.</p>
      </div>
    </div>
  )
}

/** Desktop FAQ: questions on the left, a live agent console on the right. */
export function AskTheCrew() {
  const consoleRef = useRef<HTMLDivElement>(null)
  const inView = useInView(consoleRef, { once: true, margin: '0px 0px -25% 0px' })
  const [asked, setAsked] = useState<Asked | null>(null)
  const keyRef = useRef(0)

  const ask = (faq: Faq, text = faq.question) => {
    keyRef.current += 1
    setAsked({ key: keyRef.current, faq, text })
  }
  const askById = (id: string) => {
    const faq = faqById(id)
    if (faq) ask(faq)
  }

  // the first question asks itself when the console scrolls into view
  useEffect(() => {
    const first = FAQS[0]
    if (!inView || !first) return
    const id = window.setTimeout(() => setAsked((current) => current ?? { key: 0, faq: first, text: first.question }), 450)
    return () => window.clearTimeout(id)
  }, [inView])

  return (
    <div className="grid gap-10 lg:grid-cols-[minmax(0,430px)_minmax(0,1fr)]">
      <div className="flex flex-col">
        <QuestionList activeId={asked && asked.faq.id !== 'fallback' ? asked.faq.id : null} onAsk={askById} />
        <div className="mt-6 flex items-center justify-between gap-4 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
          <div>
            <p className="text-[14px] text-sand-100">Still curious?</p>
            <p className="text-[12.5px] text-sand-500">A human replies within a day.</p>
          </div>
          <Button href="mailto:hello@vesper.dev" variant="secondary" size="sm">
            <Mail aria-hidden="true" className="size-3.5" />
            Email us
          </Button>
        </div>
      </div>

      <div ref={consoleRef} className="glass-solid flex h-[600px] flex-col overflow-hidden rounded-[28px]">
        <div className="flex h-12 shrink-0 items-center gap-4 border-b border-white/[0.06] bg-ink-800/80 px-4">
          <TrafficLights />
          <p className="flex items-center gap-2 font-mono text-[12px] text-sand-300">
            <LogoMark size={13} glow={false} />
            vesper ask
          </p>
          <span className="ml-auto flex items-center gap-2 rounded-full bg-mint-400/10 px-2.5 py-1 font-mono text-[10.5px] text-mint-300 ring-1 ring-inset ring-mint-400/25">
            <span className="relative flex size-1.5">
              <span className="absolute inset-0 animate-ping rounded-full bg-mint-400" />
              <span className="relative size-1.5 rounded-full bg-mint-400" />
            </span>
            6 agents online
          </span>
        </div>

        <div id="faq-console" aria-live="polite" className="relative min-h-0 flex-1 overflow-hidden px-6 py-6 sm:px-8">
          <AnimatePresence mode="wait" initial={false}>
            {asked ? (
              <motion.div
                key={asked.key}
                exit={{ opacity: 0, y: -14, transition: { duration: 0.25 } }}
                transition={{ ease: EASE_OUT }}
              >
                <Exchange faq={asked.faq} asked={asked.text} onAsk={askById} />
              </motion.div>
            ) : (
              <motion.div key="empty" exit={{ opacity: 0 }} className="h-full">
                <EmptyState />
              </motion.div>
            )}
          </AnimatePresence>
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-linear-to-b from-transparent to-[#110f0e]" />
        </div>

        <AskInput onSubmit={(text) => ask(matchQuestion(text), text)} />
      </div>
    </div>
  )
}
