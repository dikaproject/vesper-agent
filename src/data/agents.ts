import { CodeXml, Radar, Rocket, ShieldCheck, Telescope, Workflow, type LucideIcon } from 'lucide-react'

export type AgentId = 'research' | 'planning' | 'analysis' | 'development' | 'qa' | 'deploy'

export interface Agent {
  id: AgentId
  index: string
  name: string
  codename: string
  icon: LucideIcon
  tagline: string
  description: string
  capabilities: string[]
  /** Short status while running / when finished (hero pipeline + mockups). */
  live: string
  done: string
  stats: { label: string; value: string }[]
}

export const AGENTS: Agent[] = [
  {
    id: 'research',
    index: '01',
    name: 'Research',
    codename: 'Scout',
    icon: Telescope,
    tagline: 'Reads everything, so you don’t have to.',
    description:
      'Scout crawls your repository, docs, tickets and the open web to assemble a grounded brief — APIs, constraints, prior art and edge cases — before a single line is written.',
    capabilities: ['Repo & docs indexing', 'Web + API reference search', 'Source-cited briefs'],
    live: 'Scanning sources',
    done: '14 sources',
    stats: [
      { label: 'Sources read', value: '14' },
      { label: 'Distilled', value: '212k → 3.2k tok' },
    ],
  },
  {
    id: 'planning',
    index: '02',
    name: 'Planning',
    codename: 'Architect',
    icon: Workflow,
    tagline: 'A plan you can actually review.',
    description:
      'Architect turns the brief into an executable plan — milestones, tasks, dependencies and acceptance criteria — and waits for your nod before anything moves.',
    capabilities: ['Milestones & task graph', 'Acceptance criteria', 'Effort estimates'],
    live: 'Drafting plan',
    done: '9 tasks',
    stats: [
      { label: 'Tasks', value: '9' },
      { label: 'Parallel tracks', value: '3' },
    ],
  },
  {
    id: 'analysis',
    index: '03',
    name: 'Analysis',
    codename: 'Analyst',
    icon: Radar,
    tagline: 'Knows the blast radius before it ships.',
    description:
      'Analyst maps your codebase graph to find impacted modules, hidden coupling and the cleanest seams for change — and flags risk before it turns into an incident.',
    capabilities: ['Dependency graph', 'Impact & risk scoring', 'Migration detection'],
    live: 'Mapping impact',
    done: '7 files · low risk',
    stats: [
      { label: 'Files impacted', value: '7' },
      { label: 'Risk score', value: 'Low · 0.18' },
    ],
  },
  {
    id: 'development',
    index: '04',
    name: 'Development',
    codename: 'Builder',
    icon: CodeXml,
    tagline: 'Writes code like your best engineer.',
    description:
      'Builder writes idiomatic, fully-typed code that follows your conventions — in parallel sandboxes, with small atomic commits and messages you would write yourself.',
    capabilities: ['Parallel sandboxes', 'Follows your conventions', 'Atomic commits'],
    live: 'Writing usage.ts',
    done: '+842 −120',
    stats: [
      { label: 'Lines changed', value: '+842 −120' },
      { label: 'Commits', value: '11' },
    ],
  },
  {
    id: 'qa',
    index: '05',
    name: 'QA',
    codename: 'Sentinel',
    icon: ShieldCheck,
    tagline: 'Green suites, every single time.',
    description:
      'Sentinel writes and runs unit, integration and end-to-end tests, hunts down flaky failures and patches what breaks until the whole suite is green.',
    capabilities: ['Unit, integration & e2e', 'Self-healing fixes', 'Coverage reports'],
    live: 'Running 142 tests',
    done: '142 passed',
    stats: [
      { label: 'Tests passed', value: '142 / 142' },
      { label: 'Coverage', value: '96.4%' },
    ],
  },
  {
    id: 'deploy',
    index: '06',
    name: 'Deploy',
    codename: 'Pilot',
    icon: Rocket,
    tagline: 'Ships safely. Rolls back instantly.',
    description:
      'Pilot ships through your CI/CD with preview URLs, canary rollouts and live health checks — and only after you approve the release.',
    capabilities: ['Preview environments', 'Canary rollouts', 'One-click rollback'],
    live: 'Rolling out canary',
    done: 'v2.4.0 live',
    stats: [
      { label: 'Regions', value: '5 live' },
      { label: 'Error rate', value: '0.00%' },
    ],
  },
]
