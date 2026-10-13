// Temporary verification helper: captures the Night Shift stage at scroll progress values.
// usage: node scripts/shoot-night.mjs "0,0.3,0.6,0.95" [width] [height]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [list = '0,0.5,0.95', w = '1440', h = '900', id = 'night-shift'] = process.argv.slice(2)
await mkdir('.screenshots', { recursive: true })

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)

for (const p of list.split(',').map(Number)) {
  await page.evaluate(([progress, sectionId]) => {
    const sticky = document.querySelector(`#${sectionId} .sticky`)
    const track = sticky?.parentElement
    if (!track) return
    const top = track.getBoundingClientRect().top + window.scrollY
    const range = track.offsetHeight - window.innerHeight
    window.scrollTo({ top: top + progress * range, behavior: 'instant' })
  }, [p, id])
  await page.waitForTimeout(1700)
  await page.screenshot({ path: `.screenshots/${id}-${w}-${String(p).replace('.', '_')}.png` })
}
console.log('errors', JSON.stringify(errors))
await browser.close()
