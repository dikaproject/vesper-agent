// Temporary probe: main-thread long tasks while navigating landing -> /register (portal transition).
import { chromium } from 'playwright-core'

const [warm = 'warm'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(warm === 'warm' ? 3200 : 800) // warm: the idle prefetch has loaded the auth chunk
await browser.startTracing(page, {
  categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'disabled-by-default-devtools.timeline.stack', 'blink.user_timing', 'v8.execute'],
})
await page.locator('header').getByRole('link', { name: /Start building/ }).click()
await page.waitForTimeout(1800)
const events = JSON.parse((await browser.stopTracing()).toString()).traceEvents
const threads = new Map()
for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name)
const main = events.filter((e) => threads.get(`${e.pid}:${e.tid}`) === 'CrRendererMain' && e.ph === 'X')
const tasks = main.filter((e) => e.name === 'RunTask' && e.dur > 12000)
const t0 = Math.min(...main.map((e) => e.ts))
const NAMES = ['FunctionCall', 'EvaluateScript', 'v8.callFunction', 'UpdateLayoutTree', 'Layout', 'PrePaint', 'Paint', 'Layerize', 'Commit', 'ParseHTML', 'MinorGC', 'MajorGC', 'V8.GC_SCAVENGER', 'FireAnimationFrame', 'TimerFire', 'EventDispatch', 'HitTest']
for (const t of tasks) {
  const inside = main.filter((e) => e.ts >= t.ts && e.ts + (e.dur ?? 0) <= t.ts + t.dur && e !== t)
  const sums = {}
  for (const e of inside) if (NAMES.includes(e.name)) sums[e.name] = (sums[e.name] ?? 0) + e.dur / 1000
  const top = Object.entries(sums)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k, v]) => `${k} ${v.toFixed(1)}`)
    .join(', ')
  console.log(`+${((t.ts - t0) / 1000).toFixed(0).padStart(5)}ms  task ${(t.dur / 1000).toFixed(1).padStart(6)}ms  | ${top}`)
  for (const e of inside) {
    if (e.name !== 'UpdateLayoutTree' || e.dur < 8000) continue
    const stack = (e.args?.beginData?.stackTrace ?? []).slice(0, 4).map((f) => `${f.functionName || '(anon)'}@${(f.url || '').split('/').pop()}:${f.lineNumber}`)
    console.log(`        recalc ${(e.dur / 1000).toFixed(1)}ms elements=${e.args?.elementCount ?? '?'} ${stack.join(' <- ')}`)
  }
}
await browser.close()
