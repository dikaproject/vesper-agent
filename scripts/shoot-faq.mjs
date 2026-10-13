// Temporary verification helper: FAQ console states (desktop) and accordion (mobile).
// usage: node scripts/shoot-faq.mjs [width] [height]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [w = '1440', h = '900'] = process.argv.slice(2)
const desktop = Number(w) >= 1024
await mkdir('.screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

await page.evaluate(() => {
  const el = document.querySelector('#faq')
  if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + 300, behavior: 'instant' })
})
const shot = (name) => page.screenshot({ path: `.screenshots/faq-${w}-${name}.png` })

if (desktop) {
  await page.waitForTimeout(1500)
  await shot('thinking')
  await page.waitForTimeout(1300)
  await shot('streaming')
  await page.waitForTimeout(3200)
  await shot('done')
  await page.fill('#faq-ask', 'can we host it on aws?')
  await page.press('#faq-ask', 'Enter')
  await page.waitForTimeout(5200)
  await shot('custom')
  await page.fill('#faq-ask', 'do you have a mascot')
  await page.press('#faq-ask', 'Enter')
  await page.waitForTimeout(4500)
  await shot('fallback')
} else {
  await page.waitForTimeout(1500)
  await page.getByRole('button', { name: /What happens when an agent gets stuck/ }).click()
  await page.waitForTimeout(900)
  await shot('accordion')
}
console.log('errors', JSON.stringify(errors))
await browser.close()
