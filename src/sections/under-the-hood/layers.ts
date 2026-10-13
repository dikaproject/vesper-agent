import { Bot, Boxes, BrainCircuit, CircleCheck, FolderGit2, ShieldCheck, type LucideIcon } from 'lucide-react'
import { clamp } from '@/lib/utils'

export type LayerId = 'codebase' | 'context' | 'sandbox' | 'crew' | 'guardrails' | 'you'

export interface StackLayer {
  id: LayerId
  title: string
  kicker: string
  icon: LucideIcon
  description: string
  specs: [string, string][]
}

/** Bottom → top: data flows up from your repo to your approval. */
export const LAYERS: StackLayer[] = [
  {
    id: 'codebase',
    title: 'Your codebase',
    kicker: 'Source',
    icon: FolderGit2,
    description: 'Connect GitHub, GitLab or Bitbucket. Vesper indexes code, CI config, docs and tickets, and stays read-only until you approve a plan.',
    specs: [['Indexed', '1,284 files in 41s'], ['Access', 'read-only by default'], ['Hosting', 'cloud or your VPC']],
  },
  {
    id: 'context',
    title: 'Context engine',
    kicker: 'Memory',
    icon: BrainCircuit,
    description: 'A living map of your system: call graph, conventions, past decisions and ADRs. Every agent reads from it, so the fiftieth PR looks like the first.',
    specs: [['Conventions', '212 learned'], ['Call graph', '38k edges'], ['Refresh', 'on every push']],
  },
  {
    id: 'sandbox',
    title: 'Sandboxed runtime',
    kicker: 'Isolation',
    icon: Boxes,
    description: 'Every task runs in its own short-lived microVM with your toolchain, seeded test data and zero production credentials.',
    specs: [['Boot time', '< 400 ms'], ['Isolation', 'one microVM per task'], ['Network', 'allow-listed egress']],
  },
  {
    id: 'crew',
    title: 'Agent crew',
    kicker: 'Orchestration',
    icon: Bot,
    description: 'Six specialists coordinated by an orchestrator. They hand off typed artifacts (briefs, plans, impact reports) instead of loose chat logs.',
    specs: [['Agents', '6 specialists'], ['Parallel tracks', 'up to 12'], ['Handoffs', 'typed artifacts']],
  },
  {
    id: 'guardrails',
    title: 'Guardrails',
    kicker: 'Policy',
    icon: ShieldCheck,
    description: 'Set the rules once: what needs approval, which paths are off-limits, how much a night may cost. Every action is logged and reversible.',
    specs: [['Approvals', 'plan · release'], ['Budget', '$40 / night cap'], ['Audit log', 'append-only']],
  },
  {
    id: 'you',
    title: 'You',
    kicker: 'Control',
    icon: CircleCheck,
    description: 'You approve a plan before work starts and a release before it ships. Everything in between is the crew’s job.',
    specs: [['Your time', '~12 min per feature'], ['Merges', 'only after your ✓'], ['Rollback', 'one click']],
  },
]

/** Scroll progress at which the stack is fully exploded. */
export const EXPLODE_END = 0.14
const STEP = (0.97 - EXPLODE_END) / LAYERS.length

/** Active layer for a given scroll progress (bottom layer first). */
export const layerAt = (progress: number) =>
  progress < EXPLODE_END ? 0 : clamp(Math.floor((progress - EXPLODE_END) / STEP), 0, LAYERS.length - 1)
