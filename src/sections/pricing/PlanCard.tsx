import { Check, Timer } from 'lucide-react'
import { motion, useSpring } from 'motion/react'
import { useRef, type PointerEvent } from 'react'
import { Button } from '@/components/ui/Button'
import { GlowFrame } from '@/components/ui/GlowFrame'
import { RollingNumber } from '@/components/ui/RollingNumber'
import { cn } from '@/lib/utils'
import { billingNote, type Billing, type Plan } from './plans'
import { PLAN_SKIES } from './PlanSkies'

const tiltSpring = { stiffness: 170, damping: 18, mass: 0.5 }

/** Gentle 3D tilt + cursor spotlight. Rect is cached on enter (no layout reads per move). */
function useTilt(max: number) {
  const ref = useRef<HTMLDivElement>(null)
  const rect = useRef<DOMRect | null>(null)
  const rotateX = useSpring(0, tiltSpring)
  const rotateY = useSpring(0, tiltSpring)

  const onPointerEnter = () => {
    rect.current = ref.current?.getBoundingClientRect() ?? null
  }
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    const r = rect.current
    if (!el || !r || event.pointerType !== 'mouse') return
    const x = event.clientX - r.left
    const y = event.clientY - r.top
    rotateY.set((x / r.width - 0.5) * max * 2)
    rotateX.set(-(y / r.height - 0.5) * max * 2)
    el.style.setProperty('--x', `${x}px`)
    el.style.setProperty('--y', `${y}px`)
  }
  const onPointerLeave = () => {
    rotateX.set(0)
    rotateY.set(0)
  }

  return {
    ref,
    handlers: { onPointerEnter, onPointerMove, onPointerLeave },
    style: { rotateX, rotateY, transformPerspective: 1200 },
  }
}

interface PlanCardProps {
  plan: Plan
  billing: Billing
  recommended: boolean
}

function PlanBody({ plan, billing, recommended }: PlanCardProps) {
  const Sky = PLAN_SKIES[plan.id]
  const price = plan.price?.[billing]

  return (
    <div className="flex h-full flex-col p-2">
      <div className="relative h-[128px] shrink-0 overflow-hidden rounded-[20px] ring-1 ring-inset ring-white/[0.06]">
        <Sky />
        {plan.featured && (
          <span className="absolute right-3 top-3 rounded-full bg-[linear-gradient(180deg,#ffc9a6,#ff8b4d)] px-2.5 py-1 text-[10.5px] font-semibold text-ink-950 shadow-[0_6px_18px_-6px_rgba(255,108,44,0.9)]">
            Most popular
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col px-4 pb-4 pt-6 sm:px-5 sm:pb-5">
        <div className="flex h-7 items-center justify-between gap-3">
          <h3 className="text-[20px] font-medium tracking-[-0.03em] text-sand-50">{plan.name}</h3>
          {recommended && (
            <motion.span
              layoutId="plan-recommended"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              className="whitespace-nowrap rounded-full bg-mint-400/12 px-2.5 py-1 font-mono text-[10.5px] text-mint-300 ring-1 ring-inset ring-mint-400/30"
            >
              Fits your estimate
            </motion.span>
          )}
        </div>
        <p className="mt-1.5 text-[13.5px] text-sand-400">{plan.tagline}</p>

        <div className="mt-6 flex items-end gap-2">
          {price !== undefined ? (
            <>
              <span className="flex items-start text-[52px] font-medium leading-none tracking-[-0.05em] text-sand-50">
                <span className="inline-block h-[1em]">$</span>
                <RollingNumber value={price} />
              </span>
              <span className="pb-1 text-[13px] text-sand-500">{price === 0 ? 'forever' : '/ month'}</span>
            </>
          ) : (
            <span className="text-[52px] font-medium leading-none tracking-[-0.05em] text-sand-50">Custom</span>
          )}
        </div>
        <p className="mt-2.5 h-5 text-[12px] text-sand-500">{billingNote(plan, billing)}</p>

        <Button href={plan.ctaHref} variant={plan.featured ? 'primary' : 'secondary'} shimmer={plan.featured} arrow className="mt-6 w-full">
          {plan.cta}
        </Button>

        <p className="mt-6 flex items-center gap-2 font-mono text-[11.5px] text-ember-200">
          <Timer aria-hidden="true" className="size-3.5" />
          {plan.hours}
        </p>
        <ul className="mt-4 flex flex-col gap-3">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2.5 text-[13.5px] text-sand-200">
              <span
                className={cn(
                  'mt-0.5 grid size-4 shrink-0 place-items-center rounded-full',
                  plan.featured ? 'bg-ember-500/20 text-ember-200' : 'bg-white/[0.06] text-sand-300',
                )}
              >
                <Check aria-hidden="true" className="size-2.5" strokeWidth={3.2} />
              </span>
              {feature}
            </li>
          ))}
        </ul>
        <p className="mt-auto pt-6 font-mono text-[11px] text-sand-500">{plan.note}</p>
      </div>
    </div>
  )
}

export function PlanCard({ plan, billing, recommended }: PlanCardProps) {
  const tilt = useTilt(plan.featured ? 2.5 : 3.5)
  const body = <PlanBody plan={plan} billing={billing} recommended={recommended} />

  return (
    <motion.div
      ref={tilt.ref}
      {...tilt.handlers}
      style={tilt.style}
      className={cn(
        'spotlight group/plan h-full rounded-[28px]',
        plan.featured
          ? 'shadow-[0_40px_100px_-40px_rgba(255,108,44,0.6)]'
          : 'border border-white/[0.07] bg-linear-to-b from-white/[0.045] to-white/[0.012] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        recommended && !plan.featured && 'border-mint-400/25',
      )}
    >
      {plan.featured ? (
        <GlowFrame speed={7} className="h-full rounded-[28px]" innerClassName="bg-[linear-gradient(180deg,#201a17,#0f0d0c)]">
          {body}
        </GlowFrame>
      ) : (
        body
      )}
    </motion.div>
  )
}
