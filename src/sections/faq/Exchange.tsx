import { ArrowUpRight, FileText, ThumbsDown, ThumbsUp } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useEffect, useState } from 'react'
import { useTypedChars } from '@/components/code/TypedCode'
import { GradientAvatar } from '@/components/ui/Avatar'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { Spinner } from '@/sections/live-run/ui/bits'
import { faqById, type Faq } from './faqs'
import { Inline } from './RichText'

type Phase = 'thinking' | 'streaming' | 'done'
const THINK_MS = 1100
const CHARS_PER_SECOND = 190

const rise = (delay = 0) => ({
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.45, delay, ease: EASE_OUT },
})

function Thinking({ sources }: { sources: string[] }) {
  return (
    <div className="mt-3 flex flex-col gap-2">
      {sources.map((source, i) => (
        <motion.span
          key={source}
          {...rise(0.1 + i * 0.3)}
          className="flex w-fit items-center gap-2 rounded-lg border border-white/[0.07] bg-white/[0.03] px-2.5 py-1.5 font-mono text-[11px] text-sand-300"
        >
          <Spinner className="size-3" />
          reading {source}
        </motion.span>
      ))}
    </div>
  )
}

function StreamedAnswer({ text, streaming }: { text: string; streaming: boolean }) {
  const paragraphs = text.split('\n\n')
  return (
    <div aria-hidden="true" className="mt-2 flex flex-col gap-3 text-[15px] leading-relaxed text-sand-200">
      {paragraphs.map((para, i) => (
        <p key={i}>
          <Inline text={para} />
          {streaming && i === paragraphs.length - 1 && (
            <span className="ml-0.5 inline-block h-[1.05em] w-[2px] translate-y-[0.18em] animate-blink bg-ember-300" />
          )}
        </p>
      ))}
    </div>
  )
}

function AnswerFooter({ faq, onAsk }: { faq: Faq; onAsk: (id: string) => void }) {
  const [vote, setVote] = useState<'up' | 'down' | null>(null)
  const related = faq.related.map(faqById).filter((f): f is Faq => Boolean(f))

  return (
    <motion.div {...rise(0.05)} className="mt-5 flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-600">Sources</span>
        {faq.sources.map((source) => (
          <span key={source} className="flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2 py-1 font-mono text-[10.5px] text-sand-400 ring-1 ring-inset ring-white/[0.06]">
            <FileText aria-hidden="true" className="size-3" />
            {source}
          </span>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-2">
        {related.map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => onAsk(r.id)}
            className="group flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-[12.5px] text-sand-200 transition-colors hover:border-ember-400/40 hover:bg-ember-500/[0.08] hover:text-sand-50"
          >
            {r.question}
            <ArrowUpRight aria-hidden="true" className="size-3.5 text-sand-500 transition-transform group-hover:-translate-y-px group-hover:translate-x-px group-hover:text-ember-300" />
          </button>
        ))}
      </div>
      <div className="flex items-center gap-2 text-[12px] text-sand-500">
        <AnimatePresence mode="wait" initial={false}>
          {vote ? (
            <motion.span key="thanks" {...rise()} className="text-mint-300">
              {vote === 'up' ? 'Glad that helped.' : 'Thanks, we’ll improve this answer.'}
            </motion.span>
          ) : (
            <motion.span key="ask" {...rise()} className="flex items-center gap-2">
              Was this helpful?
              {(['up', 'down'] as const).map((v) => (
                <button
                  key={v}
                  type="button"
                  onClick={() => setVote(v)}
                  aria-label={v === 'up' ? 'Yes, helpful' : 'Not helpful'}
                  className="grid size-7 place-items-center rounded-full text-sand-400 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/[0.06] hover:text-sand-100"
                >
                  {v === 'up' ? <ThumbsUp className="size-3.5" /> : <ThumbsDown className="size-3.5" />}
                </button>
              ))}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

interface ExchangeProps {
  faq: Faq
  /** What the user asked (the canonical question or their own words). */
  asked: string
  onAsk: (id: string) => void
}

/** One question → the right agent reads its sources, then streams the answer. */
export function Exchange({ faq, asked, onAsk }: ExchangeProps) {
  const reduce = useReducedMotion()
  const [phase, setPhase] = useState<Phase>(reduce ? 'done' : 'thinking')
  const typed = useTypedChars(faq.answer.length, phase === 'streaming', CHARS_PER_SECOND)
  const agent = AGENTS.find((a) => a.id === faq.agent) ?? AGENTS[0]

  useEffect(() => {
    if (phase !== 'thinking') return
    const id = window.setTimeout(() => setPhase('streaming'), THINK_MS)
    return () => window.clearTimeout(id)
  }, [phase])

  useEffect(() => {
    if (phase === 'streaming' && typed >= faq.answer.length) setPhase('done')
  }, [phase, typed, faq.answer.length])

  if (!agent) return null
  const Icon = agent.icon
  const text = phase === 'done' ? faq.answer : faq.answer.slice(0, typed)

  return (
    <div className="flex flex-col gap-6">
      <motion.div {...rise()} className="ml-auto flex max-w-[82%] items-end gap-2.5">
        <p className="rounded-2xl rounded-br-md bg-white/[0.07] px-4 py-2.5 text-[14.5px] text-sand-50 ring-1 ring-inset ring-white/10">{asked}</p>
        <GradientAvatar name="Ava Chen" size={28} />
      </motion.div>

      <motion.div {...rise(0.2)} className="flex gap-3.5">
        <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-ember-500/12 text-ember-200 ring-1 ring-inset ring-ember-400/30">
          <Icon aria-hidden="true" className="size-4" />
        </span>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="flex items-center gap-2 text-[12.5px]">
            <span className="font-medium text-sand-100">{agent.codename}</span>
            <span className="text-sand-500">· {agent.name} agent</span>
            {phase !== 'done' && (
              <span className={cn('ml-1 font-mono text-[10.5px]', phase === 'thinking' ? 'text-ember-300' : 'text-sand-500')}>
                {phase === 'thinking' ? 'reading sources…' : 'typing…'}
              </span>
            )}
          </p>
          {phase === 'thinking' ? <Thinking sources={faq.sources} /> : <StreamedAnswer text={text} streaming={phase === 'streaming'} />}
          <p className="sr-only">{faq.answer.replace(/`/g, '')}</p>
          {phase === 'done' && <AnswerFooter faq={faq} onAsk={onAsk} />}
        </div>
      </motion.div>
    </div>
  )
}
