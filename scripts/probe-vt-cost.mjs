// Temporary probe: cost of starting a no-op view transition on the landing page (is the full recalc inherent?).
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(2500)
for (const variant of ['noop', 'noop-attr']) {
  await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] })
  await page.evaluate((v) => {
    if (v === 'noop-attr') document.documentElement.dataset.vt = 'fade'
    const t = document.startViewTransition(() => {})
    return t.finished.then(() => {
      delete document.documentElement.dataset.vt
    })
  }, variant)
  await page.waitForTimeout(300)
  const events = JSON.parse((await browser.stopTracing()).toString()).traceEvents
  const recalcs = events
    .filter((e) => e.name === 'UpdateLayoutTree' && e.ph === 'X' && e.dur > 5000)
    .map((e) => `${(e.dur / 1000).toFixed(1)}ms/${e.args?.elementCount ?? '?'}`)
  console.log(variant.padEnd(10), 'big recalcs:', recalcs.join(', ') || 'none')
}
await browser.close()
