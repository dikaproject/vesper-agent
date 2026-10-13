// Temporary verification helper: captures viewport screenshots at scroll offsets.
// usage: node scripts/screenshot.mjs <url> <outDir> <width> <height> <y1,y2,...> [prefix]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [url = 'http://localhost:4173/', out = '.screenshots', w = '1440', h = '900', ys = '0', prefix = 'shot'] = process.argv.slice(2)
const width = Number(w)
const height = Number(h)
const offsets = ys.split(',').map(Number)

await mkdir(out, { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width, height }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
page.on('pageerror', (err) => errors.push(String(err)))

await page.goto(url, { waitUntil: 'networkidle' })
await page.waitForTimeout(2600)
for (const y of offsets) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: 'instant' }), y)
  await page.waitForTimeout(1900)
  await page.screenshot({ path: `${out}/${prefix}-${width}-${y}.png` })
}
const total = await page.evaluate(() => document.documentElement.scrollHeight)
console.log('scrollHeight', total)
console.log('errors', JSON.stringify(errors))
await browser.close()
