// Temporary perf probe: frame pacing + main-thread breakdown for UTH and Pricing.
// usage: node scripts/perf.mjs [label] [dpr]
import { mkdir, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [label = 'run', dpr = '1'] = process.argv.slice(2)
await mkdir('.screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge', args: ['--ignore-gpu-blocklist', '--enable-gpu-rasterization'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: Number(dpr) })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

const renderer = await page.evaluate(() => {
  const gl = document.createElement('canvas').getContext('webgl')
  const ext = gl?.getExtension('WEBGL_debug_renderer_info')
  return ext ? gl.getParameter(ext.UNMASKED_RENDERER_WEBGL) : 'unknown'
})

const top = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel)
const height = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().height, sel)
const jump = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(900)
}

// rAF recorder lives in the page so it sees real frame pacing.
const startFrames = () =>
  page.evaluate(() => {
    window.__frames = []
    let last = performance.now()
    window.__rec = true
    const tick = (now) => {
      window.__frames.push(now - last)
      last = now
      if (window.__rec) requestAnimationFrame(tick)
    }
    requestAnimationFrame(tick)
  })
const stopFrames = () =>
  page.evaluate(() => {
    window.__rec = false
    return window.__frames.slice(1)
  })

const scrollRun = (from, to, speed) =>
  page.evaluate(
    ([a, b, v]) =>
      new Promise((resolve) => {
        const start = performance.now()
        const dur = (Math.abs(b - a) / v) * 1000
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur)
          window.scrollTo(0, a + (b - a) * t)
          if (t < 1) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      }),
    [from, to, speed],
  )

const CATS = ['toplevel', 'devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink', 'cc']
const MAIN = {
  UpdateLayoutTree: 'style',
  Layout: 'layout',
  Paint: 'paint',
  PrePaint: 'prepaint',
  Layerize: 'layerize',
  UpdateLayer: 'layerize',
  FireAnimationFrame: 'raf',
  EventDispatch: 'events',
  FunctionCall: 'js',
  Commit: 'commit',
}

function summarize(frames, events) {
  const threads = new Map()
  for (const e of events) if (e.ph === 'M' && e.name === 'thread_name') threads.set(`${e.pid}:${e.tid}`, e.args.name)
  const tn = (e) => threads.get(`${e.pid}:${e.tid}`) ?? ''
  const sums = {}
  const counts = {}
  const add = (k, d) => {
    sums[k] = (sums[k] ?? 0) + d
    counts[k] = (counts[k] ?? 0) + 1
  }
  for (const e of events) {
    if (e.ph !== 'X' || typeof e.dur !== 'number') continue
    const ms = e.dur / 1000
    const thread = tn(e)
    if (thread === 'CrRendererMain') {
      if (e.name === 'ThreadControllerImpl::RunTask' || e.name === 'RunTask') add('busy', ms)
      else if (MAIN[e.name]) add(MAIN[e.name], ms)
    } else if (/CompositorTileWorker|RasterWorker/.test(thread) && e.name === 'RasterTask') add('raster', ms)
  }
  const sorted = [...frames].sort((a, b) => a - b)
  const pct = (p) => sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * p))] ?? 0
  const mean = frames.reduce((a, b) => a + b, 0) / Math.max(1, frames.length)
  const dropped = frames.reduce((acc, d) => acc + Math.max(0, Math.round(d / 16.67) - 1), 0)
  const round = (o) => Object.fromEntries(Object.entries(o).map(([k, v]) => [k, Math.round(v * 10) / 10]))
  return {
    frames: frames.length,
    meanMs: Math.round(mean * 10) / 10,
    p95Ms: Math.round(pct(0.95) * 10) / 10,
    maxMs: Math.round((sorted.at(-1) ?? 0) * 10) / 10,
    janky: frames.filter((d) => d > 24).length,
    dropped,
    mainMs: round(sums),
    paints: counts.paint ?? 0,
  }
}

async function measure(run) {
  await browser.startTracing(page, { categories: CATS })
  await startFrames()
  await run()
  const frames = await stopFrames()
  const buf = await browser.stopTracing()
  const trace = JSON.parse(buf.toString())
  return summarize(frames, trace.traceEvents ?? trace)
}

const idle = (ms) => () => page.waitForTimeout(ms)
const results = { label, dpr: Number(dpr), renderer }

// Under the Hood: full pinned-track scroll, then idle on the context-engine layer
const uthTop = await top('#under-the-hood')
const uthH = await height('#under-the-hood')
await jump(uthTop - 100)
results.uthScroll = await measure(() => scrollRun(uthTop - 100, uthTop + uthH - 900, 1000))
const track = await page.evaluate(() => {
  const el = document.querySelector('#under-the-hood').lastElementChild
  const r = el.getBoundingClientRect()
  return { top: r.top + window.scrollY, h: r.height }
})
await jump(track.top + 0.35 * (track.h - 900))
results.uthIdle = await measure(idle(2500))

// Pricing: scroll through, idle with the cards in view, hover the cards, drag the slider
const prTop = await top('#pricing')
const prH = await height('#pricing')
await jump(prTop - 200)
results.pricingScroll = await measure(() => scrollRun(prTop - 200, prTop + prH - 600, 1000))
await jump(prTop + 380)
results.pricingIdle = await measure(idle(2500))
const cards = await page.$$eval('#pricing .spotlight', (els) =>
  els.map((e) => {
    const r = e.getBoundingClientRect()
    return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, 860 - r.top) }
  }),
)
results.pricingHover = await measure(async () => {
  for (const c of cards) {
    for (let i = 0; i <= 50; i++) {
      const t = i / 50
      await page.mouse.move(c.x + c.w * (0.1 + 0.8 * t), c.y + c.h * (0.2 + 0.6 * Math.abs(Math.sin(t * Math.PI * 2))))
      await page.waitForTimeout(14)
    }
  }
  await page.mouse.move(5, 5)
})
const sliderTop = await top('#pricing-tickets')
await jump(sliderTop - 380)
const slider = await page.$eval('#pricing-tickets', (el) => {
  const r = el.getBoundingClientRect()
  return { x: r.left, y: r.top + r.height / 2, w: r.width, v: Number(el.value), min: Number(el.min), max: Number(el.max) }
})
results.pricingSlider = await measure(async () => {
  const x0 = slider.x + 11 + (slider.w - 22) * ((slider.v - slider.min) / (slider.max - slider.min))
  const x1 = slider.x + slider.w * 0.9
  await page.mouse.move(x0, slider.y)
  await page.mouse.down()
  for (let i = 0; i <= 80; i++) {
    await page.mouse.move(x0 + (x1 - x0) * (i / 80), slider.y)
    await page.waitForTimeout(14)
  }
  for (let i = 80; i >= 0; i--) {
    await page.mouse.move(x0 + (x1 - x0) * (i / 80), slider.y)
    await page.waitForTimeout(14)
  }
  await page.mouse.up()
})

await writeFile(`.screenshots/perf-${label}.json`, JSON.stringify(results, null, 2))
console.log('renderer:', renderer)
for (const [key, r] of Object.entries(results)) {
  if (typeof r !== 'object') continue
  const m = r.mainMs
  console.log(
    `${key.padEnd(14)} frames ${String(r.frames).padStart(4)}  mean ${String(r.meanMs).padStart(5)}  p95 ${String(r.p95Ms).padStart(5)}  max ${String(r.maxMs).padStart(6)}  jank ${String(r.janky).padStart(3)}  dropped ${String(r.dropped).padStart(4)}  | busy ${m.busy ?? 0}  js ${m.js ?? 0}  style ${m.style ?? 0}  layout ${m.layout ?? 0}  paint ${m.paint ?? 0} (${r.paints})  raster ${m.raster ?? 0}  layerize ${m.layerize ?? 0}`,
  )
}
await browser.close()
