import { CodeXml, Radar, Rocket, ShieldCheck, Telescope, Workflow, type LucideIcon } from 'lucide-react'

export type EventKind = 'info' | 'pr' | 'merge' | 'fix' | 'incident'

export interface NightEvent {
  /** Scroll progress (0..1) at which the event happens. */
  at: number
  time: string
  agent: string
  icon: LucideIcon
  text: string
  kind: EventKind
  prs?: number
  tests?: number
  incidents?: number
  pr?: { number: number; title: string; add: string; del: string }
}

/*
 * Clock mapping: progress 0 → 0.86 covers 6:00 PM → 6:30 AM, then the last
 * 30 minutes stretch to 1.0 so the morning report has room to breathe.
 */
export const CLOCK_STOPS = [0, 0.86, 1]
export const CLOCK_MINUTES = [0, 750, 780]
export const REPORT_AT = 0.9

export const EVENTS: NightEvent[] = [
  { at: 0.048, time: '6:42 PM', agent: 'Scout', icon: Telescope, text: 'Picked up 14 tickets from the sprint backlog', kind: 'info' },
  { at: 0.103, time: '7:30 PM', agent: 'Architect', icon: Workflow, text: 'Planned 3 features · 27 tasks · 3 tracks', kind: 'info' },
  { at: 0.212, time: '9:05 PM', agent: 'Builder', icon: CodeXml, text: 'Opened PR #1432 — usage-based billing', kind: 'pr' },
  { at: 0.33, time: '10:48 PM', agent: 'Sentinel', icon: ShieldCheck, text: 'Fixed flaky checkout.e2e (3 retries → 0)', kind: 'fix', tests: 412 },
  {
    at: 0.409,
    time: '11:57 PM',
    agent: 'Pilot',
    icon: Rocket,
    text: 'Merged #1432 and shipped v2.4.0',
    kind: 'merge',
    prs: 2,
    tests: 142,
    pr: { number: 1432, title: 'feat(billing): usage-based billing', add: '+842', del: '−120' },
  },
  {
    at: 0.495,
    time: '1:12 AM',
    agent: 'Builder',
    icon: CodeXml,
    text: 'Upgraded React to 19.3 across 3 apps',
    kind: 'merge',
    prs: 3,
    tests: 318,
    pr: { number: 1433, title: 'chore(deps): react 19.3 in web, admin, docs', add: '+212', del: '−198' },
  },
  { at: 0.566, time: '2:14 AM', agent: 'Pilot', icon: Rocket, text: 'p95 spike in fra1 — rolled back in 38s', kind: 'incident', incidents: 1 },
  {
    at: 0.625,
    time: '3:05 AM',
    agent: 'Analyst',
    icon: Radar,
    text: 'Found an N+1 query in /invoices and fixed it',
    kind: 'merge',
    prs: 1,
    tests: 96,
    pr: { number: 1435, title: 'perf(invoices): batch line-item queries', add: '+38', del: '−61' },
  },
  {
    at: 0.711,
    time: '4:20 AM',
    agent: 'Sentinel',
    icon: ShieldCheck,
    text: 'Raised coverage from 91.2% to 96.4%',
    kind: 'merge',
    prs: 2,
    tests: 216,
    pr: { number: 1436, title: 'test(billing): cover proration edge cases', add: '+1,204', del: '−12' },
  },
  {
    at: 0.792,
    time: '5:31 AM',
    agent: 'Builder',
    icon: CodeXml,
    text: 'Closed 6 dependency security alerts',
    kind: 'merge',
    prs: 3,
    tests: 100,
    pr: { number: 1437, title: 'fix(security): patch 6 advisories', add: '+64', del: '−64' },
  },
  { at: 0.853, time: '6:24 AM', agent: 'Pilot', icon: Rocket, text: 'Disk at 92% on worker-3 — rotated logs', kind: 'incident', incidents: 1 },
]

export interface NightTotals {
  prs: number
  tests: number
  incidents: number
}

export function totalsFor(count: number): NightTotals {
  return EVENTS.slice(0, count).reduce<NightTotals>(
    (sum, e) => ({ prs: sum.prs + (e.prs ?? 0), tests: sum.tests + (e.tests ?? 0), incidents: sum.incidents + (e.incidents ?? 0) }),
    { prs: 0, tests: 0, incidents: 0 },
  )
}

export const countAt = (progress: number) => EVENTS.filter((e) => progress >= e.at).length

export type Act = 'dusk' | 'night' | 'dawn'
export const actAt = (progress: number): Act => (progress < 0.28 ? 'dusk' : progress < 0.8 ? 'night' : 'dawn')
