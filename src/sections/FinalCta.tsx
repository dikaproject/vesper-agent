import { Check, Copy } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { LogoIcon } from '@/components/brand/Logo'
import { Starfield } from '@/components/effects/Starfield'
import { Button } from '@/components/ui/Button'
import { Magnetic } from '@/components/ui/Magnetic'
import { Reveal } from '@/components/ui/Reveal'
import { RevealText } from '@/components/ui/RevealText'

const COMMAND = 'npx vesper@latest init'
const TRUST = ['SOC 2 Type II', 'GDPR', '99.9% SLA', 'Your code never trains models']

/** The page's bookend to the hero: same beam, same orbit rings, one clear ask. */
export function FinalCta() {
  return (
    <section id="get-started" aria-labelledby="get-started-title" className="relative isolate overflow-hidden pb-28 pt-28 sm:pb-36 sm:pt-36">
      <CtaBackdrop />
      <div className="relative mx-auto flex max-w-4xl flex-col items-center px-5 text-center sm:px-8">
        <Reveal y={20}>
          <Beacon />
        </Reveal>
        <div id="get-started-title" className="mt-12">
          <RevealText
            text={'Hand off tonight’s backlog.\n*Wake up to shipped code.*'}
            className="text-balance text-[2.3rem] font-medium leading-[1.04] tracking-[-0.045em] sm:text-6xl lg:text-[4.1rem]"
          />
        </div>
        <Reveal blur delay={0.15} className="mt-6 max-w-xl text-pretty text-[15px] leading-relaxed text-sand-400 sm:text-base">
          Connect a repository in about four minutes. The first 50 agent-hours are on us, and nothing merges without your approval.
        </Reveal>
        <Reveal delay={0.25} className="mt-9 flex flex-col items-center gap-3 sm:flex-row">
          <Magnetic strength={0.22}>
            <Button href="/register" size="lg" shimmer arrow>
              Start building free
            </Button>
          </Magnetic>
          <Button href="/login" size="lg" variant="secondary">
            Sign in
          </Button>
        </Reveal>
        <Reveal delay={0.35} y={12} className="mt-8">
          <InstallCommand />
        </Reveal>
        <Reveal delay={0.45} y={8} className="mt-8">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] text-sand-500">
            {TRUST.map((item, i) => (
              <li key={item} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-ember-500/60" />}
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/** The Vesper mark as a lit beacon: glow, a breathing ring and one slow orbit. */
function Beacon() {
  return (
    <div aria-hidden="true" className="relative grid size-[104px] place-items-center">
      <span className="absolute -inset-20 animate-breathe rounded-full bg-[radial-gradient(closest-side,rgba(255,170,120,0.34),rgba(255,108,44,0.1)_50%,transparent)]" />
      <span className="absolute -inset-7 rounded-full border border-white/[0.07]" />
      <span className="absolute -inset-7 animate-spin-slow rounded-full">
        <span className="absolute left-1/2 top-0 size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-200 shadow-[0_0_12px_3px_rgba(255,135,72,0.8)]" />
      </span>
      <span className="absolute inset-0 animate-ping-slow rounded-[30px] border border-ember-300/40 [animation-duration:3.4s]" />
      <LogoIcon size={104} />
    </div>
  )
}

function CtaBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.55} twinkles={14} shootingStars={false} parallax={false} seed={71} />
      <div className="bg-grid absolute inset-0 opacity-35 [mask-image:radial-gradient(ellipse_50%_45%_at_50%_38%,#000,transparent)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(900px,90vw)] -translate-x-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      {/* orbit rings around the beacon, echoing the hero */}
      <div className="absolute left-1/2 top-[190px] size-[760px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.045] sm:top-[214px]" />
      <div className="absolute left-1/2 top-[190px] size-[1180px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-white/[0.03] sm:top-[214px]" />
      <div
        className="absolute left-1/2 top-0 h-[620px] w-[min(1000px,150vw)] -translate-x-1/2 animate-beam"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, transparent 156deg, rgba(255,140,80,0.1) 171deg, rgba(255,196,160,0.2) 180deg, rgba(255,140,80,0.1) 189deg, transparent 204deg)',
          maskImage: 'linear-gradient(to bottom, #000 10%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 10%, transparent 85%)',
        }}
      />
      <div className="absolute left-1/2 top-[52%] h-[720px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.12),transparent)]" />
    </div>
  )
}

function InstallCommand() {
  const [copied, setCopied] = useState(false)
  const timer = useRef(0)
  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(COMMAND)
      setCopied(true)
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setCopied(false), 1800)
    } catch {
      // clipboard blocked (permissions / insecure context): the command stays selectable
    }
  }

  return (
    <div className="glass flex items-center gap-3 rounded-full py-1.5 pl-4 pr-1.5 font-mono text-[13px]">
      <span aria-hidden="true" className="text-ember-300">
        $
      </span>
      <code className="select-all text-sand-100">{COMMAND}</code>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? 'Copied' : 'Copy install command'}
        className="grid size-8 place-items-center rounded-full bg-white/[0.05] text-sand-300 transition-colors hover:bg-white/[0.1] hover:text-sand-50"
      >
        {copied ? <Check aria-hidden="true" className="size-3.5 text-mint-400" strokeWidth={3} /> : <Copy aria-hidden="true" className="size-3.5" />}
      </button>
      <span role="status" className="sr-only">
        {copied ? 'Copied to clipboard' : ''}
      </span>
    </div>
  )
}
