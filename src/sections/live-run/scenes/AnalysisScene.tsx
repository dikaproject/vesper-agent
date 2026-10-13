import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, WIN, span } from '../phases'
import { StatusIcon } from '../ui/bits'
import { ScreenWindow } from '../ui/ScreenWindow'

/* Graph canvas (centre column) */
const GW = 644
const GH = 646
const CX = 322
const CY = 300
const SWEEP_START = 500
const SWEEP_PERIOD = 3000

interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  impacted: boolean
  files?: number
}

const NODES: GraphNode[] = [
  { id: 'payments', label: 'payments/', x: 322, y: 96, impacted: true, files: 2 },
  { id: 'analytics', label: 'analytics/', x: 516, y: 158, impacted: false },
  { id: 'schema', label: 'db/schema', x: 560, y: 318, impacted: true, files: 1 },
  { id: 'invoices', label: 'ui/invoices', x: 506, y: 486, impacted: true, files: 1 },
  { id: 'jobs', label: 'jobs/', x: 322, y: 548, impacted: true, files: 1 },
  { id: 'emails', label: 'emails/', x: 140, y: 488, impacted: false },
  { id: 'auth', label: 'auth/', x: 92, y: 318, impacted: false },
  { id: 'routes', label: 'api/routes', x: 132, y: 154, impacted: true, files: 2 },
]

/** When the radar sweep (clockwise from 12 o'clock) passes a node. */
const sweepTime = (n: GraphNode) => {
  const deg = (Math.atan2(n.y - CY, n.x - CX) * 180) / Math.PI
  return SWEEP_START + (((deg + 90 + 360) % 360) / 360) * SWEEP_PERIOD
}
const LIT_AT: Record<string, number> = Object.fromEntries(NODES.map((n) => [n.id, sweepTime(n)]))

const CROSS_EDGES: [string, string][] = [
  ['payments', 'routes'],
  ['payments', 'analytics'],
  ['schema', 'jobs'],
  ['auth', 'routes'],
  ['emails', 'jobs'],
]
const byId = (id: string) => NODES.find((n) => n.id === id)

const FILES = [
  { path: 'payments/subscription.ts', impacted: true, heat: 92 },
  { path: 'payments/legacy.ts', impacted: true, heat: 64 },
  { path: 'api/routes/usage.ts', impacted: true, heat: 81 },
  { path: 'api/middleware/meter.ts', impacted: true, heat: 58 },
  { path: 'auth/session.ts', impacted: false, heat: 0 },
  { path: 'db/schema.ts', impacted: true, heat: 70 },
  { path: 'lib/stripe.ts', impacted: false, heat: 0 },
  { path: 'app/invoices/page.tsx', impacted: true, heat: 47 },
  { path: 'emails/receipt.tsx', impacted: false, heat: 0 },
  { path: 'jobs/finalize-invoices.ts', impacted: true, heat: 55 },
  { path: 'analytics/track.ts', impacted: false, heat: 0 },
  { path: 'app/settings/page.tsx', impacted: false, heat: 0 },
]
const ROW_H = 30
const SCAN_START = 400
const SCAN_STEP = 190

export function AnalysisScene({ t }: SceneProps) {
  return (
    <ScreenWindow style={WIN} title="Analyst — impact map · feat/usage-billing" icon={<LogoMark size={13} glow={false} />}>
      <div className="flex h-full">
        <Codebase t={t} />
        <Graph t={t} />
        <Summary t={t} />
      </div>
    </ScreenWindow>
  )
}

function Codebase({ t }: SceneProps) {
  const scanned = Math.min(FILES.length, Math.max(0, Math.floor((t - SCAN_START) / SCAN_STEP) + 1))
  const scanning = scanned < FILES.length
  return (
    <div className="relative w-[270px] shrink-0 border-r border-white/[0.06] bg-ink-900/60 p-4">
      <div className="flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Codebase</p>
        <p className="font-mono text-[10.5px] text-sand-400">1,284 files</p>
      </div>
      <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
        <div className="h-full origin-left rounded-full bg-ember-400 transition-transform duration-300" style={{ transform: `scaleX(${scanned / FILES.length})` }} />
      </div>
      <div className="relative mt-4">
        {scanning && t >= SCAN_START && (
          <motion.div
            className="absolute inset-x-0 top-0 h-[30px] rounded-md bg-linear-to-r from-ember-500/0 via-ember-400/20 to-ember-500/0"
            initial={{ y: 0 }}
            animate={{ y: (FILES.length - 1) * ROW_H }}
            transition={{ duration: ((FILES.length - 1) * SCAN_STEP) / 1000, ease: 'linear' }}
          />
        )}
        {FILES.map((file, i) => {
          const seen = i < scanned
          const hot = seen && file.impacted
          return (
            <div key={file.path} className="relative flex items-center gap-2 px-2 font-mono text-[11px]" style={{ height: ROW_H }}>
              <span className={cn('size-1.5 shrink-0 rounded-full transition-colors duration-300', hot ? 'bg-ember-300 shadow-[0_0_8px_rgba(255,135,72,0.9)]' : seen ? 'bg-sand-600' : 'bg-white/10')} />
              <span className={cn('min-w-0 flex-1 truncate transition-colors duration-300', hot ? 'text-ember-100' : seen ? 'text-sand-400' : 'text-sand-600')}>{file.path}</span>
              <span className="h-1.5 w-10 shrink-0 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full origin-left rounded-full bg-linear-to-r from-ember-600 to-ember-300 transition-transform duration-700"
                  style={{ transform: `scaleX(${hot ? file.heat / 100 : 0})` }}
                />
              </span>
            </div>
          )
        })}
      </div>
      <div className="absolute inset-x-4 bottom-4 rounded-lg border border-white/[0.06] bg-ink-800/80 p-3 font-mono text-[10.5px] text-sand-400">
        <div className="flex items-center gap-2">
          <StatusIcon state={scanning ? 'running' : 'done'} />
          {scanning ? 'Indexing call graph…' : 'Call graph indexed · 38k edges'}
        </div>
      </div>
    </div>
  )
}

function Summary({ t }: SceneProps) {
  const files = NODES.reduce((sum, n) => sum + (n.impacted && t >= (LIT_AT[n.id] ?? 0) ? n.files ?? 0 : 0), 0)
  const showRisk = t >= 3400
  const reported = t >= 5600
  return (
    <div className="relative flex w-[300px] shrink-0 flex-col gap-5 border-l border-white/[0.06] bg-ink-900/60 p-5">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Blast radius</p>
        <p className="mt-2 flex items-baseline gap-2">
          <span className="text-[44px] font-semibold leading-none tracking-[-0.04em] text-sand-50 tabular-nums">{files}</span>
          <span className="text-[13px] text-sand-400">files impacted</span>
        </p>
        <div className="mt-3 grid grid-cols-3 gap-2">
          {[
            ['1', 'migration'],
            ['2', 'public APIs'],
            ['9', 'tests'],
          ].map(([value, label], i) => (
            <div key={label} className="rounded-lg border border-white/[0.06] bg-white/[0.02] p-2" style={{ opacity: t >= 1800 + i * 300 ? 1 : 0.25, transition: 'opacity 400ms' }}>
              <p className="text-[15px] font-semibold text-sand-100">{value}</p>
              <p className="text-[10.5px] text-sand-500">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Risk score</p>
        <div className="relative mx-auto mt-2 h-[118px] w-[240px]">
          <svg viewBox="0 0 240 126" className="absolute inset-0" aria-hidden="true">
            <defs>
              <linearGradient id="risk-arc" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="#4FE0A0" />
                <stop offset="1" stopColor="#FFB27F" />
              </linearGradient>
            </defs>
            <path d="M 30 116 A 90 90 0 0 1 210 116" fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="12" strokeLinecap="round" />
            <motion.path
              d="M 30 116 A 90 90 0 0 1 210 116"
              fill="none"
              stroke="url(#risk-arc)"
              strokeWidth="12"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: showRisk ? 0.18 : 0 }}
              transition={{ duration: 1.2, ease: EASE_OUT }}
            />
          </svg>
          <div className="absolute inset-x-0 bottom-1 text-center">
            <p className="text-[22px] font-semibold text-mint-300">{showRisk ? 'Low' : '—'}</p>
            <p className="font-mono text-[10.5px] text-sand-500">{showRisk ? '0.18 · safe to proceed' : 'scoring…'}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Hotspots</p>
        {[
          { at: 4200, file: 'payments/subscription.ts', note: 'tightly coupled to billing' },
          { at: 4700, file: 'api/routes/usage.ts', note: 'public endpoint — keep v1 stable' },
        ]
          .filter((h) => t >= h.at)
          .map((h) => (
            <motion.div key={h.file} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.45, ease: EASE_OUT }} className="rounded-lg border border-ember-400/20 bg-ember-500/[0.06] p-2.5">
              <p className="font-mono text-[11px] text-ember-100">{h.file}</p>
              <p className="mt-0.5 text-[11px] text-sand-400">{h.note}</p>
            </motion.div>
          ))}
      </div>

      <AnimatePresence>
        {reported && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-auto flex items-center gap-2 rounded-lg border border-mint-400/25 bg-mint-400/[0.06] p-3 text-[12px] text-mint-300">
            <StatusIcon state="done" />
            Impact report sent to Builder
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function Graph({ t }: SceneProps) {
  const scanDone = t >= SWEEP_START + SWEEP_PERIOD + 200
  return (
    <div className="relative shrink-0 overflow-hidden bg-[radial-gradient(60%_55%_at_50%_46%,rgba(255,108,44,0.07),transparent)]" style={{ width: GW, height: GH }}>
      <div className="bg-dots absolute inset-0 opacity-25" />

      {/* radar sweep (rotated with transform — compositor only) */}
      {t >= SWEEP_START && (
        <div
          className="absolute size-[580px] animate-spin-slow rounded-full [animation-duration:3s] transition-opacity duration-1000"
          style={{
            left: CX - 290,
            top: CY - 290,
            opacity: scanDone ? 0.35 : 1,
            background: 'conic-gradient(from 0deg, transparent 0deg 292deg, rgba(255,135,72,0.06) 320deg, rgba(255,135,72,0.34) 360deg)',
          }}
        />
      )}

      <svg width={GW} height={GH} viewBox={`0 0 ${GW} ${GH}`} className="absolute inset-0" aria-hidden="true">
        {[110, 200, 285].map((r) => (
          <circle key={r} cx={CX} cy={CY} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeDasharray="2 6" />
        ))}
        {CROSS_EDGES.map(([a, b]) => {
          const na = byId(a)
          const nb = byId(b)
          if (!na || !nb) return null
          return <line key={`${a}-${b}`} x1={na.x} y1={na.y} x2={nb.x} y2={nb.y} stroke="rgba(255,255,255,0.07)" strokeWidth="1" />
        })}
        {NODES.map((n) => {
          const lit = n.impacted && t >= (LIT_AT[n.id] ?? 0)
          return (
            <line
              key={n.id}
              x1={CX}
              y1={CY}
              x2={n.x}
              y2={n.y}
              strokeWidth={lit ? 1.5 : 1}
              stroke={lit ? 'rgba(255,135,72,0.75)' : 'rgba(255,255,255,0.1)'}
              style={{ transition: 'stroke 500ms ease' }}
            />
          )
        })}
      </svg>

      {/* data pulses along impacted edges */}
      {NODES.filter((n) => n.impacted && t >= (LIT_AT[n.id] ?? 0) + 200).map((n, i) => (
        <span
          key={n.id}
          className="comet-dot"
          style={{ offsetPath: `path('M ${CX} ${CY} L ${n.x} ${n.y}')`, width: 30, '--dur': '1.5s', '--delay': `${i * 0.18}s` } as CSSProperties}
        />
      ))}

      {/* centre: the new module */}
      <div className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: CX, top: CY }}>
        <span className="absolute left-1/2 top-1/2 size-24 -translate-x-1/2 -translate-y-1/2 animate-ping-slow rounded-full border border-ember-400/40" />
        <div className="relative flex flex-col items-center rounded-2xl border border-dashed border-ember-300/70 bg-ink-800 px-4 py-2.5 shadow-[0_0_40px_-6px_rgba(255,108,44,0.6)]">
          <span className="font-mono text-[13px] font-semibold text-ember-100">billing/</span>
          <span className="font-mono text-[9.5px] uppercase tracking-[0.18em] text-ember-300/80">new module</span>
        </div>
      </div>

      {NODES.map((n) => {
        const lit = n.impacted && t >= (LIT_AT[n.id] ?? 0)
        return (
          <div key={n.id} className="absolute -translate-x-1/2 -translate-y-1/2" style={{ left: n.x, top: n.y }}>
            {lit && (
              <motion.span
                className="absolute inset-0 rounded-full border border-ember-300"
                initial={{ scale: 0.8, opacity: 0.9 }}
                animate={{ scale: 1.9, opacity: 0 }}
                transition={{ duration: 0.9, ease: 'easeOut' }}
              />
            )}
            <div
              className={cn(
                'relative flex items-center gap-1.5 whitespace-nowrap rounded-full border px-3 py-1.5 font-mono text-[11px] transition-[background-color,border-color,color,box-shadow] duration-500',
                lit
                  ? 'border-ember-400/60 bg-ember-500/15 text-ember-100 shadow-[0_0_24px_-4px_rgba(255,108,44,0.75)]'
                  : 'border-white/10 bg-ink-800 text-sand-400',
              )}
            >
              <span className={cn('size-1.5 rounded-full', lit ? 'bg-ember-300' : 'bg-sand-600')} />
              {n.label}
              {lit && <span className="rounded bg-ember-400/20 px-1 text-[9.5px] text-ember-200">{n.files}</span>}
            </div>
          </div>
        )
      })}

      <div className="absolute bottom-4 left-4 flex items-center gap-4 font-mono text-[10.5px] text-sand-500">
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-ember-300" />
          impacted
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-1.5 rounded-full bg-sand-600" />
          unaffected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="size-2 rounded-full border border-dashed border-ember-300" />
          new
        </span>
      </div>
      <div className="absolute right-4 top-4 font-mono text-[10.5px] text-sand-500">
        sweep {Math.round(span(t, SWEEP_START, SWEEP_START + SWEEP_PERIOD) * 100)}%
      </div>
    </div>
  )
}
