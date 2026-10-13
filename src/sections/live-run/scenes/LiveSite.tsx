import { Bell, Download, Search } from 'lucide-react'
import { animate, AnimatePresence, motion, useMotionValue, useTransform } from 'motion/react'
import { useEffect } from 'react'
import { GradientAvatar } from '@/components/ui/Avatar'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

/* Usage data for October (deterministic, gently rising) */
const DATA = Array.from({ length: 31 }, (_, i) => 18 + i * 1.45 + Math.sin(i * 0.9) * 3.6 + Math.sin(i * 2.3) * 1.8)
const CW = 640
const CH = 190
const MIN = Math.min(...DATA) - 4
const MAX = Math.max(...DATA) + 4
const POINTS = DATA.map((v, i) => ({ x: (i / (DATA.length - 1)) * CW, y: CH - ((v - MIN) / (MAX - MIN)) * (CH - 20) }))

function smoothPath(points: { x: number; y: number }[]) {
  const first = points[0]
  if (!first) return ''
  let d = `M ${first.x.toFixed(1)} ${first.y.toFixed(1)}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i]
    const p1 = points[i]
    const p2 = points[i + 1]
    const p3 = points[i + 2] ?? p2
    if (!p0 || !p1 || !p2 || !p3) continue
    const c1x = p1.x + (p2.x - p0.x) / 6
    const c1y = p1.y + (p2.y - p0.y) / 6
    const c2x = p2.x - (p3.x - p1.x) / 6
    const c2y = p2.y - (p3.y - p1.y) / 6
    d += ` C ${c1x.toFixed(1)} ${c1y.toFixed(1)}, ${c2x.toFixed(1)} ${c2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`
  }
  return d
}

const LINE = smoothPath(POINTS)
const AREA = `${LINE} L ${CW} ${CH} L 0 ${CH} Z`
const HOVER_DAY = 27
const HOVER = POINTS[HOVER_DAY] ?? { x: 0, y: 0 }
const LAST = POINTS[POINTS.length - 1] ?? { x: 0, y: 0 }

function CountUp({ to, decimals = 0, prefix = '', delay = 0 }: { to: number; decimals?: number; prefix?: string; delay?: number }) {
  const value = useMotionValue(0)
  const text = useTransform(value, (v) => `${prefix}${v.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`)
  useEffect(() => {
    const controls = animate(value, to, { duration: 1.4, delay, ease: EASE_OUT })
    return () => controls.stop()
  }, [value, to, delay])
  return <motion.span className="tabular-nums">{text}</motion.span>
}

const rise = (delay: number) => ({
  initial: { opacity: 0, y: 14 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: EASE_OUT },
})

const METRICS = [
  { label: 'API calls this month', to: 1284320, decimals: 0, prefix: '', trend: '+18.2%' },
  { label: 'Current bill', to: 1842.6, decimals: 2, prefix: '$', trend: '+$232' },
  { label: 'Projected next invoice', to: 2140, decimals: 0, prefix: '$', trend: 'Nov 1' },
]

const INVOICES = [
  { id: 'INV-2041', month: 'Oct 2026', amount: '$1,842.60', status: 'Upcoming' },
  { id: 'INV-2040', month: 'Sep 2026', amount: '$1,610.20', status: 'Paid' },
  { id: 'INV-2039', month: 'Aug 2026', amount: '$1,488.00', status: 'Paid' },
  { id: 'INV-2038', month: 'Jul 2026', amount: '$1,302.75', status: 'Paid' },
]

/** The page Pilot just shipped: Acme's new usage-based billing dashboard. */
export function LiveSite({ hover }: { hover: boolean }) {
  return (
    <div className="absolute inset-0 overflow-hidden bg-[#0c0b0a]">
      <motion.nav {...rise(0.1)} className="flex h-[52px] items-center gap-7 border-b border-white/[0.06] px-6">
        <span className="flex items-center gap-2 text-[15px] font-bold tracking-[-0.04em] text-sand-50">
          <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
            <path d="M12 3 22 20H2L12 3Z" fill="#FF8748" />
            <path d="M12 10 16.5 18h-9L12 10Z" fill="#0c0b0a" />
          </svg>
          acme
        </span>
        {['Dashboard', 'Usage', 'Billing', 'Settings'].map((item) => (
          <span key={item} className={cn('text-[12.5px]', item === 'Billing' ? 'text-sand-50' : 'text-sand-500')}>
            {item}
          </span>
        ))}
        <span className="ml-auto flex h-8 w-52 items-center gap-2 rounded-lg bg-white/[0.04] px-3 text-[12px] text-sand-600 ring-1 ring-white/[0.06]">
          <Search className="size-3.5" />
          Search
        </span>
        <Bell className="size-4 text-sand-500" />
        <GradientAvatar name="Ava Chen" size={28} />
      </motion.nav>

      <div className="px-6 pt-6">
        <motion.div {...rise(0.2)} className="flex items-end justify-between">
          <div>
            <h3 className="text-[24px] font-semibold tracking-[-0.03em] text-sand-50">Billing</h3>
            <p className="mt-1 text-[12.5px] text-sand-500">Usage-based plan · renews Nov 1, 2026</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-ember-500/12 px-2.5 py-1 text-[11px] text-ember-200 ring-1 ring-inset ring-ember-400/30">Pro · metered</span>
            <span className="flex items-center gap-1.5 rounded-lg bg-white/[0.05] px-3 py-1.5 text-[12px] text-sand-200 ring-1 ring-white/10">
              <Download className="size-3.5" />
              Invoices
            </span>
          </div>
        </motion.div>

        <div className="mt-5 grid grid-cols-3 gap-4">
          {METRICS.map((m, i) => (
            <motion.div key={m.label} {...rise(0.3 + i * 0.08)} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
              <p className="text-[11.5px] text-sand-500">{m.label}</p>
              <p className="mt-2 text-[24px] font-semibold tracking-[-0.03em] text-sand-50">
                <CountUp to={m.to} decimals={m.decimals} prefix={m.prefix} delay={0.45 + i * 0.08} />
              </p>
              <p className="mt-1 font-mono text-[10.5px] text-mint-300">{m.trend}</p>
            </motion.div>
          ))}
        </div>

        <div className="mt-4 grid grid-cols-3 gap-4">
          <motion.div {...rise(0.5)} className="col-span-2 rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-sand-100">API usage · October</p>
              <p className="font-mono text-[10.5px] text-sand-500">daily · thousands of calls</p>
            </div>
            <div className="relative mt-3">
              <svg viewBox={`0 0 ${CW} ${CH}`} className="h-[178px] w-full overflow-visible" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="live-area" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0" stopColor="#FF8748" stopOpacity="0.35" />
                    <stop offset="1" stopColor="#FF8748" stopOpacity="0" />
                  </linearGradient>
                </defs>
                {[0.25, 0.5, 0.75].map((f) => (
                  <line key={f} x1="0" x2={CW} y1={CH * f} y2={CH * f} stroke="rgba(255,255,255,0.05)" strokeDasharray="3 5" />
                ))}
                <motion.path d={AREA} fill="url(#live-area)" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8, delay: 1.3 }} />
                <motion.path
                  d={LINE}
                  fill="none"
                  stroke="#FF9A5C"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 1.5, delay: 0.7, ease: EASE_OUT }}
                />
                {hover && <line x1={HOVER.x} x2={HOVER.x} y1="0" y2={CH} stroke="rgba(255,200,170,0.35)" strokeDasharray="2 4" />}
              </svg>
              <motion.span
                className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember-200 shadow-[0_0_0_4px_rgba(255,135,72,0.25),0_0_16px_rgba(255,135,72,0.9)]"
                style={{ left: `${(LAST.x / CW) * 100}%`, top: `${(LAST.y / CH) * 100}%` }}
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 2.1, type: 'spring', stiffness: 300, damping: 16 }}
              />
              <AnimatePresence>
                {hover && (
                  <motion.div
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="absolute -translate-x-1/2 rounded-lg border border-white/10 bg-ink-750 px-3 py-2 shadow-[0_12px_30px_-10px_rgba(0,0,0,0.9)]"
                    style={{ left: `${(HOVER.x / CW) * 100}%`, top: `calc(${(HOVER.y / CH) * 100}% - 64px)` }}
                  >
                    <p className="whitespace-nowrap font-mono text-[10px] text-sand-500">Oct 28</p>
                    <p className="whitespace-nowrap text-[12.5px] font-medium text-sand-50">64.2k calls · $91.80</p>
                  </motion.div>
                )}
              </AnimatePresence>
              {hover && (
                <span
                  className="absolute size-2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-ember-200 bg-ink-900"
                  style={{ left: `${(HOVER.x / CW) * 100}%`, top: `${(HOVER.y / CH) * 100}%` }}
                />
              )}
            </div>
            <div className="mt-2 flex justify-between font-mono text-[10px] text-sand-600">
              {['Oct 1', 'Oct 8', 'Oct 15', 'Oct 22', 'Oct 31'].map((d) => (
                <span key={d}>{d}</span>
              ))}
            </div>
          </motion.div>

          <motion.div {...rise(0.6)} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-4">
            <div className="flex items-center justify-between">
              <p className="text-[13px] font-medium text-sand-100">Invoices</p>
              <p className="text-[11px] text-ember-300">View all</p>
            </div>
            <div className="mt-3 flex flex-col">
              {INVOICES.map((inv, i) => (
                <motion.div
                  key={inv.id}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.45, delay: 0.85 + i * 0.1, ease: EASE_OUT }}
                  className="flex items-center justify-between border-b border-white/[0.05] py-[11px] last:border-0"
                >
                  <div>
                    <p className="font-mono text-[11px] text-sand-200">{inv.id}</p>
                    <p className="text-[10.5px] text-sand-500">{inv.month}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[12px] font-medium tabular-nums text-sand-100">{inv.amount}</p>
                    <p className={cn('text-[10px]', inv.status === 'Paid' ? 'text-mint-300' : 'text-ember-300')}>{inv.status}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}
