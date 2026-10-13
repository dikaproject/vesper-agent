// Temporary probe: which CSS animations / timers keep the main thread busy while idle.
import { chromium } from 'playwright-core'

const [section = '#pricing', offset = '380'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.addInitScript(() => {
  window.__timers = { timeout: 0, interval: 0, raf: 0 }
  const st = window.setTimeout
  const si = window.setInterval
  const raf = window.requestAnimationFrame
  window.setTimeout = (...a) => (window.__timers.timeout++, st(...a))
  window.setInterval = (...a) => (window.__timers.interval++, si(...a))
  window.requestAnimationFrame = (cb) => (window.__timers.raf++, raf(cb))
})
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.evaluate(
  ([sel, off]) => window.scrollTo(0, document.querySelector(sel).getBoundingClientRect().top + window.scrollY + off),
  [section, Number(offset)],
)
await page.waitForTimeout(1500)
const t0 = await page.evaluate(() => ({ ...window.__timers }))
await page.waitForTimeout(2000)
const t1 = await page.evaluate(() => ({ ...window.__timers }))
const anims = await page.evaluate(() => {
  const groups = {}
  for (const a of document.getAnimations()) {
    const el = a.effect?.target
    const svg = el instanceof SVGElement && !(el instanceof SVGSVGElement)
    const name = a.animationName ?? a.transitionProperty ?? a.constructor.name
    const section = el?.closest('section')?.id || el?.closest('header') ? 'header' : el?.closest('section')?.id ?? '-'
    const key = `${name} | ${svg ? 'SVG child' : el?.tagName?.toLowerCase()} | ${el?.closest('section')?.id ?? section}`
    groups[key] = (groups[key] ?? 0) + (a.playState === 'running' ? 1 : 0)
  }
  return Object.entries(groups).sort((a, b) => b[1] - a[1])
})
console.log('timers in 2s:', JSON.stringify({ timeout: t1.timeout - t0.timeout, interval: t1.interval - t0.interval, raf: t1.raf - t0.raf }))
for (const [k, v] of anims) console.log(String(v).padStart(4), k)
await browser.close()
