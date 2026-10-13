import { AnimatePresence, motion } from 'motion/react'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, WIN, typedChars } from '../phases'
import { StatusIcon, brailleFrame } from '../ui/bits'
import { ScreenWindow, TrafficLights } from '../ui/ScreenWindow'

type Tone = 'dim' | 'ok' | 'fail' | 'ember' | 'del' | 'add' | 'sum'

const COMMAND = 'pnpm test --coverage'
const PATCH_START = 2650
const FIXED_AT = 4850
const GREEN_AT = 5850
const COVERAGE_AT = 6350

const LINES: { at: number; tone: Tone; text: string; tests?: number }[] = [
  { at: 1250, tone: 'dim', text: ' RUN  v3.2.0  ~/acme-web-app' },
  { at: 1550, tone: 'ok', text: ' ✓ src/billing/usage.spec.ts  (24 tests)  412ms', tests: 24 },
  { at: 1850, tone: 'ok', text: ' ✓ src/billing/webhooks.spec.ts  (17 tests)  238ms', tests: 17 },
  { at: 2150, tone: 'ok', text: ' ✓ src/api/routes/usage.spec.ts  (21 tests)  187ms', tests: 21 },
  { at: 2550, tone: 'fail', text: ' ✗ src/billing/proration.spec.ts › mid-cycle upgrade' },
  { at: 2650, tone: 'dim', text: '     AssertionError: expected 1839 to equal 1838' },
  { at: 3250, tone: 'ember', text: ' ⟳ sentinel  patching src/billing/proration.ts:6' },
  { at: 3550, tone: 'del', text: '     - const credit = Math.round(from.price * ratio)' },
  { at: 3750, tone: 'add', text: '     + const credit = Math.floor(from.price * ratio)' },
  { at: 4250, tone: 'dim', text: ' ↻ re-running 1 failed suite' },
  { at: FIXED_AT, tone: 'ok', text: ' ✓ src/billing/proration.spec.ts  (18 tests)  296ms', tests: 18 },
  { at: 5150, tone: 'ok', text: ' ✓ e2e/invoices.spec.ts  (31 tests)  8.1s', tests: 31 },
  { at: 5450, tone: 'ok', text: ' ✓ e2e/checkout.spec.ts  (31 tests)  6.4s', tests: 31 },
  { at: GREEN_AT, tone: 'sum', text: ' Test Files  6 passed (6)' },
  { at: 6000, tone: 'sum', text: '      Tests  142 passed (142)' },
  { at: 6150, tone: 'sum', text: '   Duration  38.2s' },
]

const TONE: Record<Tone, string> = {
  dim: 'text-sand-500',
  ok: 'text-mint-300',
  fail: 'text-coral-400',
  ember: 'text-ember-300',
  del: 'text-coral-400/90 bg-coral-400/[0.07]',
  add: 'text-mint-300 bg-mint-400/[0.07]',
  sum: 'text-sand-100',
}

const SUITES = [
  { name: 'usage.spec.ts', doneAt: 1550 },
  { name: 'webhooks.spec.ts', doneAt: 1850 },
  { name: 'routes/usage.spec.ts', doneAt: 2150 },
  { name: 'proration.spec.ts', doneAt: FIXED_AT, failAt: 2550 },
  { name: 'e2e/invoices.spec.ts', doneAt: 5150 },
  { name: 'e2e/checkout.spec.ts', doneAt: 5450 },
]

export function QAScene({ t }: SceneProps) {
  const header = (
    <div className="flex h-9 shrink-0 items-center gap-3 border-b border-white/[0.06] bg-ink-800 px-3.5">
      <TrafficLights />
      <div className="ml-4 flex items-center gap-1 text-[11.5px]">
        {['sentinel — tests', 'builder', 'pilot'].map((tab, i) => (
          <span key={tab} className={cn('rounded-md px-3 py-1', i === 0 ? 'bg-ink-700 text-sand-100' : 'text-sand-500')}>
            {tab}
          </span>
        ))}
      </div>
      <span className="ml-auto font-mono text-[10.5px] text-sand-500">zsh · ~/acme-web-app</span>
    </div>
  )

  const command = COMMAND.slice(0, typedChars(t, 300, 1000, COMMAND.length))
  const running = t >= 1250 && t < GREEN_AT
  const fixing = t >= PATCH_START && t < 4250

  return (
    <ScreenWindow style={WIN} header={header}>
      <div className="flex h-full">
        <div className="relative min-w-0 flex-1 bg-[#0b0a09] px-6 py-5 font-mono text-[13px] leading-[1.7]">
          <p className="whitespace-pre text-sand-100">
            <span className="text-ember-300">~/acme-web-app</span>
            <span className="text-sand-500"> (feat/usage-billing)</span>
            <span className="text-mint-300"> $ </span>
            {command}
            {t < 1250 && <span className="ml-px inline-block h-[1.05em] w-[7px] translate-y-[0.15em] animate-blink bg-sand-200" />}
          </p>
          {LINES.filter((line) => t >= line.at).map((line) => (
            <motion.p
              key={line.text}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE_OUT }}
              className={cn('whitespace-pre rounded-sm', TONE[line.tone], line.tone === 'sum' && 'font-medium')}
            >
              {line.text}
            </motion.p>
          ))}
          {t >= COVERAGE_AT && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-3 whitespace-pre text-sand-100">
              {'   Coverage  96.4%'}
              <span className="h-2.5 w-56 overflow-hidden rounded-full bg-white/[0.07]">
                <motion.span
                  className="block h-full origin-left rounded-full bg-linear-to-r from-mint-500 to-mint-300"
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 0.964 }}
                  transition={{ duration: 0.9, ease: EASE_OUT }}
                />
              </span>
            </motion.p>
          )}
          {running && (
            <p className={cn('mt-1', fixing ? 'text-ember-300' : 'text-sand-400')}>
              {brailleFrame(t)} {fixing ? 'sentinel is fixing a failing test…' : 'running tests…'}
            </p>
          )}
        </div>
        <QASummary t={t} />
      </div>
    </ScreenWindow>
  )
}

function QASummary({ t }: SceneProps) {
  const passed = LINES.reduce((sum, line) => sum + (line.tests && t >= line.at ? line.tests : 0), 0)
  const failed = t >= 2550 && t < FIXED_AT ? 1 : 0
  const green = t >= GREEN_AT
  const status = green
    ? { label: 'All green', cls: 'bg-mint-400/12 text-mint-300 ring-mint-400/30' }
    : failed
      ? { label: '1 failing', cls: 'bg-coral-400/12 text-coral-400 ring-coral-400/30' }
      : { label: t >= 1250 ? 'Running' : 'Starting', cls: 'bg-ember-500/12 text-ember-200 ring-ember-400/30' }
  const R = 46
  const C = 2 * Math.PI * R

  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-5 border-l border-white/[0.06] bg-ink-900/70 p-5">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Test run</p>
        <span className={cn('rounded-full px-2 py-0.5 text-[10.5px] ring-1 ring-inset transition-colors duration-300', status.cls)}>{status.label}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className="text-[24px] font-semibold tabular-nums text-mint-300">{passed}</p>
          <p className="text-[10.5px] text-sand-500">passed</p>
        </div>
        <div className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
          <p className={cn('text-[24px] font-semibold tabular-nums', failed ? 'text-coral-400' : 'text-sand-300')}>{failed}</p>
          <p className="text-[10.5px] text-sand-500">failed</p>
        </div>
      </div>
      <div className="flex flex-col gap-2.5">
        {SUITES.map((suite) => {
          const state = t >= suite.doneAt ? 'done' : suite.failAt !== undefined && t >= suite.failAt ? 'failed' : t >= 1250 ? 'running' : 'pending'
          return (
            <div key={suite.name} className="flex items-center gap-2.5 font-mono text-[11px]">
              <StatusIcon state={state} />
              <span className={cn('truncate', state === 'failed' ? 'text-coral-400' : state === 'done' ? 'text-sand-300' : 'text-sand-500')}>{suite.name}</span>
            </div>
          )
        })}
      </div>
      <div className="mt-auto flex items-center gap-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
        <svg viewBox="0 0 120 120" className="size-[84px] -rotate-90" aria-hidden="true">
          <circle cx="60" cy="60" r={R} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="10" />
          <motion.circle
            cx="60"
            cy="60"
            r={R}
            fill="none"
            stroke="#4FE0A0"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={C}
            initial={{ strokeDashoffset: C }}
            animate={{ strokeDashoffset: t >= COVERAGE_AT ? C * (1 - 0.964) : C }}
            transition={{ duration: 1.1, ease: EASE_OUT }}
          />
        </svg>
        <div>
          <p className="text-[20px] font-semibold text-sand-50">{t >= COVERAGE_AT ? '96.4%' : '—'}</p>
          <p className="text-[11px] text-sand-500">line coverage</p>
          <AnimatePresence>
            {green && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-1 font-mono text-[10.5px] text-mint-300">
                → cleared for deploy
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
