import { GitBranch, GitCommitHorizontal } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { TypedCode } from '@/components/code/TypedCode'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, typedChars } from '../phases'
import { StepRow, stepState } from '../ui/bits'
import { AgentPanel, CodeWindow, type FileNode } from '../ui/CodeWindow'

const USAGE_TS = `import { stripe } from '@/lib/stripe'
import { db } from '@/db'
import { BillingError } from './errors'

export async function recordUsage(orgId: string, units: number) {
  const sub = await db.subscription.findActive(orgId)
  if (!sub) throw new BillingError('NO_ACTIVE_PLAN')

  await stripe.billing.meterEvents.create({
    event_name: 'api_requests',
    payload: { stripe_customer_id: sub.customerId, value: String(units) },
  })

  return { ok: true, billed: units * sub.unitPrice }
}`

const PRORATION_TS = `import type { Plan } from './types'

/** Credit unused time, charge the rest of the cycle. */
export function prorate(from: Plan, to: Plan, daysLeft: number, cycle = 30) {
  const ratio = daysLeft / cycle
  const credit = Math.round(from.price * ratio)
  const charge = Math.floor(to.price * ratio)
  return { credit, charge, net: charge - credit }
}`

const SWITCH_AT = 4500
const USAGE = { start: 600, end: 4200 }
const PRORATION = { start: 4800, end: 6600 }
const COMMIT_AT = 6900

const all = (code: string) => Array.from({ length: code.split('\n').length }, (_, i) => i + 1)

const TERMINAL = [
  { at: 500, text: 'builder › created src/billing/usage.ts', tone: 'muted' },
  { at: 4600, text: 'builder › created src/billing/proration.ts', tone: 'muted' },
  { at: 5500, text: 'builder › created src/billing/webhooks.ts', tone: 'muted' },
  { at: 6100, text: 'builder › created db/migrations/0042_usage.sql', tone: 'muted' },
  { at: COMMIT_AT, text: '$ git commit -m "feat(billing): metered usage + proration"', tone: 'cmd' },
  { at: COMMIT_AT + 350, text: '[feat/usage-billing 3f9a2c1] 4 files changed, 312 insertions(+)', tone: 'ok' },
] as const

const filesAt = (t: number): FileNode[] => [
  { id: 'src', name: 'src', depth: 0, folder: true, open: true },
  { id: 'app', name: 'app', depth: 1, folder: true },
  { id: 'api', name: 'api', depth: 1, folder: true },
  { id: 'billing', name: 'billing', depth: 1, folder: true, open: true, at: 200 },
  { id: 'usage', name: 'usage.ts', depth: 2, badge: 'A', at: 500, active: t < SWITCH_AT },
  { id: 'proration', name: 'proration.ts', depth: 2, badge: 'A', at: 4600, active: t >= SWITCH_AT },
  { id: 'webhooks', name: 'webhooks.ts', depth: 2, badge: 'A', at: 5500 },
  { id: 'db', name: 'db', depth: 1, folder: true, open: true },
  { id: 'migrations', name: 'migrations', depth: 2, folder: true, open: true },
  { id: 'm41', name: '0041_orgs.sql', depth: 3 },
  { id: 'm42', name: '0042_usage.sql', depth: 3, badge: 'A', at: 6100 },
  { id: 'payments', name: 'payments', depth: 1, folder: true },
  { id: 'plan', name: 'PLAN.md', depth: 0 },
  { id: 'pkg', name: 'package.json', depth: 0 },
]

export function DevelopmentScene({ t }: SceneProps) {
  const onUsage = t < SWITCH_AT
  const added = Math.round(312 * Math.min(1, Math.max(0, (t - USAGE.start) / (PRORATION.end - USAGE.start))))
  const committed = t >= COMMIT_AT + 350

  const bottom = (
    <div className="h-[132px] shrink-0 border-t border-white/[0.06] bg-ink-900">
      <div className="flex h-8 items-center gap-5 border-b border-white/[0.05] px-4 font-mono text-[10.5px] uppercase tracking-[0.12em] text-sand-500">
        <span>Problems</span>
        <span>Output</span>
        <span className="border-b border-ember-400 pb-[7px] pt-2 text-sand-100">Terminal</span>
      </div>
      <div className="flex flex-col gap-1 px-4 py-2.5 font-mono text-[11.5px]">
        {TERMINAL.filter((line) => t >= line.at)
          .slice(-4)
          .map((line) => (
            <motion.p
              key={line.text}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35, ease: EASE_OUT }}
              className={cn('truncate', line.tone === 'cmd' ? 'text-sand-100' : line.tone === 'ok' ? 'text-mint-300' : 'text-sand-400')}
            >
              {line.text}
            </motion.p>
          ))}
      </div>
    </div>
  )

  const side = (
    <AgentPanel name="Builder" role="coding">
      <div className="absolute inset-x-3.5 top-3.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">From Analyst</p>
        <p className="mt-1.5 text-[12px] text-sand-200">7 files impacted · risk low · 1 migration</p>
      </div>
      <div className="absolute inset-x-3.5 top-[96px] flex flex-col gap-3">
        <StepRow label="M1 · record metered usage" state={stepState(t, USAGE.start, USAGE.end)} />
        <StepRow label="M2 · proration calculator" state={stepState(t, PRORATION.start, PRORATION.end)} />
        <StepRow label="Webhooks + migration" state={stepState(t, 5500, 6400)} />
        <StepRow label="Commit to feat/usage-billing" state={stepState(t, COMMIT_AT, COMMIT_AT + 350)} />
      </div>
      <div className="absolute inset-x-3.5 top-[250px] grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
          <p className="text-[18px] font-semibold tabular-nums text-mint-300">+{added}</p>
          <p className="text-[10.5px] text-sand-500">lines added</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2.5">
          <p className="text-[18px] font-semibold tabular-nums text-sand-100">{filesAt(t).filter((f) => f.badge && t >= (f.at ?? 0)).length}</p>
          <p className="text-[10.5px] text-sand-500">files created</p>
        </div>
      </div>
      <AnimatePresence>
        {committed && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: EASE_OUT }}
            className="absolute inset-x-3.5 top-[340px] rounded-xl border border-mint-400/25 bg-mint-400/[0.06] p-3"
          >
            <p className="flex items-center gap-2 font-mono text-[11.5px] text-mint-300">
              <GitCommitHorizontal className="size-4" />
              3f9a2c1
            </p>
            <p className="mt-1 text-[12px] text-sand-200">feat(billing): metered usage + proration</p>
            <p className="mt-1 font-mono text-[10.5px] text-sand-500">→ handing off to Sentinel for QA</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AgentPanel>
  )

  return (
    <CodeWindow
      t={t}
      title={`${onUsage ? 'usage.ts' : 'proration.ts'} — acme-web-app`}
      files={filesAt(t)}
      tabs={[
        { name: 'PLAN.md' },
        { name: 'usage.ts', active: onUsage, dirty: t < USAGE.end, at: 550 },
        { name: 'proration.ts', active: !onUsage, dirty: t < PRORATION.end, at: SWITCH_AT },
      ]}
      breadcrumb={['src', 'billing', onUsage ? 'usage.ts' : 'proration.ts']}
      side={side}
      bottom={bottom}
      statusLeft={
        <>
          <span className="flex items-center gap-1">
            <GitBranch className="size-3" />
            feat/usage-billing
          </span>
          <span>✓ 0 ⚠ 0</span>
        </>
      }
      statusRight={
        <>
          <span>{committed ? 'Committed 3f9a2c1 ✓' : `Builder: writing ${onUsage ? 'usage.ts' : 'proration.ts'}…`}</span>
          <span>TypeScript</span>
          <span>Prettier ✓</span>
        </>
      }
    >
      <AnimatePresence mode="wait" initial={false}>
        {t >= 550 && (
          <motion.div
            key={onUsage ? 'usage' : 'proration'}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="h-full"
          >
            {onUsage ? (
              <TypedCode code={USAGE_TS} typed={typedChars(t, USAGE.start, USAGE.end, USAGE_TS.length + 1)} addedLines={all(USAGE_TS)} className="py-3 text-[12.5px]" />
            ) : (
              <TypedCode code={PRORATION_TS} typed={typedChars(t, PRORATION.start, PRORATION.end, PRORATION_TS.length + 1)} addedLines={all(PRORATION_TS)} className="py-3 text-[12.5px]" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </CodeWindow>
  )
}
