import { isEmail } from '@/lib/utils'

export { isEmail }
export type AuthMode = 'login' | 'register'
export type PlanParam = 'dusk' | 'night'

export interface PasswordCheck {
  id: 'length' | 'case' | 'number' | 'symbol'
  label: string
  ok: boolean
}

export function passwordChecks(value: string): PasswordCheck[] {
  return [
    { id: 'length', label: '8+ chars', ok: value.length >= 8 },
    { id: 'case', label: 'Mixed case', ok: /[a-z]/.test(value) && /[A-Z]/.test(value) },
    { id: 'number', label: 'Number', ok: /\d/.test(value) },
    { id: 'symbol', label: 'Symbol', ok: /[^A-Za-z0-9]/.test(value) },
  ]
}

/** 0–4. Anything shorter than 8 characters tops out at "weak". */
export function passwordScore(value: string) {
  if (!value) return 0
  const passed = passwordChecks(value).filter((c) => c.ok).length
  const score = value.length >= 14 ? Math.max(passed, 3) : passed
  return value.length < 8 ? Math.min(score, 1) : Math.min(score, 4)
}

export const SCORE_LABEL = ['Too short', 'Weak', 'Fair', 'Good', 'Strong'] as const

/** Agents "briefed" by the register form: name → 2, email → 2, strong password → 2. */
export function briefingProgress(name: string, email: string, password: string) {
  const score = passwordScore(password)
  return (name.trim().length >= 2 ? 2 : 0) + (isEmail(email) ? 2 : 0) + (score >= 3 ? 2 : score >= 2 ? 1 : 0)
}

export const PLAN_CHIP: Record<PlanParam, { label: string; note: string }> = {
  dusk: { label: 'Dusk', note: 'Free forever · 50 agent-hours' },
  night: { label: 'Night Shift', note: '14-day trial · no card' },
}

export const parsePlan = (value: string | null): PlanParam | null => (value === 'dusk' || value === 'night' ? value : null)

export const MODE_COPY: Record<AuthMode, { title: string; description: string; doc: string }> = {
  login: {
    title: 'Welcome back.\n*Your crew kept working.*',
    description: 'Sign in to review what shipped overnight, approve the next plan and hand off a fresh batch of tickets.',
    doc: 'Sign in · Vesper',
  },
  register: {
    title: 'Assemble your crew.\n*Ship while you sleep.*',
    description: 'Create a workspace, connect a repository and give six agents their first brief. It takes about four minutes.',
    doc: 'Create your account · Vesper',
  },
}

/** Simulated network latency for the demo (nothing is sent anywhere). */
export const DEMO_LATENCY = 1300
