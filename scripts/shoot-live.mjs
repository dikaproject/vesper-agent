// Temporary verification helper: viewport shots of sections at a given width.
// usage: node scripts/shoot-live.mjs <width> <height> "selector:offset,selector:offset" [route]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [w = '390', h = '844', list = '#get-started:0,footer:0', route = '/'] = process.argv.slice(2)
await mkdir('.screenshots/qa', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) } })
await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
let i = 0
for (const item of list.split(',')) {
  const [sel, off] = item.split(':')
  await page.evaluate(([s, o]) => {
    const el = document.querySelector(s)
    if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + Number(o), behavior: 'instant' })
  }, [sel, off ?? '0'])
  await page.waitForTimeout(2000)
  await page.screenshot({ path: `.screenshots/qa/sec-${w}-${i++}.png` })
}
await browser.close()
