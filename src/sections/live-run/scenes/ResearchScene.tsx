import { ArrowLeft, ArrowRight, Lock, Plus, RotateCw, Search, X } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { TypedCode } from '@/components/code/TypedCode'
import { EASE_IN_OUT, EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { type SceneProps, span, typedChars } from '../phases'
import { AgentCursor, type Waypoint } from '../ui/AgentCursor'
import { Spinner, StatusIcon } from '../ui/bits'
import { ScreenWindow, TrafficLights } from '../ui/ScreenWindow'

const QUERY = 'stripe usage based billing proration'

const TABS = [
  { at: 0, title: 'New tab' },
  { at: 3000, title: 'Usage-based billing · Docs' },
  { at: 4500, title: 'Metered plans · Issue #842' },
  { at: 5500, title: 'Prorations · Docs' },
]

const RESULTS = [
  {
    at: 1700,
    site: 'Stripe Docs',
    url: 'docs.stripe.com › billing › usage-based',
    title: 'Usage-based billing | Stripe Documentation',
    snippet: 'Charge customers based on how much they use your product. Record usage with meter events and bill at the end of each period…',
  },
  {
    at: 1900,
    site: 'GitHub',
    url: 'github.com › acme › web-app › issues › 842',
    title: 'Metered plans for API customers · Issue #842',
    snippet: 'API customers should be billed per 1k requests, with proration when they switch plans mid-cycle…',
  },
  {
    at: 2100,
    site: 'Stripe Docs',
    url: 'docs.stripe.com › billing › subscriptions › prorations',
    title: 'Prorations | Stripe Documentation',
    snippet: 'Prorations make sure customers are billed accurately when they change plans part-way through a billing period…',
  },
  {
    at: 2300,
    site: 'Engineering blog',
    url: 'eng.example.com › metered-billing-lessons',
    title: 'Lessons from building metered billing at scale',
    snippet: 'Idempotency keys, late-arriving usage events and invoice timing were the three things that bit us…',
  },
]

const NOTES = [
  { at: 3700, tag: 'API', source: 'docs.stripe.com', text: 'Report usage as meter events — Stripe aggregates them per billing period.' },
  { at: 4400, tag: 'Requirement', source: 'acme/web-app#842', text: 'API plan bills per 1k requests; customers switch plans mid-cycle.' },
  { at: 5100, tag: 'Edge case', source: 'docs.stripe.com', text: 'Use proration_behavior: create_prorations for mid-cycle upgrades.' },
  { at: 5800, tag: 'Risk', source: 'eng.example.com', text: 'Webhooks can arrive twice — every handler must be idempotent.' },
]

const DOC_SNIPPET = `await stripe.billing.meterEvents.create({
  event_name: 'api_requests',
  payload: { stripe_customer_id: 'cus_N1k', value: '25' },
})`

const CURSOR: Waypoint[] = [
  { at: 0, x: 560, y: 430 },
  { at: 280, x: 300, y: 108, click: true },
  { at: 1500, x: 336, y: 114 },
  { at: 2400, x: 300, y: 326 },
  { at: 2750, x: 306, y: 326, click: true },
  { at: 3700, x: 480, y: 266 },
  { at: 4500, x: 560, y: 330 },
  { at: 5400, x: 430, y: 404 },
  { at: 7600, x: 470, y: 470 },
]

/** Highlighter sweep across a sentence (background-size, multi-line aware). */
function Mark({ on, children }: { on: boolean; children: ReactNode }) {
  return (
    <mark
      className="rounded-[3px] bg-no-repeat text-sand-50 transition-[background-size] duration-[900ms] ease-out"
      style={{
        backgroundColor: 'transparent',
        backgroundImage: 'linear-gradient(rgba(255,122,58,0.3), rgba(255,122,58,0.3))',
        backgroundSize: on ? '100% 100%' : '0% 100%',
      }}
    >
      {children}
    </mark>
  )
}

export function ResearchScene({ t }: SceneProps) {
  return (
    <>
      <Browser t={t} />
      <Brief t={t} />
      <AgentCursor t={t} path={CURSOR} label="Scout" />
    </>
  )
}

function Browser({ t }: SceneProps) {
  const activeTab = t < 3000 ? 0 : 1
  const typing = t >= 300 && t < 1500
  const query = QUERY.slice(0, typedChars(t, 300, 1350, QUERY.length))
  const address = t < 1500 ? query : t < 3000 ? 'search.dev/?q=stripe+usage+based+billing+proration' : 'docs.stripe.com/billing/subscriptions/usage-based'

  const header = (
    <div className="shrink-0 bg-ink-900">
      <div className="flex h-10 items-end gap-1 px-3">
        <TrafficLights className="mb-3 mr-3" />
        {TABS.filter((tab) => t >= tab.at).map((tab, i) => (
          <motion.div
            key={tab.title}
            initial={i === 0 ? false : { opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 196 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className={cn(
              'flex h-8 items-center gap-2 overflow-hidden whitespace-nowrap rounded-t-[10px] px-3 text-[11.5px]',
              i === activeTab ? 'bg-ink-800 text-sand-100' : 'text-sand-500',
            )}
          >
            <span className={cn('grid size-4 shrink-0 place-items-center rounded-full text-[8px] font-bold', i === 0 ? 'bg-ember-500/20 text-ember-300' : 'bg-white/10 text-sand-200')}>
              {i === 0 ? <Search className="size-2.5" /> : tab.title[0]}
            </span>
            <span className="truncate">{i === 0 && t >= 1500 ? `${QUERY} – search` : tab.title}</span>
            <X className="ml-auto size-3 shrink-0 opacity-50" />
          </motion.div>
        ))}
        <Plus className="mb-2.5 ml-1 size-3.5 text-sand-500" />
      </div>
      <div className="flex h-11 items-center gap-3 border-b border-white/[0.06] bg-ink-800 px-3 text-sand-500">
        <ArrowLeft className="size-4" />
        <ArrowRight className="size-4 opacity-50" />
        <RotateCw className="size-3.5" />
        <div className="flex h-7 min-w-0 flex-1 items-center gap-2 rounded-full bg-ink-900 px-3 text-[12px] ring-1 ring-white/[0.06]">
          {t < 1500 ? <Search className="size-3.5 shrink-0" /> : <Lock className="size-3 shrink-0 text-mint-400" />}
          <span className={cn('truncate', address ? 'text-sand-100' : 'text-sand-600')}>{address || 'Search or type a URL'}</span>
          {typing && <span className="-ml-1.5 inline-block h-3.5 w-px animate-blink bg-ember-300" />}
        </div>
        <span className="grid size-7 place-items-center rounded-full bg-ember-500/15 shadow-[0_0_14px_rgba(255,108,44,0.35)] ring-1 ring-ember-400/35">
          <LogoMark size={14} glow={false} />
        </span>
      </div>
    </div>
  )

  return (
    <ScreenWindow style={{ left: 32, top: 46, width: 860, height: 684 }} header={header}>
      <AnimatePresence initial={false}>
        {t >= 1500 && t < 3000 && <SearchPage key="serp" t={t} />}
        {t >= 3000 && <DocsPage key="docs" t={t} />}
      </AnimatePresence>
      {t < 1500 && <NewTab />}
    </ScreenWindow>
  )
}

function NewTab() {
  return (
    <div className="absolute inset-0 grid place-items-center bg-ink-850">
      <div className="-mt-24 flex flex-col items-center gap-5">
        <span className="text-[34px] font-semibold tracking-[-0.05em] text-sand-50">
          search<span className="text-ember-400">.</span>
        </span>
        <div className="flex h-11 w-[460px] items-center gap-3 rounded-full bg-ink-800 px-4 text-[13px] text-sand-600 ring-1 ring-white/10">
          <Search className="size-4" />
          Search the web
        </div>
      </div>
    </div>
  )
}

function SearchPage({ t }: SceneProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="absolute inset-0 bg-ink-850 px-10 pt-[22px]"
    >
      <div className="flex items-center gap-6">
        <span className="w-[80px] text-[22px] font-semibold tracking-[-0.05em] text-sand-50">
          search<span className="text-ember-400">.</span>
        </span>
        <div className="flex h-10 w-[540px] items-center gap-3 rounded-full bg-ink-800 px-4 text-[13px] text-sand-100 ring-1 ring-white/10">
          <Search className="size-4 text-sand-500" />
          {QUERY}
          <X className="ml-auto size-4 text-sand-500" />
        </div>
      </div>
      <div className="mt-4 flex gap-6 border-b border-white/[0.06] pl-[104px] text-[12px] text-sand-400">
        {['All', 'Docs', 'Code', 'Discussions', 'News'].map((tab, i) => (
          <span key={tab} className={cn('pb-2', i === 0 && 'border-b-2 border-ember-400 text-sand-100')}>
            {tab}
          </span>
        ))}
      </div>
      <p className="mt-3 pl-[104px] text-[11px] text-sand-500">About 2,340,000 results (0.31 seconds)</p>
      <div className="mt-4 flex flex-col gap-[22px] pl-[104px]">
        {RESULTS.filter((r) => t >= r.at).map((r, i) => (
          <motion.div key={r.title} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: EASE_OUT }} className="max-w-[600px]">
            <div className="flex items-center gap-2.5">
              <span className="grid size-6 place-items-center rounded-full bg-white/[0.07] text-[10px] font-semibold text-sand-200">{r.site[0]}</span>
              <div className="leading-tight">
                <p className="text-[12px] text-sand-200">{r.site}</p>
                <p className="text-[11px] text-sand-500">{r.url}</p>
              </div>
            </div>
            <p className={cn('mt-1.5 text-[16px] text-[#ffb27f]', i === 0 && t >= 2750 && 'underline decoration-ember-300/60 underline-offset-2')}>{r.title}</p>
            <p className="mt-1 text-[12.5px] leading-relaxed text-sand-400">{r.snippet}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  )
}

const DOC_NAV = ['Overview', 'Subscriptions', 'Usage-based billing', 'Prorations', 'Invoices', 'Webhooks', 'Testing']

function DocsPage({ t }: SceneProps) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }} className="absolute inset-0 overflow-hidden bg-[#0f0d0c]">
      <div className="absolute inset-y-0 left-0 w-[190px] border-r border-white/[0.05] px-5 pt-8">
        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-600">Billing</p>
        <ul className="mt-3 flex flex-col gap-2.5 text-[12px] text-sand-500">
          {DOC_NAV.map((item) => (
            <li key={item} className={cn(item === 'Usage-based billing' && 'font-medium text-ember-300')}>
              {item}
            </li>
          ))}
        </ul>
      </div>
      <motion.div
        animate={{ y: t >= 4300 ? -170 : 0 }}
        transition={{ duration: 1.1, ease: EASE_IN_OUT }}
        className="ml-[190px] px-12 pt-8"
      >
        <p className="font-mono text-[11px] text-sand-500">Billing › Subscriptions › Usage-based billing</p>
        <h3 className="mt-3 text-[30px] font-semibold leading-[1.2] tracking-[-0.03em] text-sand-50">Usage-based billing</h3>
        <p className="mt-3 text-[14px] leading-[1.75] text-sand-300">
          Charge customers based on how much they use your product.{' '}
          <Mark on={t >= 3500}>Record usage with meter events, and Stripe aggregates them per billing period</Mark> before adding
          the total to the next invoice.
        </p>
        <h4 className="mt-6 text-[17px] font-semibold text-sand-100">Report usage</h4>
        <div className="mt-3 rounded-xl bg-ink-800 py-4 ring-1 ring-white/[0.06]">
          <TypedCode code={DOC_SNIPPET} showCursor={false} className="text-[12px]" />
        </div>
        <h4 className="mt-6 text-[17px] font-semibold text-sand-100">Handle plan changes</h4>
        <p className="mt-2 text-[14px] leading-[1.75] text-sand-300">
          When a customer upgrades mid-cycle,{' '}
          <Mark on={t >= 4900}>set proration_behavior to create_prorations so the change is billed for the remaining days</Mark>.
          Unused time on the old plan is credited automatically.
        </p>
        <div className="mt-6 flex flex-col gap-2.5">
          {[92, 84, 96, 61].map((w) => (
            <span key={w} className="h-2.5 rounded-full bg-white/[0.05]" style={{ width: `${w}%` }} />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

function Brief({ t }: SceneProps) {
  const progress = span(t, 1600, 6400)
  const sources = Math.min(14, Math.floor(progress * 14))
  const ready = t >= 6500

  return (
    <ScreenWindow
      style={{ left: 908, top: 46, width: 340, height: 684 }}
      delay={0.12}
      title="Scout — research brief"
      icon={<LogoMark size={13} glow={false} />}
    >
      <div className="flex h-full flex-col gap-4 p-4">
        <div className="rounded-xl bg-ink-800 p-3.5 ring-1 ring-white/[0.06]">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Task</p>
          <p className="mt-1.5 text-[12.5px] leading-snug text-sand-100">Add usage-based billing with Stripe and an invoices page</p>
          <div className="mt-3 flex items-center justify-between font-mono text-[11px]">
            <span className="text-sand-400">sources read</span>
            <span className="tabular-nums text-ember-300">{sources} / 14</span>
          </div>
          <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
            <div
              className="h-full origin-left rounded-full bg-linear-to-r from-ember-600 to-ember-300 transition-transform duration-500"
              style={{ transform: `scaleX(${sources / 14})` }}
            />
          </div>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-sand-500">Findings</p>
        <div className="-mt-2 flex flex-col gap-2">
          {NOTES.filter((note) => t >= note.at).map((note) => (
            <motion.div
              key={note.text}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: EASE_OUT }}
              className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-md bg-ember-500/12 px-1.5 py-0.5 font-mono text-[9.5px] uppercase tracking-wider text-ember-300">{note.tag}</span>
                <span className="truncate font-mono text-[10px] text-sand-500">{note.source}</span>
              </div>
              <p className="mt-2 text-[12px] leading-snug text-sand-200">{note.text}</p>
            </motion.div>
          ))}
          {t >= 1600 && t < 6400 && (
            <div className="flex items-center gap-2 px-1 pt-1 text-[11.5px] text-sand-500">
              <Spinner />
              Reading sources…
            </div>
          )}
        </div>

        <div className="mt-auto rounded-xl border border-white/[0.06] bg-ink-800/80 p-3">
          <div className="flex items-center gap-2 text-[12px]">
            <StatusIcon state={ready ? 'done' : t >= 1600 ? 'running' : 'pending'} />
            <span className={ready ? 'text-mint-300' : 'text-sand-200'}>{ready ? 'Brief ready' : 'Distilling brief…'}</span>
            <span className="ml-auto font-mono text-[10.5px] tabular-nums text-sand-500">
              {ready ? '212k → 3.2k tokens' : `${Math.round(progress * 212)}k tokens`}
            </span>
          </div>
          {ready && (
            <motion.p initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-2 font-mono text-[10.5px] text-sand-500">
              → handing off to Architect
            </motion.p>
          )}
        </div>
      </div>
    </ScreenWindow>
  )
}
