// Temporary probe: list CSS animations that FAILED to run on the compositor (main-thread animations).
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline', 'blink.animations'] })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
const total = await page.evaluate(() => document.documentElement.scrollHeight)
for (let y = 0; y < total; y += 700) {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(250)
}
const buf = await browser.stopTracing()
const events = JSON.parse(buf.toString()).traceEvents
const idOf = (e) => e.id ?? e.id2?.local ?? e.id2?.global
const info = new Map()
for (const e of events) {
  if (e.name === 'Animation' && e.ph === 'b' && e.args?.data) info.set(idOf(e), e.args.data)
}
const failed = new Map()
let okCount = 0
for (const e of events) {
  if (e.name !== 'Animation' || e.args?.data?.compositeFailed === undefined) continue
  const d = e.args.data
  if (!d.compositeFailed) {
    okCount++
    continue
  }
  const meta = info.get(idOf(e)) ?? {}
  const node = (meta.nodeName ?? '?').slice(0, 90)
  const key = `${meta.displayName ?? '?'} fail=${d.compositeFailed}${d.unsupportedProperties ? ` [${d.unsupportedProperties.join(',')}]` : ''} :: ${node}`
  failed.set(key, (failed.get(key) ?? 0) + 1)
}
console.log('main-thread animations:')
for (const [k, v] of [...failed].sort((a, b) => b[1] - a[1]).slice(0, 40)) console.log(String(v).padStart(4), k)
console.log('composited OK:', okCount)
await browser.close()
