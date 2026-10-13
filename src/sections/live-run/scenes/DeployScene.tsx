import { ArrowLeft, ArrowRight, Check, Lock, RotateCw, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { CSSProperties } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, WIN, span } from '../phases'
import { AgentCursor, type Waypoint } from '../ui/AgentCursor'
import { StepRow, stepState } from '../ui/bits'
import { ScreenWindow, TrafficLights } from '../ui/ScreenWindow'
import { LiveSite } from './LiveSite'

const OPEN_SITE = 3900
const TOAST_AT = 5200
const HOVER_AT = 8300

const STEPS = [
  { label: 'Build', meta: 'vite build · 2,347 modules', start: 0, end: 700, time: '14.2s' },
  { label: 'Upload artifacts', meta: '2.1 MB → edge storage', start: 700, end: 1200, time: '1.1s' },
  { label: 'Canary · 10% traffic', meta: 'p95 182ms · errors 0.00%', start: 1200, end: 2200, time: '60s' },
  { label: 'Promote · 100%', meta: '5 regions', start: 2200, end: 3500, time: '41s' },
]

const REGIONS = ['iad1 · Washington', 'fra1 · Frankfurt', 'sin1 · Singapore', 'gru1 · São Paulo', 'syd1 · Sydney'].map((name, i) => ({
  name,
  start: 2200 + i * 120,
  end: 2800 + i * 170,
}))

const LOGS = [
  { at: 250, text: 'build started · cache hit 82%' },
  { at: 900, text: 'artifacts uploaded · sha 9c41e2a' },
  { at: 1500, text: 'canary 10% · p95 182ms · 0 errors' },
  { at: 2300, text: 'promoting v2.4.0 → 100%' },
  { at: 3500, text: 'all regions healthy · rollback ready' },
]

const YOU: Waypoint[] = [
  { at: 6600, x: 1230, y: 730 },
  { at: HOVER_AT, x: 742, y: 506 },
  { at: 10400, x: 760, y: 516 },
]

/* Isometric rack geometry */
const SLABS = 5
const slabY = (k: number) => 236 - k * 34

function ServerRack({ t }: SceneProps) {
  const allLive = t >= (REGIONS[REGIONS.length - 1]?.end ?? 0)
  const receiving = t >= 1200 && t < 3500
  return (
    <div className="relative h-[330px] w-[320px]">
      <div className="absolute left-1/2 top-[12px] h-24 w-56 -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.28),transparent)] transition-opacity duration-700" style={{ opacity: allLive ? 1 : 0.35 }} />
      <svg viewBox="0 0 320 330" className="absolute inset-0" aria-hidden="true">
        <defs>
          <linearGradient id="rack-top" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#3d3029" />
            <stop offset="1" stopColor="#16120f" />
          </linearGradient>
          <linearGradient id="rack-l" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#1d1714" />
            <stop offset="1" stopColor="#0b0908" />
          </linearGradient>
          <linearGradient id="rack-r" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#2b231d" />
            <stop offset="1" stopColor="#110e0c" />
          </linearGradient>
          <linearGradient id="rack-beam" x1="0" y1="1" x2="0" y2="0">
            <stop offset="0" stopColor="#FF9A5C" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FF9A5C" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect x="138" y="0" width="24" height="100" fill="url(#rack-beam)" style={{ opacity: allLive ? 1 : 0, transition: 'opacity 700ms ease' }} />
        {Array.from({ length: SLABS }, (_, k) => {
          const y = slabY(k)
          const region = REGIONS[k]
          const live = region ? t >= region.end : false
          const syncing = region ? t >= region.start && !live : false
          return (
            <g key={k}>
              <path d={`M66 ${y} L150 ${y + 42} L150 ${y + 64} L66 ${y + 22} Z`} fill="url(#rack-l)" />
              <path d={`M150 ${y + 42} L234 ${y} L234 ${y + 22} L150 ${y + 64} Z`} fill="url(#rack-r)" />
              <path d={`M150 ${y - 42} L234 ${y} L150 ${y + 42} L66 ${y} Z`} fill="url(#rack-top)" stroke="rgba(255,214,186,0.18)" strokeWidth="0.8" />
              <path
                d={`M66 ${y} L150 ${y + 42} L234 ${y}`}
                fill="none"
                strokeWidth="1"
                stroke={live ? 'rgba(79,224,160,0.75)' : syncing ? 'rgba(255,150,95,0.9)' : 'rgba(255,196,160,0.22)'}
                style={{ transition: 'stroke 500ms ease' }}
              />
              {[170, 186, 202, 218].map((x, j) => (
                <circle
                  key={x}
                  cx={x}
                  cy={y + 42 - (x - 150) * 0.5 + 12}
                  r="1.8"
                  fill={live ? '#4FE0A0' : syncing ? '#FFB27F' : 'rgba(255,255,255,0.16)'}
                  className={syncing ? 'animate-twinkle' : undefined}
                  style={{ animationDelay: `${j * 0.15}s`, transformBox: 'fill-box', transformOrigin: 'center', transition: 'fill 400ms ease' }}
                />
              ))}
              <text x="250" y={y + 30} className="font-mono" fontSize="10.5" fill={live ? '#8AF0BF' : syncing ? '#FFB27F' : '#70675F'}>
                {region?.name.split(' · ')[0]}
              </text>
            </g>
          )
        })}
      </svg>
      {receiving &&
        [0, 0.45, 0.9].map((delay) => (
          <span
            key={delay}
            className="comet-dot"
            style={{ offsetPath: "path('M -60 250 C 10 250, 40 200, 150 190')", width: 34, '--dur': '1.35s', '--delay': `${delay}s` } as CSSProperties}
          />
        ))}
    </div>
  )
}

function DeployWindow({ t }: SceneProps) {
  return (
    <ScreenWindow style={WIN} dim={t >= OPEN_SITE} title="Pilot — deploy v2.4.0 · acme-web-app" icon={<LogoMark size={13} glow={false} />}>
      <div className="flex h-full">
        <div className="flex w-[560px] shrink-0 flex-col gap-5 border-r border-white/[0.06] p-6">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[20px] font-semibold tracking-[-0.03em] text-sand-50">Release v2.4.0</p>
              <p className="mt-1 font-mono text-[11px] text-sand-500">feat/usage-billing → main · 3f9a2c1</p>
            </div>
            <span className="flex items-center gap-1.5 rounded-full bg-mint-400/12 px-2.5 py-1 text-[11px] text-mint-300 ring-1 ring-inset ring-mint-400/30">
              <Check className="size-3" strokeWidth={3} />
              Approved by you
            </span>
          </div>
          <div className="flex flex-col gap-3.5 rounded-xl border border-white/[0.06] bg-white/[0.02] p-4">
            {STEPS.map((step) => {
              const state = stepState(t, step.start, step.end)
              return (
                <div key={step.label}>
                  <StepRow label={step.label} state={state} meta={state === 'done' ? step.time : undefined} />
                  <p className="ml-[26px] mt-0.5 font-mono text-[10.5px] text-sand-500">{step.meta}</p>
                </div>
              )
            })}
          </div>
          <div className="flex flex-col gap-2.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Edge regions</p>
            {REGIONS.map((region) => {
              const p = span(t, region.start, region.end)
              const live = p >= 1
              return (
                <div key={region.name} className="flex items-center gap-3 font-mono text-[11px]">
                  <span className="w-32 shrink-0 text-sand-300">{region.name}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                    <span
                      className={cn('block h-full origin-left rounded-full transition-colors duration-300', live ? 'bg-mint-400' : 'bg-linear-to-r from-ember-600 to-ember-300')}
                      style={{ transform: `scaleX(${p})` }}
                    />
                  </span>
                  <span className={cn('w-12 shrink-0 text-right', live ? 'text-mint-300' : 'text-sand-500')}>{live ? 'live' : p > 0 ? `${Math.round(p * 100)}%` : '—'}</span>
                </div>
              )
            })}
          </div>
        </div>

        <div className="relative flex min-w-0 flex-1 flex-col items-center bg-[radial-gradient(55%_45%_at_50%_40%,rgba(255,108,44,0.08),transparent)]">
          <div className="bg-dots absolute inset-0 opacity-20" />
          <div className="relative mt-8">
            <ServerRack t={t} />
          </div>
          <div className="relative mt-auto w-full border-t border-white/[0.06] bg-[#0b0a09] px-5 py-4 font-mono text-[11.5px] leading-[1.75]">
            {LOGS.filter((log) => t >= log.at).map((log) => (
              <motion.p key={log.text} initial={{ opacity: 0, x: -6 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3, ease: EASE_OUT }} className="truncate text-sand-400">
                <span className="text-ember-300">› pilot</span> {log.text}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </ScreenWindow>
  )
}

function SiteWindow({ t }: SceneProps) {
  const header = (
    <div className="shrink-0 bg-ink-900">
      <div className="flex h-10 items-end gap-1 px-3">
        <TrafficLights className="mb-3 mr-3" />
        <div className="flex h-8 w-[220px] items-center gap-2 rounded-t-[10px] bg-ink-800 px-3 text-[11.5px] text-sand-100">
          <span className="grid size-4 place-items-center rounded bg-ember-400 text-[8px] font-bold text-ink-950">a</span>
          Billing · Acme
          <X className="ml-auto size-3 opacity-50" />
        </div>
      </div>
      <div className="flex h-11 items-center gap-3 border-b border-white/[0.06] bg-ink-800 px-3 text-sand-500">
        <ArrowLeft className="size-4" />
        <ArrowRight className="size-4 opacity-50" />
        <RotateCw className="size-3.5" />
        <div className="flex h-7 flex-1 items-center gap-2 rounded-full bg-ink-900 px-3 text-[12px] ring-1 ring-white/[0.06]">
          <Lock className="size-3 text-mint-400" />
          <span className="text-sand-100">acme.dev</span>
          <span className="-ml-2 text-sand-500">/billing</span>
          <span className="ml-auto flex items-center gap-1.5 rounded-full bg-mint-400/12 px-2 py-0.5 font-mono text-[10px] text-mint-300">
            <span className="size-1.5 rounded-full bg-mint-400" />
            live · v2.4.0
          </span>
        </div>
      </div>
    </div>
  )
  return (
    <ScreenWindow style={{ left: 96, top: 60, width: 1088, height: 656 }} header={header} className="shadow-[0_40px_120px_-20px_rgba(0,0,0,0.95),0_0_0_1px_rgba(0,0,0,0.6),0_0_80px_-30px_rgba(255,108,44,0.45)]">
      <LiveSite hover={t >= HOVER_AT} />
    </ScreenWindow>
  )
}

export function DeployScene({ t }: SceneProps) {
  return (
    <>
      <DeployWindow t={t} />
      {t >= OPEN_SITE && <SiteWindow t={t} />}
      <AnimatePresence>
        {t >= TOAST_AT && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.55, ease: EASE_OUT }}
            className="absolute bottom-6 right-6 z-40 flex w-[320px] items-center gap-3 rounded-xl border border-mint-400/25 bg-ink-800 p-3.5 shadow-[0_20px_50px_-16px_rgba(0,0,0,0.95)]"
          >
            <span className="grid size-9 place-items-center rounded-lg bg-mint-400/12 text-mint-300 ring-1 ring-inset ring-mint-400/30">
              <Check className="size-4" strokeWidth={3} />
            </span>
            <div className="min-w-0">
              <p className="text-[12.5px] font-medium text-sand-50">v2.4.0 is live</p>
              <p className="truncate font-mono text-[10.5px] text-sand-500">5 regions · 0 errors · 3m 42s total</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {t >= 6600 && <AgentCursor t={t} path={YOU} label="You" tone="sand" />}
    </>
  )
}
