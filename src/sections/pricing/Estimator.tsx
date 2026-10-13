import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { RollingNumber } from '@/components/ui/RollingNumber'
import { Tween } from '@/components/ui/Tween'
import { EASE_OUT } from '@/lib/motion'
import { mulberry32 } from '@/lib/random'
import { cn } from '@/lib/utils'
import { TICKETS, estimate, planById, type Billing, type PlanId } from './plans'

/* A month of nights: weekday rhythm + a little noise (deterministic). */
const NIGHTS = (() => {
  const r = mulberry32(77)
  return Array.from({ length: 30 }, (_, i) => {
    const weekend = i % 7 === 4 || i % 7 === 5
    return (weekend ? 0.45 : 0.78) + r() * 0.22
  })
})()

const BAR_TONE: Record<PlanId, string> = {
  dusk: 'from-sand-600 to-sand-400',
  night: 'from-ember-700 to-ember-300',
  constellation: 'from-ember-500 to-ember-100',
}

function NightsChart({ tickets, plan }: { tickets: number; plan: PlanId }) {
  // sqrt keeps small teams visible without flattening the top of the range
  const load = 0.08 + Math.sqrt(tickets / TICKETS.max) * 0.92
  return (
    <div>
      <div className="flex items-center justify-between font-mono text-[10.5px] text-sand-500">
        <span>Your month of night shifts</span>
        <span className="tabular-nums text-sand-300">≈ {(tickets / 30).toFixed(1)} tickets / night</span>
      </div>
      <div className="mt-3 flex h-[120px] items-end gap-[3px] rounded-2xl border border-white/[0.06] bg-white/[0.02] px-3 pb-3 pt-4">
        {NIGHTS.map((n, i) => (
          <span key={i} className="relative h-full flex-1">
            <span
              className={cn('absolute inset-x-0 bottom-0 h-full origin-bottom rounded-[3px] bg-linear-to-t transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]', BAR_TONE[plan])}
              style={{ transform: `scaleY(${Math.max(0.04, n * load)})`, transitionDelay: `${i * 8}ms` }}
            />
          </span>
        ))}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-sand-600">
        <span>Nov 1</span>
        <span>Nov 15</span>
        <span>Nov 30</span>
      </div>
    </div>
  )
}

function Metric({ label, children, hint }: { label: string; children: ReactNode; hint: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.025] p-3.5 sm:p-4">
      <dt className="text-[11.5px] text-sand-500">{label}</dt>
      <dd className="mt-1.5 font-mono text-[20px] font-medium tracking-[-0.03em] text-sand-50 sm:text-[22px]">{children}</dd>
      <p className="mt-0.5 text-[10.5px] text-sand-600">{hint}</p>
    </div>
  )
}

interface EstimatorProps {
  tickets: number
  onTickets: (value: number) => void
  billing: Billing
}

/** Drag the slider: metrics tween, bars rise, and the recommended plan updates. */
export function Estimator({ tickets, onTickets, billing }: EstimatorProps) {
  const est = estimate(tickets, billing)
  const plan = planById(est.plan)
  const fill = ((tickets - TICKETS.min) / (TICKETS.max - TICKETS.min)) * 100

  return (
    <div className="glass-solid relative overflow-hidden rounded-[28px] p-5 sm:p-8">
      <div aria-hidden="true" className="pointer-events-none absolute -right-40 -top-40 size-[420px] rounded-full bg-[radial-gradient(closest-side,rgba(255,108,44,0.14),transparent)]" />
      <div className="relative grid gap-8 lg:grid-cols-[1.08fr_1fr] lg:gap-12">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-ember-300">Estimate your night shift</p>
          <div className="mt-5 flex items-end justify-between gap-4">
            <label htmlFor="pricing-tickets" className="max-w-[260px] text-[15px] leading-snug text-sand-200 sm:text-base">
              How many tickets should the crew handle each month?
            </label>
            <span className="font-mono text-[34px] font-medium leading-none tracking-[-0.04em] text-sand-50 tabular-nums">{tickets}</span>
          </div>
          <input
            id="pricing-tickets"
            type="range"
            min={TICKETS.min}
            max={TICKETS.max}
            step={TICKETS.step}
            value={tickets}
            onChange={(e) => onTickets(Number(e.target.value))}
            aria-valuetext={`${tickets} tickets per month`}
            className="range mt-5 w-full"
            style={{ '--fill': `${fill}%` } as CSSProperties}
          />
          <div className="mt-1 flex justify-between font-mono text-[10px] text-sand-600">
            <span>{TICKETS.min}</span>
            <span>125</span>
            <span>250</span>
            <span>375</span>
            <span>{TICKETS.max}</span>
          </div>

          <dl className="mt-7 grid grid-cols-3 gap-2.5 sm:gap-3">
            <Metric label="Agent-hours" hint="per month">
              <Tween value={est.agentHours} />
            </Metric>
            <Metric label="Time back" hint="engineer-hours">
              <Tween value={est.engineerHours} suffix="h" />
            </Metric>
            <Metric label="Capacity" hint="full-time engineers">
              <Tween value={est.capacity} decimals={1} prefix="+" />
            </Metric>
          </dl>
        </div>

        <div className="flex flex-col">
          <NightsChart tickets={tickets} plan={est.plan} />
          <div className="mt-5 flex items-center justify-between gap-4 rounded-2xl border border-ember-400/25 bg-ember-500/[0.06] p-4 sm:p-5">
            <div className="min-w-0">
              <p className="font-mono text-[10.5px] uppercase tracking-[0.18em] text-sand-500">Recommended</p>
              <div className="relative mt-1 h-8 overflow-hidden">
                <AnimatePresence mode="popLayout" initial={false}>
                  <motion.p
                    key={plan.id}
                    initial={{ y: 26, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: -26, opacity: 0 }}
                    transition={{ duration: 0.45, ease: EASE_OUT }}
                    className="text-[22px] font-medium tracking-[-0.03em] text-sand-50"
                  >
                    {plan.name}
                  </motion.p>
                </AnimatePresence>
              </div>
              <p className="mt-1 text-[12px] text-sand-400">
                {est.multiple ? (
                  <>
                    ≈ <Tween value={est.multiple} suffix="×" /> return on <Tween value={est.value} prefix="$" /> of engineering time
                  </>
                ) : est.monthly === 0 ? (
                  'Free while you try the crew'
                ) : (
                  'Pooled hours at volume pricing'
                )}
              </p>
            </div>
            <div className="shrink-0 text-right">
              {est.monthly === null ? (
                <span className="text-[30px] font-medium leading-none tracking-[-0.04em] text-sand-50">Custom</span>
              ) : (
                <span className="flex items-start justify-end text-[34px] font-medium leading-none tracking-[-0.045em] text-sand-50">
                  <span className="inline-block h-[1em]">$</span>
                  <RollingNumber value={est.monthly} />
                </span>
              )}
              <p className="mt-1.5 font-mono text-[10.5px] text-sand-500">{est.monthly === null ? 'talk to us' : 'per month'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
