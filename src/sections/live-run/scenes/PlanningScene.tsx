import { Check, GitBranch } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { LogoMark } from '@/components/brand/Logo'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, typedChars } from '../phases'
import { AgentCursor, type Waypoint } from '../ui/AgentCursor'
import { StepRow, stepState } from '../ui/bits'
import { AgentPanel, CodeWindow, type FileNode } from '../ui/CodeWindow'

const PLAN = `# Plan — usage-based billing
> Source: brief.md · 14 sources · scope agreed

## M1 · Data model
- [ ] Add \`usage_records\` table + migration
- [ ] Meter \`/v1/*\` calls in API middleware
- [ ] Backfill 90 days of usage

## M2 · Billing engine
- [ ] Proration calculator (mid-cycle)
- [ ] Idempotent Stripe webhooks
- [ ] Finalize invoices nightly

## M3 · Product UI
- [ ] /billing usage chart + invoices
- [ ] Usage alerts at 80% and 100%

**Estimate:** ~42 min · 3 parallel tracks`

const TYPE_START = 500
const TYPE_END = 5000
const APPROVE_AT = 6000

const FILES: FileNode[] = [
  { id: 'vesper', name: '.vesper', depth: 0, folder: true, open: true },
  { id: 'brief', name: 'brief.md', depth: 1 },
  { id: 'src', name: 'src', depth: 0, folder: true, open: true },
  { id: 'app', name: 'app', depth: 1, folder: true },
  { id: 'api', name: 'api', depth: 1, folder: true },
  { id: 'db', name: 'db', depth: 1, folder: true },
  { id: 'payments', name: 'payments', depth: 1, folder: true },
  { id: 'tests', name: 'tests', depth: 0, folder: true },
  { id: 'plan', name: 'PLAN.md', depth: 0, badge: 'U', at: 300, active: true },
  { id: 'pkg', name: 'package.json', depth: 0 },
  { id: 'readme', name: 'README.md', depth: 0 },
]

const YOU: Waypoint[] = [
  { at: 4800, x: 1200, y: 720 },
  { at: 5300, x: 1130, y: 640 },
  { at: APPROVE_AT, x: 1028, y: 506, click: true },
  { at: 7200, x: 1070, y: 580 },
]

function inline(text: string) {
  return text
    .split(/(`[^`]+`|\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part, i) => {
      if (part.length > 1 && part.startsWith('`') && part.endsWith('`'))
        return <span key={i} className="text-[#a9dba0]">{part}</span>
      if (part.length > 3 && part.startsWith('**') && part.endsWith('**'))
        return <span key={i} className="font-semibold text-sand-50">{part}</span>
      return <span key={i}>{part}</span>
    })
}

function MdLine({ text }: { text: string }) {
  if (text.startsWith('# ')) return <span className="font-semibold text-ember-300">{text}</span>
  if (text.startsWith('## ')) return <span className="font-semibold text-ember-200">{text}</span>
  if (text.startsWith('> ')) return <span className="italic text-sand-500">{text}</span>
  if (text.startsWith('- [ ] '))
    return (
      <span className="text-sand-200">
        <span className="text-ember-400/80">- [ ] </span>
        {inline(text.slice(6))}
      </span>
    )
  return <span className="text-sand-200">{inline(text)}</span>
}

function MarkdownEditor({ typed }: { typed: number }) {
  const lines = PLAN.slice(0, typed).split('\n')
  const typing = typed < PLAN.length
  return (
    <div className="relative h-full">
      <pre className="h-full overflow-hidden py-3 font-mono text-[12.5px] leading-[1.8]">
        {lines.map((line, i) => (
          <div key={i} className={cn('flex', typing && i === lines.length - 1 && 'bg-white/[0.03]')}>
            <span className="w-12 shrink-0 select-none pr-4 text-right text-sand-600">{i + 1}</span>
            <span className="whitespace-pre">
              <MdLine text={line} />
              {typing && i === lines.length - 1 && (
                <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[0.18em] animate-blink bg-ember-300" />
              )}
            </span>
          </div>
        ))}
      </pre>
      {/* minimap */}
      <div className="absolute inset-y-3 right-3 w-14 opacity-70">
        {lines.map((line, i) => (
          <span
            key={i}
            className={cn('mb-[3px] block h-[2px] rounded-full', line.startsWith('#') ? 'bg-ember-400/70' : 'bg-sand-500/40')}
            style={{ width: `${Math.min(100, line.length * 2.2)}%` }}
          />
        ))}
      </div>
    </div>
  )
}

export function PlanningScene({ t }: SceneProps) {
  const typed = typedChars(t, TYPE_START, TYPE_END, PLAN.length)
  const lines = PLAN.slice(0, typed).split('\n').length
  const ready = t >= 5100
  const approved = t >= APPROVE_AT + 120

  const side = (
    <AgentPanel name="Architect" role="planning">
      <div className="absolute inset-x-3.5 top-3.5 rounded-xl border border-white/[0.07] bg-white/[0.025] p-3">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">From Scout</p>
        <p className="mt-1.5 text-[12px] text-sand-200">brief.md · 14 sources · 4 findings</p>
      </div>
      <div className="absolute inset-x-3.5 top-[96px] flex flex-col gap-3">
        <StepRow label="Read brief.md" state={stepState(t, 300, 900)} />
        <StepRow label="Draft milestones" state={stepState(t, 900, 3200)} meta="3" />
        <StepRow label="Break work into tasks" state={stepState(t, 2400, 4600)} meta="9" />
        <StepRow label="Estimate effort" state={stepState(t, 4400, 5000)} meta="~42m" />
      </div>
      <AnimatePresence>
        {ready && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: EASE_OUT }}
            className={cn(
              'absolute inset-x-3.5 top-[300px] rounded-xl border p-3.5 transition-colors duration-500',
              approved ? 'border-mint-400/30 bg-mint-400/[0.06]' : 'border-ember-400/35 bg-ember-500/[0.07]',
            )}
          >
            <p className="text-[13px] font-medium text-sand-50">{approved ? 'Plan approved' : 'Plan ready for review'}</p>
            <p className="mt-1 font-mono text-[11px] text-sand-400">9 tasks · 3 milestones · ~42 min</p>
            {approved ? (
              <p className="mt-3 flex h-[30px] items-center gap-2 text-[12px] text-mint-300">
                <Check className="size-3.5" strokeWidth={3} />
                Approved by you · handing off to Analyst
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <span className="flex h-[30px] w-[108px] items-center justify-center rounded-lg bg-[linear-gradient(180deg,#ffb27f,#f0601f)] text-[12px] font-medium text-ink-950">
                  Approve plan
                </span>
                <span className="flex h-[30px] items-center rounded-lg px-3 text-[12px] text-sand-300 ring-1 ring-white/10">Edit</span>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </AgentPanel>
  )

  return (
    <>
      <CodeWindow
        t={t}
        title="PLAN.md — acme-web-app"
        files={FILES}
        tabs={[
          { name: 'brief.md' },
          { name: 'PLAN.md', active: true, dirty: t < TYPE_END + 200, at: 350 },
        ]}
        breadcrumb={['acme-web-app', 'PLAN.md']}
        side={side}
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
            <span>{approved ? 'Plan approved ✓' : ready ? 'Awaiting your approval' : 'Architect: drafting plan…'}</span>
            <span>Ln {lines}, Col 1</span>
            <span>Markdown</span>
          </>
        }
      >
        {t >= 350 && <MarkdownEditor typed={typed} />}
        <AnimatePresence>
          {approved && (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT, delay: 0.25 }}
              className="absolute bottom-3 right-3 flex w-[330px] items-center gap-3 rounded-lg border border-white/10 bg-ink-750 p-3 shadow-[0_18px_40px_-14px_rgba(0,0,0,0.9)]"
            >
              <span className="grid size-7 place-items-center rounded-md bg-ember-500/15 ring-1 ring-ember-400/30">
                <LogoMark size={14} glow={false} />
              </span>
              <div className="min-w-0">
                <p className="text-[12px] text-sand-100">Plan approved</p>
                <p className="truncate text-[11px] text-sand-500">Analyst is mapping the impact…</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </CodeWindow>
      {t >= 4800 && <AgentCursor t={t} path={YOU} label="You" tone="sand" />}
    </>
  )
}
