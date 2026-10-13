import { Starfield } from '@/components/effects/Starfield'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useMediaQuery } from '@/hooks/useDom'
import { AskTheCrew } from './faq/AskTheCrew'
import { FaqAccordion } from './faq/FaqAccordion'

export function FaqSection() {
  const isDesktop = useMediaQuery('(min-width: 1024px)', true)

  return (
    <section id="faq" className="relative isolate overflow-hidden py-24 sm:py-32">
      <FaqBackdrop />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="FAQ"
          title={'Questions?\n*Ask the crew.*'}
          description="Pick a question or type your own. The agent who owns that part of the job answers it, with sources."
        />
        <Reveal y={28} className="mt-14">
          {isDesktop ? <AskTheCrew /> : <FaqAccordion />}
        </Reveal>
      </div>
    </section>
  )
}

function FaqBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.35} twinkles={8} shootingStars={false} parallax={false} seed={53} />
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_55%_45%_at_60%_60%,#000,transparent)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(900px,90vw)] -translate-x-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div className="absolute left-[62%] top-[60%] h-[700px] w-[900px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.11),transparent)]" />
    </div>
  )
}
