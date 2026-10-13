import { Check, FolderGit2, Rocket, Server, ShieldCheck, Workflow } from 'lucide-react'
import { AnimatePresence, motion, useInView } from 'motion/react'
import { useRef } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { GradientAvatar } from '@/components/ui/Avatar'
import { AGENTS } from '@/data/agents'
import { useFitScale, useMediaQuery } from '@/hooks/useDom'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { GlowFrame } from '@/components/ui/GlowFrame'
import { AgentPill } from './AgentPill'
import { CORE, DEVICE, H, INPUT, PILL_H, PILL_W, PILL_X, PILL_Y, REPO, REVIEW, W, stateFor, usePipelineCycle } from './flow'
import { FlowBase, FlowComets, FlowHighlights } from './FlowLines'
import { ServerStack } from './ServerStack'

/** Hero visual: prompt → orchestrator → six agents → your review → production. */
export function AgentFlow() {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { margin: '0px 0px -8% 0px' })
  const isDesktop = useMediaQuery('(min-width: 1024px)', true)

  return (
    <div ref={ref} aria-label="Animated diagram of Vesper's six-agent pipeline" role="img">
      {isDesktop ? <FlowCanvas active={inView} /> : <FlowCompact active={inView} />}
    </div>
  )
}

function FlowCanvas({ active }: { active: boolean }) {
  const outer = useRef<HTMLDivElement>(null)
  const scale = useFitScale(outer, W)
  const { stage, shipped, deploying } = usePipelineCycle(active)

  return (
    <div ref={outer} className="relative w-full" style={{ height: H * scale }}>
      <div
        className="absolute left-1/2 top-0"
        style={{ width: W, height: H, marginLeft: -W / 2, transform: `scale(${scale})`, transformOrigin: '50% 0' }}
      >
        {/* soft stage glow behind the pills */}
        <div className="pointer-events-none absolute left-[380px] top-[20px] h-[380px] w-[440px] rounded-full bg-[radial-gradient(closest-side,rgba(255,108,44,0.16),transparent)]" />
        <FlowBase />
        <FlowHighlights stage={stage} shipped={shipped} deploying={deploying} />
        {active && <FlowComets stage={stage} shipped={shipped} deploying={deploying} />}
        <InputNode />
        <RepoNode />
        <CoreNode />
        {AGENTS.map((agent, i) => (
          <AgentPill
            key={agent.id}
            agent={agent}
            state={stateFor(i, stage)}
            className="absolute"
            style={{ left: PILL_X, top: (PILL_Y[i] ?? 0) - PILL_H / 2, width: PILL_W }}
          />
        ))}
        <ReviewNode approved={stage >= AGENTS.length - 1} />
        <ProductionNode shipped={shipped} deploying={deploying} />
        <FlowToast stage={stage} />
      </div>
    </div>
  )
}

const nodeLabel = 'absolute left-1/2 -translate-x-1/2 whitespace-nowrap font-mono text-[10px] uppercase tracking-[0.18em] text-sand-500'

function InputNode() {
  const size = INPUT.r * 2
  return (
    <div className="absolute" style={{ left: INPUT.x - INPUT.r, top: INPUT.y - INPUT.r, width: size, height: size }}>
      <div className="absolute -inset-12 animate-breathe rounded-full bg-[radial-gradient(closest-side,rgba(255,120,60,0.34),transparent)]" />
      <div className="relative grid size-full place-items-center rounded-full bg-[linear-gradient(180deg,#2b2420,#0d0b0a)] shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_22px_40px_-10px_rgba(0,0,0,0.85),inset_0_1px_0_rgba(255,255,255,0.15)]">
        <span className="absolute inset-[5px] animate-spin-slower rounded-full border border-dashed border-ember-300/25" />
        <span className="grid size-[62px] place-items-center rounded-full bg-[radial-gradient(circle_at_50%_30%,#3a2e27,#141110)] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08),inset_0_-10px_18px_rgba(255,108,44,0.28)]">
          <span className="text-gradient-ember font-mono text-[19px] font-semibold">&gt;_</span>
        </span>
      </div>
      <span className={nodeLabel} style={{ top: size + 12 }}>
        Your prompt
      </span>
    </div>
  )
}

function RepoNode() {
  const size = REPO.r * 2
  return (
    <div className="absolute" style={{ left: REPO.x - REPO.r, top: REPO.y - REPO.r, width: size, height: size }}>
      <div className="grid size-full place-items-center rounded-full bg-ink-750 shadow-[0_0_0_1px_rgba(255,255,255,0.1),inset_0_1px_0_rgba(255,255,255,0.08)]">
        <FolderGit2 className="size-4 text-sand-300" />
      </div>
      <span className={cn(nodeLabel, 'normal-case tracking-normal')} style={{ top: size + 8 }}>
        acme/web-app
      </span>
    </div>
  )
}

function CoreNode() {
  return (
    <div className="absolute" style={{ left: CORE.x - CORE.s / 2, top: CORE.y - CORE.s / 2, width: CORE.s, height: CORE.s }}>
      <GlowFrame
        speed={5}
        className="size-full rounded-[16px] shadow-[0_14px_32px_-8px_rgba(255,108,44,0.5)]"
        innerClassName="grid place-items-center bg-[linear-gradient(180deg,#27201c,#0f0d0c)]"
      >
        <LogoMark size={30} />
      </GlowFrame>
      <span className={nodeLabel} style={{ top: CORE.s + 10 }}>
        Orchestrator
      </span>
    </div>
  )
}

function ReviewNode({ approved }: { approved: boolean }) {
  const size = REVIEW.r * 2
  return (
    <div className="absolute" style={{ left: REVIEW.x - REVIEW.r, top: REVIEW.y - REVIEW.r, width: size, height: size }}>
      <div
        className={cn(
          'grid size-full place-items-center rounded-full bg-ink-800 transition-shadow duration-500',
          approved
            ? 'shadow-[0_0_0_1px_rgba(255,170,120,0.65),0_0_26px_rgba(255,108,44,0.55)]'
            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.12)]',
        )}
      >
        <GradientAvatar name="Ava Chen" size={36} />
      </div>
      <AnimatePresence>
        {approved && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 18 }}
            className="absolute -right-1 -top-1 grid size-[18px] place-items-center rounded-full bg-mint-400 text-ink-950 ring-2 ring-ink-900"
          >
            <Check className="size-3" strokeWidth={3} />
          </motion.span>
        )}
      </AnimatePresence>
      <span className={cn(nodeLabel, 'normal-case tracking-normal')} style={{ top: size + 8 }}>
        {approved ? 'Approved by you' : 'Your review'}
      </span>
    </div>
  )
}

function ProductionNode({ shipped, deploying }: { shipped: boolean; deploying: boolean }) {
  return (
    <div className="absolute flex flex-col items-center" style={{ left: DEVICE.x, top: DEVICE.y, width: DEVICE.s }}>
      <div
        className={cn(
          'relative grid place-items-center overflow-hidden rounded-[34px] bg-[linear-gradient(180deg,#231d19,#0c0a09)] transition-shadow duration-700',
          shipped
            ? 'shadow-[0_0_0_1px_rgba(255,180,140,0.55),0_0_70px_-6px_rgba(255,108,44,0.8),inset_0_1px_0_rgba(255,255,255,0.18)]'
            : 'shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_26px_50px_-14px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.1)]',
        )}
        style={{ width: DEVICE.s, height: DEVICE.s }}
      >
        <div className="bg-dots absolute inset-0 opacity-40" />
        <div className="absolute inset-x-6 bottom-3 h-10 rounded-full bg-[radial-gradient(closest-side,rgba(255,108,44,0.35),transparent)]" />
        <ServerStack lit={shipped} busy={deploying} className="relative" />
        {shipped && <span className="absolute left-1/2 top-[37%] size-14 -translate-x-1/2 -translate-y-1/2 animate-ping-slow rounded-full border border-ember-300/70" />}
      </div>
      <span className="mt-3 text-[13px] font-medium text-sand-100">Production</span>
      <DeployStatus shipped={shipped} deploying={deploying} className="mt-1.5" />
    </div>
  )
}

function DeployStatus({ shipped, deploying, className }: { shipped: boolean; deploying: boolean; className?: string }) {
  const label = shipped ? 'live · v2.4.0' : deploying ? 'rolling out…' : 'v2.3.9 · stable'
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10.5px] text-sand-300', className)}>
      <span className="relative flex size-1.5">
        {(shipped || deploying) && (
          <span className={cn('absolute inset-0 animate-ping rounded-full', shipped ? 'bg-mint-400' : 'bg-ember-400')} />
        )}
        <span className={cn('relative size-1.5 rounded-full', shipped ? 'bg-mint-400' : deploying ? 'bg-ember-400' : 'bg-sand-500')} />
      </span>
      {label}
    </span>
  )
}

const TOASTS: Record<number, { icon: typeof Rocket; text: string }> = {
  2: { icon: Workflow, text: 'Plan approved · 9 tasks · 3 tracks' },
  5: { icon: ShieldCheck, text: '142 / 142 tests passed' },
  6: { icon: Rocket, text: 'Shipped v2.4.0 in 3m 42s' },
}

function FlowToast({ stage }: { stage: number }) {
  const toast = TOASTS[stage]
  return (
    <div className="absolute right-[18px] top-[14px] flex h-10 justify-end">
      <AnimatePresence mode="wait">
        {toast && (
          <motion.div
            key={toast.text}
            initial={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -6, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="glass flex items-center gap-2 rounded-full py-1.5 pl-1.5 pr-3.5 text-[12px] text-sand-100"
          >
            <span className="grid size-6 place-items-center rounded-full bg-mint-400/15 text-mint-300">
              <toast.icon className="size-3.5" />
            </span>
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Compact vertical pipeline for tablets and phones                    */
/* ------------------------------------------------------------------ */
function FlowCompact({ active }: { active: boolean }) {
  const { stage, shipped, deploying } = usePipelineCycle(active)
  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center">
      <div className="glass flex w-full items-center gap-3 rounded-2xl p-3 text-left">
        <span className="text-gradient-ember grid size-10 shrink-0 place-items-center rounded-xl bg-ink-750 font-mono text-sm font-semibold ring-1 ring-white/10">
          &gt;_
        </span>
        <div className="min-w-0">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-sand-500">Your prompt</p>
          <p className="truncate text-[13px] text-sand-100">Add usage-based billing with Stripe</p>
        </div>
      </div>
      <Connector />
      <div className="flex w-full flex-col gap-2">
        {AGENTS.map((agent, i) => (
          <AgentPill key={agent.id} agent={agent} state={stateFor(i, stage)} />
        ))}
      </div>
      <Connector />
      <div
        className={cn(
          'glass flex w-full items-center gap-3 rounded-2xl p-3 text-left transition-shadow duration-700',
          shipped && 'shadow-[0_0_0_1px_rgba(255,170,120,0.5),0_0_44px_-8px_rgba(255,108,44,0.75)]',
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-ink-750 text-ember-300 ring-1 ring-white/10">
          <Server className="size-4.5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium text-sand-100">Production</p>
          <p className="font-mono text-[11px] text-sand-500">acme.dev · 5 regions</p>
        </div>
        <DeployStatus shipped={shipped} deploying={deploying} />
      </div>
    </div>
  )
}

function Connector() {
  return (
    <div
      aria-hidden="true"
      className="relative h-8 w-px bg-[repeating-linear-gradient(to_bottom,rgba(255,240,228,0.28)_0_2px,transparent_2px_7px)]"
    >
      <span className="absolute left-1/2 top-0 h-3 w-[3px] -translate-x-1/2 animate-[drip_1.4s_linear_infinite] rounded-full bg-ember-300 shadow-[0_0_10px_rgba(255,135,72,0.9)]" />
    </div>
  )
}
