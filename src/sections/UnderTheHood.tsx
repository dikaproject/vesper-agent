import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useRef, useState } from 'react'
import { Starfield } from '@/components/effects/Starfield'
import { SectionHeading } from '@/components/ui/SectionHeading'
import { useMediaQuery } from '@/hooks/useDom'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { IsoStack } from './under-the-hood/IsoStack'
import { LAYERS, layerAt } from './under-the-hood/layers'

export function UnderTheHood() {
  return (
    <section id="under-the-hood" className="relative">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-linear-to-b from-ink-950 to-transparent" />
      <div className="relative mx-auto max-w-7xl px-5 pb-4 pt-24 sm:px-8 sm:pt-32">
        <SectionHeading
          eyebrow="Under the hood"
          title={'Six layers between a prompt\n*and production.*'}
          description="Scroll to take Vesper apart. Each layer exists so autonomous agents can be trusted with real code: isolated, observable, and always waiting for you where it matters."
        />
      </div>
      {/* full content for assistive tech; the visual stack is decorative */}
      <ol className="sr-only">
        {LAYERS.map((layer) => (
          <li key={layer.id}>
            {layer.title}: {layer.description}
          </li>
        ))}
      </ol>
      <StackTrack />
    </section>
  )
}

function StageBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <Starfield density={0.35} twinkles={8} shootingStars={false} parallax={false} seed={31} />
      <div className="bg-grid absolute inset-0 opacity-30 [mask-image:radial-gradient(ellipse_55%_50%_at_64%_56%,#000,transparent)]" />
      <div className="absolute left-1/2 top-[56%] h-[720px] w-[980px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.11),transparent)] lg:left-[64%]" />
    </div>
  )
}

function LayerDetails({ index }: { index: number }) {
  const layer = LAYERS[index] ?? LAYERS[0]
  if (!layer) return null
  const Icon = layer.icon

  return (
    <div className="relative">
      <div className="mb-5 flex gap-1.5" aria-hidden="true">
        {LAYERS.map((l, i) => (
          <span key={l.id} className={cn('h-1 flex-1 rounded-full transition-colors duration-500', i <= index ? 'bg-ember-400' : 'bg-white/10')} />
        ))}
      </div>
      <div className="relative min-h-[200px] sm:min-h-[340px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={layer.id}
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
          >
            <p className="flex items-center gap-2.5 font-mono text-[11px] uppercase tracking-[0.2em] text-ember-300">
              <span className="grid size-7 place-items-center rounded-lg bg-ember-500/12 text-ember-200 ring-1 ring-inset ring-ember-400/30">
                <Icon className="size-3.5" />
              </span>
              Layer 0{index + 1} · {layer.kicker}
            </p>
            <h3 className="mt-4 text-[28px] font-medium leading-tight tracking-[-0.035em] text-sand-50 sm:text-[34px]">{layer.title}</h3>
            <p className="mt-3 text-pretty text-[14.5px] leading-relaxed text-sand-400 sm:text-[15px]">{layer.description}</p>
            <dl className="mt-6 hidden divide-y divide-white/[0.06] rounded-2xl border border-white/[0.07] bg-white/[0.02] sm:block">
              {layer.specs.map(([key, value]) => (
                <div key={key} className="flex items-center justify-between gap-4 px-4 py-3">
                  <dt className="text-[12.5px] text-sand-500">{key}</dt>
                  <dd className="font-mono text-[12.5px] text-sand-100">{value}</dd>
                </div>
              ))}
            </dl>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}

/** 340vh track, pinned stage. Plates move via motion values; state changes 6 times. */
function StackTrack() {
  const trackRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start start', 'end end'] })
  const [active, setActive] = useState(0)
  const [opened, setOpened] = useState(false)
  const isDesktop = useMediaQuery('(min-width: 1024px)', true)

  useMotionValueEvent(scrollYProgress, 'change', (v) => {
    setActive(layerAt(v))
    setOpened(v > 0.07)
  })

  return (
    <div ref={trackRef} className="relative h-[340vh]">
      <div className="sticky top-0 isolate flex h-svh items-center overflow-hidden pt-16">
        <StageBackdrop />
        <div className="relative mx-auto grid w-full max-w-7xl items-center gap-4 px-5 sm:px-8 lg:grid-cols-[minmax(0,380px)_minmax(0,1fr)] lg:gap-10">
          <div className="order-2 lg:order-1">
            <LayerDetails index={active} />
          </div>
          <div className="order-1 lg:order-2">
            <IsoStack progress={scrollYProgress} active={active} opened={opened} withLabels={isDesktop} />
          </div>
        </div>
      </div>
    </div>
  )
}
