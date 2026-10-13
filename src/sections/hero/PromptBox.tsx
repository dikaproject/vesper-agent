import { useLenis } from 'lenis/react'
import { ArrowRight, Check, SquareTerminal } from 'lucide-react'
import { useState, type FormEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { GlowFrame } from '@/components/ui/GlowFrame'
import { useTypewriterCycle } from '@/hooks/useTypewriter'

const PROMPTS = [
  'Add usage-based billing with Stripe and an invoices page',
  'Migrate our REST endpoints to tRPC with end-to-end types',
  'Fix the flaky checkout e2e tests and lift coverage to 90%',
  'Build a realtime collaborative editor with live presence',
] as const

/** Hero prompt input with a typewriter placeholder and a glowing border. */
export function PromptBox() {
  const [value, setValue] = useState('')
  const [focused, setFocused] = useState(false)
  const [sent, setSent] = useState(false)
  const placeholder = useTypewriterCycle(PROMPTS, !focused && value.length === 0)
  const lenis = useLenis()

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setSent(true)
    window.setTimeout(() => setSent(false), 2600)
    const target = document.getElementById('platform')
    if (!target) return
    if (lenis) lenis.scrollTo(target, { offset: -40, duration: 1.6 })
    else target.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <form onSubmit={onSubmit} className="group/prompt relative mx-auto w-full max-w-[620px]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-x-10 -inset-y-6 bg-[radial-gradient(50%_60%_at_50%_50%,rgba(255,108,44,0.2),transparent_72%)] opacity-70 transition-opacity duration-500 group-focus-within/prompt:opacity-100"
      />
      <GlowFrame
        speed={7}
        className="rounded-full shadow-[0_18px_50px_-20px_rgba(0,0,0,0.9)]"
        innerClassName="flex items-center gap-3 bg-[linear-gradient(180deg,#1d1916,#110f0e)] p-1.5 pl-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
      >
        <SquareTerminal aria-hidden="true" className="size-4.5 shrink-0 text-ember-300" />
        <label htmlFor="hero-prompt" className="sr-only">
          Describe what you want to build
        </label>
        <div className="relative min-w-0 flex-1 text-left">
          <input
            id="hero-prompt"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            autoComplete="off"
            spellCheck={false}
            placeholder={focused ? 'Describe what you want to build…' : ''}
            className="h-10 w-full bg-transparent text-[14px] text-sand-50 outline-none placeholder:text-sand-500"
          />
          {!focused && value.length === 0 && (
            <span
              aria-hidden="true"
              className="pointer-events-none absolute inset-0 flex items-center overflow-hidden whitespace-nowrap text-[14px] text-sand-400"
            >
              <span className="truncate">{placeholder}</span>
              <span className="ml-0.5 inline-block h-4 w-[1.5px] shrink-0 animate-blink bg-ember-300" />
            </span>
          )}
        </div>
        <Button type="submit" shimmer className="shrink-0 px-4 sm:px-5">
          {sent ? <Check aria-hidden="true" className="size-4" /> : null}
          <span className="hidden sm:inline">{sent ? 'Crew deployed' : 'Deploy crew'}</span>
          <span className="sm:hidden">{sent ? 'Sent' : 'Deploy'}</span>
          {!sent && <ArrowRight aria-hidden="true" className="size-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />}
        </Button>
      </GlowFrame>
    </form>
  )
}
