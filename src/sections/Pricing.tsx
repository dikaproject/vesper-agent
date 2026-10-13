import { Boxes, History, Lock, RotateCcw, ShieldCheck } from 'lucide-react'
import { LayoutGroup } from 'motion/react'
import { useState } from 'react'
import { Starfield } from '@/components/effects/Starfield'
import { Reveal } from '@/components/ui/Reveal'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { BillingToggle } from './pricing/BillingToggle'
import { Estimator } from './pricing/Estimator'
import { PlanCard } from './pricing/PlanCard'
import { PLANS, TICKETS, estimate, type Billing } from './pricing/plans'

const INCLUDED = [
  { icon: Boxes, label: 'Sandboxed microVMs' },
  { icon: ShieldCheck, label: 'Approval gates' },
  { icon: History, label: 'Append-only audit log' },
  { icon: RotateCcw, label: 'One-click rollback' },
  { icon: Lock, label: 'SOC 2 Type II' },
]

export function Pricing() {
  const [billing, setBilling] = useState<Billing>('monthly')
  const [tickets, setTickets] = useState<number>(TICKETS.initial)
  const recommended = estimate(tickets, billing).plan

  return (
    <section id="pricing" className="relative isolate overflow-hidden py-24 sm:py-32">
      <PricingBackdrop />
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title={'Pay for agent-hours,\n*not seats.*'}
          description="Every plan ships with the full crew, sandboxed runtimes and approval gates. Start free, scale with the work, and bring your whole team at no extra cost."
        />

        <Reveal y={12} className="mt-10 flex justify-center">
          <BillingToggle value={billing} onChange={setBilling} />
        </Reveal>

        <LayoutGroup>
          <div className="mt-12 grid items-stretch gap-5 lg:grid-cols-3 lg:gap-6">
            {PLANS.map((plan, i) => (
              <Reveal key={plan.id} delay={0.08 * i} y={32} className={plan.featured ? 'h-full lg:-my-3' : 'h-full'}>
                <PlanCard plan={plan} billing={billing} recommended={plan.id === recommended} />
              </Reveal>
            ))}
          </div>
        </LayoutGroup>

        <Reveal y={28} className="mt-8">
          <Estimator tickets={tickets} onTickets={setTickets} billing={billing} />
        </Reveal>

        <Reveal y={10} className="mt-10">
          <p className="text-center font-mono text-[10.5px] uppercase tracking-[0.2em] text-sand-500">Included in every plan</p>
          <ul className="mt-4 flex flex-wrap items-center justify-center gap-x-8 gap-y-3">
            {INCLUDED.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center gap-2 text-[13px] text-sand-300">
                <Icon aria-hidden="true" className="size-4 text-ember-300" />
                {label}
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  )
}

/** Same visual language as the hero: stars, grid, a top light beam over the featured plan. */
function PricingBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.4} twinkles={10} shootingStars={false} parallax={false} seed={47} />
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_55%_40%_at_50%_40%,#000,transparent)]" />
      <div className="absolute left-1/2 top-0 h-px w-[min(900px,90vw)] -translate-x-1/2 bg-linear-to-r from-transparent via-white/10 to-transparent" />
      <div
        className="absolute left-1/2 top-0 h-[900px] w-[min(1000px,150vw)] -translate-x-1/2 animate-beam"
        style={{
          background:
            'conic-gradient(from 180deg at 50% 0%, transparent 160deg, rgba(255,140,80,0.1) 172deg, rgba(255,196,160,0.18) 180deg, rgba(255,140,80,0.1) 188deg, transparent 200deg)',
          maskImage: 'linear-gradient(to bottom, #000 20%, transparent 90%)',
          WebkitMaskImage: 'linear-gradient(to bottom, #000 20%, transparent 90%)',
        }}
      />
      <div className="absolute left-1/2 top-[44%] h-[720px] w-[760px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.13),transparent)]" />
      <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-b from-transparent to-ink-900" />
    </div>
  )
}
