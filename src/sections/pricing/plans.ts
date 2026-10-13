export type Billing = 'monthly' | 'yearly'
export type PlanId = 'dusk' | 'night' | 'constellation'

export interface Plan {
  id: PlanId
  name: string
  tagline: string
  /** null = custom / talk to sales */
  price: Record<Billing, number> | null
  cta: string
  ctaHref: string
  featured?: boolean
  hours: string
  features: string[]
  note: string
}

export const PLANS: Plan[] = [
  {
    id: 'dusk',
    name: 'Dusk',
    tagline: 'Try the crew on a side project.',
    price: { monthly: 0, yearly: 0 },
    cta: 'Start free',
    ctaHref: '/register?plan=dusk',
    hours: '50 agent-hours / month',
    features: ['1 repository', '2 agents in parallel', 'Plan + release approvals', 'Community support'],
    note: 'No credit card required',
  },
  {
    id: 'night',
    name: 'Night Shift',
    tagline: 'Wake up to merged PRs, every morning.',
    price: { monthly: 149, yearly: 119 },
    cta: 'Start 14-day trial',
    ctaHref: '/register?plan=night',
    featured: true,
    hours: '600 agent-hours / month',
    features: ['Unlimited repos and seats', 'All 6 agents · 6 parallel tracks', 'Overnight runs + morning report', 'GitHub, Linear and Slack', 'Instant rollback + audit log'],
    note: 'Extra agent-hours $0.20 each',
  },
  {
    id: 'constellation',
    name: 'Constellation',
    tagline: 'For orgs with their own cloud and compliance.',
    price: null,
    cta: 'Talk to us',
    ctaHref: 'mailto:hello@vesper.dev?subject=Vesper%20Constellation',
    hours: 'Pooled agent-hours',
    features: ['Deploy in your VPC', 'SSO / SAML + SCIM', 'Custom guardrails and policies', 'Audit export to your SIEM', '99.9% SLA · dedicated engineer'],
    note: 'Annual contract · volume pricing',
  },
]

export const planById = (id: PlanId) => PLANS.find((p) => p.id === id) ?? PLANS[0]!

export function billingNote(plan: Plan, billing: Billing) {
  if (!plan.price) return 'Tailored to your volume'
  if (plan.price.monthly === 0) return '50 agent-hours included'
  if (billing === 'yearly') {
    const yearly = plan.price.yearly * 12
    const saved = (plan.price.monthly - plan.price.yearly) * 12
    return `$${yearly.toLocaleString('en-US')} billed yearly · save $${saved}`
  }
  return 'Billed monthly · cancel anytime'
}

/* ------------------------------------------------------------------ */
/* Estimator model (illustrative numbers for the concept)              */
/* ------------------------------------------------------------------ */
export const TICKETS = { min: 5, max: 500, step: 5, initial: 60 } as const
const AGENT_HOURS_PER_TICKET = 3.2
const ENGINEER_HOURS_PER_TICKET = 6
const ENGINEER_RATE = 90
const NIGHT_INCLUDED = 600
const NIGHT_LIMIT = 1400
const OVERAGE = 0.2

export interface Estimate {
  agentHours: number
  engineerHours: number
  /** full-time engineers of capacity (160 h / month each) */
  capacity: number
  value: number
  plan: PlanId
  /** null = custom pricing */
  monthly: number | null
  multiple: number | null
}

export function estimate(tickets: number, billing: Billing): Estimate {
  const agentHours = Math.round(tickets * AGENT_HOURS_PER_TICKET)
  const engineerHours = tickets * ENGINEER_HOURS_PER_TICKET
  const value = engineerHours * ENGINEER_RATE
  const capacity = Math.round((engineerHours / 160) * 10) / 10

  let plan: PlanId = 'constellation'
  let monthly: number | null = null
  if (agentHours <= 50) {
    plan = 'dusk'
    monthly = 0
  } else if (agentHours <= NIGHT_LIMIT) {
    plan = 'night'
    const base = billing === 'yearly' ? 119 : 149
    monthly = Math.round(base + Math.max(0, agentHours - NIGHT_INCLUDED) * OVERAGE)
  }
  const multiple = monthly ? Math.round(value / monthly) : null
  return { agentHours, engineerHours, capacity, value, plan, monthly, multiple }
}
