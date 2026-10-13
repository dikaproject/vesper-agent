import { Starfield } from '@/components/effects/Starfield'
import { Reveal } from '@/components/ui/Reveal'
import { RevealText } from '@/components/ui/RevealText'
import { AgentFlow } from './hero/AgentFlow'
import { LogoCloud } from './hero/LogoCloud'
import { PromptBox } from './hero/PromptBox'

export function Hero() {
  return (
    <section id="top" className="relative isolate overflow-hidden pt-36 sm:pt-40 lg:pt-44">
      <HeroBackdrop />

      <div className="relative mx-auto flex max-w-7xl flex-col items-center px-5 text-center sm:px-8">
        <RevealText
          as="h1"
          immediate
          delay={0.15}
          stagger={0.075}
          text={'Ship production code\n*while you sleep.*'}
          className="text-[2.6rem] font-medium leading-[1.02] tracking-[-0.05em] sm:text-6xl md:text-7xl lg:text-[5.5rem]"
        />

        <Reveal immediate blur delay={0.55} className="mt-6 max-w-2xl text-pretty text-[15px] leading-relaxed text-sand-400 sm:text-[17px]">
          Six specialized AI agents research, plan, analyze, build, test and deploy your software — from a single prompt
          to a reviewed, production-ready release.
        </Reveal>

        <Reveal immediate delay={0.7} className="mt-9 w-full">
          <PromptBox />
        </Reveal>

        <Reveal immediate delay={0.85} y={8} className="mt-5">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[11px] text-sand-500">
            {['50 free agent-hours', 'No credit card', 'SOC 2 Type II'].map((item, i) => (
              <li key={item} className="flex items-center gap-4">
                {i > 0 && <span aria-hidden="true" className="size-1 rounded-full bg-ember-500/60" />}
                {item}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>

      <div className="relative mx-auto mt-14 max-w-[1240px] px-4 sm:px-8 lg:mt-20">
        {/* planet horizon: apex sits just under the last agent */}
        <div aria-hidden="true" className="pointer-events-none absolute left-1/2 top-[calc(100%-26px)] -z-10 h-[760px] w-[2200px] -translate-x-1/2">
          <div className="absolute inset-0 rounded-[50%] border-t border-ember-300/30 bg-[radial-gradient(48%_36%_at_50%_0%,rgba(255,108,44,0.16),transparent)] shadow-[0_-40px_110px_-30px_rgba(255,108,44,0.45)]" />
          <div className="absolute left-1/2 top-0 h-px w-[520px] -translate-x-1/2 bg-linear-to-r from-transparent via-ember-100 to-transparent" />
          <div className="absolute left-1/2 top-0 h-28 w-[420px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,170,120,0.35),transparent)]" />
        </div>
        <Reveal immediate delay={0.95} y={40}>
          <AgentFlow />
        </Reveal>
      </div>

      <LogoCloud />
    </section>
  )
}

/**
 * Even, symmetric backdrop: stars, a faint grid, orbit rings and a single
 * light beam from the top. No side light leaks, no CSS blur filters.
 */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={1.1} twinkles={26} />
      <div className="bg-grid fade-radial absolute inset-0 opacity-60" />

      {/* orbit rings + one travelling light */}
      <div className="absolute left-1/2 top-[-430px] size-[920px] -translate-x-1/2 rounded-full border border-white/[0.045]" />
      <div className="absolute left-1/2 top-[-600px] size-[1260px] -translate-x-1/2 rounded-full border border-white/[0.03]" />
      <div className="absolute left-1/2 top-[-430px] size-[920px] -translate-x-1/2 animate-spin-slower rounded-full">
        <span className="absolute left-1/2 top-full size-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-200 shadow-[0_0_12px_3px_rgba(255,135,72,0.8)]" />
      </div>

      {/* top light beam */}
      <div
        className="absolute left-1/2 top-0 h-[640px] w-[min(1100px,150vw)] -translate-x-1/2 animate-beam"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, transparent 150deg, rgba(255,140,80,0.14) 170deg, rgba(255,196,160,0.26) 180deg, rgba(255,140,80,0.14) 190deg, transparent 210deg)',
          maskImage: 'linear-gradient(to bottom, #000 15%, transparent 85%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 15%, transparent 85%)',
        }}
      />
      <div className="absolute left-1/2 top-[68px] h-[90px] w-px -translate-x-1/2 bg-linear-to-b from-ember-200/0 via-ember-200/55 to-transparent" />
      <div className="absolute left-1/2 top-[-120px] h-[220px] w-[620px] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,170,120,0.18),transparent)]" />

      <div className="absolute inset-x-0 bottom-0 h-48 bg-linear-to-b from-transparent to-ink-900" />
    </div>
  )
}
