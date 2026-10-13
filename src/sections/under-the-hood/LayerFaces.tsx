import { Check, FolderGit2, ShieldCheck } from 'lucide-react'
import type { ComponentType } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { GradientAvatar } from '@/components/ui/Avatar'
import { AGENTS } from '@/data/agents'
import { mulberry32 } from '@/lib/random'
import { cn } from '@/lib/utils'
import type { LayerId } from './layers'

/** Faces are drawn on a 290×290 plate and then laid flat in isometric space. */
export const FACE = 290
const C = FACE / 2

export interface FaceProps {
  active: boolean
}

/* ------------------------------------------------------------------ */
/* 01 · Codebase — file tiles, a few light up as "touched"             */
/* ------------------------------------------------------------------ */
const FILE_BARS = (() => {
  const r = mulberry32(5)
  return Array.from({ length: 12 }, () => [40 + r() * 55, 30 + r() * 60, 20 + r() * 50])
})()
const HOT = new Set([1, 6, 9])

function CodebaseFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-0 p-5">
      <p className="flex items-center gap-2 font-mono text-[11px] text-sand-300">
        <FolderGit2 className="size-3.5 text-ember-300" />
        acme/web-app
        <span className="ml-auto text-sand-500">main</span>
      </p>
      <div className="mt-4 grid grid-cols-4 gap-2">
        {FILE_BARS.map((bars, i) => {
          const hot = active && HOT.has(i)
          return (
            <div
              key={i}
              className={cn(
                'flex h-[50px] flex-col justify-center gap-1.5 rounded-lg border px-2 transition-colors duration-500',
                hot ? 'border-ember-400/50 bg-ember-500/15' : 'border-white/[0.06] bg-white/[0.03]',
              )}
            >
              {bars.map((w, j) => (
                <span key={j} className={cn('h-[3px] rounded-full transition-colors duration-500', hot ? 'bg-ember-300/85' : 'bg-sand-500/40')} style={{ width: `${w}%` }} />
              ))}
            </div>
          )
        })}
      </div>
      <p className="absolute inset-x-5 bottom-4 flex justify-between font-mono text-[10px] text-sand-500">
        <span>1,284 files</span>
        <span>TS · Go · SQL</span>
      </p>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 02 · Context engine — knowledge graph + learned conventions          */
/* ------------------------------------------------------------------ */
const GRAPH = (() => {
  const r = mulberry32(11)
  const nodes = Array.from({ length: 15 }, (_, i) => {
    const a = (i / 15) * Math.PI * 2 + r() * 0.4
    const d = 48 + r() * 70
    return { x: C + Math.cos(a) * d, y: C + Math.sin(a) * d, r: 2.4 + r() * 2.4, hub: r() < 0.35 }
  })
  const edges: [number, number][] = []
  nodes.forEach((n, i) => {
    nodes
      .map((m, j) => ({ j, d: Math.hypot(m.x - n.x, m.y - n.y) }))
      .filter((o) => o.j !== i)
      .sort((a, b) => a.d - b.d)
      .slice(0, 2)
      .forEach(({ j }) => {
        if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j])
      })
  })
  return { nodes, edges }
})()

function ContextFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-0">
      <svg viewBox={`0 0 ${FACE} ${FACE}`} className="absolute inset-0 size-full">
        <circle cx={C} cy={C} r="122" fill="none" stroke="rgba(255,255,255,0.07)" strokeDasharray="2 6" />
        {GRAPH.edges.map(([a, b]) => {
          const na = GRAPH.nodes[a]
          const nb = GRAPH.nodes[b]
          if (!na || !nb) return null
          return <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(255,255,255,0.12)" />
        })}
        {GRAPH.nodes.map((n, i) =>
          n.hub ? <line key={`c${i}`} x1={C} y1={C} x2={n.x} y2={n.y} stroke={active ? 'rgba(255,135,72,0.55)' : 'rgba(255,255,255,0.08)'} style={{ transition: 'stroke 500ms' }} /> : null,
        )}
        {GRAPH.nodes.map((n, i) => (
          <circle
            key={i}
            cx={n.x}
            cy={n.y}
            r={n.r}
            fill={active && n.hub ? '#FFB27F' : '#70675F'}
            className={active ? 'animate-twinkle' : undefined}
            style={{ animationDelay: `${i * 0.21}s`, transformBox: 'fill-box', transformOrigin: 'center', transition: 'fill 500ms' }}
          />
        ))}
        <circle cx={C} cy={C} r="9" fill="#FF8748" />
        <circle cx={C} cy={C} r="18" fill="none" stroke="rgba(255,135,72,0.4)" />
      </svg>
      <span className="absolute left-4 top-4 rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-sand-300">zod schemas</span>
      <span className="absolute right-4 top-11 rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[10px] text-sand-300">server actions</span>
      <span className="absolute bottom-4 left-4 rounded-md bg-ember-500/15 px-2 py-1 font-mono text-[10px] text-ember-200">212 conventions</span>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 03 · Sandboxes — a grid of isolated microVMs                         */
/* ------------------------------------------------------------------ */
const RUNNING = new Set([0, 2, 4, 5, 7])

function SandboxFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-5 grid grid-cols-3 gap-2.5">
      {Array.from({ length: 9 }, (_, i) => {
        const running = RUNNING.has(i)
        return (
          <div
            key={i}
            className={cn(
              'relative rounded-xl border bg-ink-900/70 transition-colors duration-500',
              active && running ? 'border-mint-400/35' : 'border-white/[0.07]',
            )}
          >
            <span className="absolute left-2.5 top-2 font-mono text-[9.5px] text-sand-500">vm-{String(i + 1).padStart(2, '0')}</span>
            <span
              className={cn(
                'absolute right-2.5 top-2.5 size-1.5 rounded-full',
                running ? (active ? 'animate-twinkle bg-mint-400' : 'bg-mint-400/50') : 'bg-white/15',
              )}
              style={{ animationDelay: `${i * 0.3}s` }}
            />
            <span className={cn('absolute bottom-2 left-2.5 font-mono text-[13px]', running ? 'text-ember-300' : 'text-sand-600')}>&gt;_</span>
          </div>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 04 · Agent crew — six specialists around the orchestrator            */
/* ------------------------------------------------------------------ */
function CrewFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-0">
      <div
        className={cn(
          'absolute left-1/2 top-1/2 size-[202px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-dashed border-ember-300/35',
          active && 'animate-spin-slower',
        )}
      />
      <div className="absolute left-1/2 top-1/2 grid size-[62px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-2xl bg-ink-800 shadow-[0_0_34px_-6px_rgba(255,108,44,0.7)] ring-1 ring-ember-400/45">
        <LogoMark size={34} />
      </div>
      {AGENTS.map((agent, i) => {
        const angle = (i / AGENTS.length) * Math.PI * 2 - Math.PI / 2
        const Icon = agent.icon
        return (
          <span
            key={agent.id}
            className={cn(
              'absolute grid size-11 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border bg-ink-800 transition-colors duration-500',
              active ? 'border-ember-400/45 text-ember-200' : 'border-white/10 text-sand-400',
            )}
            style={{ left: C + Math.cos(angle) * 101, top: C + Math.sin(angle) * 101 }}
          >
            <Icon className="size-4" />
          </span>
        )
      })}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 05 · Guardrails — policy toggles                                     */
/* ------------------------------------------------------------------ */
const POLICIES: [string, boolean][] = [
  ['Approve plans', true],
  ['Approve releases', true],
  ['Write to /infra', false],
  ['Budget cap · $40', true],
]

function GuardrailsFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-0 p-5">
      <div className="flex items-center gap-3">
        <span className="grid size-11 place-items-center rounded-xl bg-ember-500/12 text-ember-200 ring-1 ring-inset ring-ember-400/30">
          <ShieldCheck className="size-5" />
        </span>
        <div>
          <p className="text-[13px] font-medium text-sand-100">Policy · acme</p>
          <p className="font-mono text-[10px] text-sand-500">v12 · enforced</p>
        </div>
      </div>
      <div className="mt-4 flex flex-col gap-2">
        {POLICIES.map(([label, on]) => (
          <div key={label} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.03] px-3 py-2 text-[11.5px] text-sand-200">
            {label}
            <span className={cn('relative h-4 w-7 rounded-full transition-colors duration-500', on ? (active ? 'bg-ember-500' : 'bg-ember-500/45') : 'bg-white/10')}>
              <span className={cn('absolute top-0.5 size-3 rounded-full bg-sand-50', on ? 'left-3.5' : 'left-0.5')} />
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* 06 · You — the review that gates every merge                         */
/* ------------------------------------------------------------------ */
function ReviewFace({ active }: FaceProps) {
  return (
    <div className="absolute inset-0 flex flex-col p-5">
      <div className="flex items-center gap-2.5">
        <GradientAvatar name="Ava Chen" size={30} />
        <div>
          <p className="text-[12.5px] text-sand-100">Ava Chen</p>
          <p className="font-mono text-[10px] text-sand-500">reviewing · #1432</p>
        </div>
      </div>
      <div className="mt-4 rounded-xl border border-white/[0.07] bg-white/[0.03] p-3">
        <p className="truncate font-mono text-[11px] text-sand-50">feat(billing): usage-based billing</p>
        <p className="mt-1.5 flex gap-2.5 font-mono text-[10px]">
          <span className="text-mint-300">+842</span>
          <span className="text-coral-400">−120</span>
          <span className="text-sand-500">142 checks</span>
        </p>
      </div>
      <div className="mt-3 flex flex-col gap-1.5 font-mono text-[10.5px] text-sand-400">
        {['Plan matched', 'Tests green · 96.4%', 'Risk low · 0.18'].map((item) => (
          <span key={item} className="flex items-center gap-2">
            <Check className="size-3 text-mint-400" strokeWidth={3} />
            {item}
          </span>
        ))}
      </div>
      <div
        className={cn(
          'mt-auto flex h-10 items-center justify-center gap-2 rounded-xl text-[13px] font-medium transition-colors duration-500',
          active ? 'bg-mint-400 text-ink-950' : 'bg-white/[0.06] text-sand-300',
        )}
      >
        <Check className="size-4" strokeWidth={3} />
        {active ? 'Approved · merging' : 'Approve & merge'}
      </div>
    </div>
  )
}

export const FACES: Record<LayerId, ComponentType<FaceProps>> = {
  codebase: CodebaseFace,
  context: ContextFace,
  sandbox: SandboxFace,
  crew: CrewFace,
  guardrails: GuardrailsFace,
  you: ReviewFace,
}
