// Temporary verification helper: pricing cards, billing toggle and estimator states.
// usage: node scripts/shoot-pricing.mjs [width] [height]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [w = '1440', h = '900'] = process.argv.slice(2)
await mkdir('.screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: Number(w), height: Number(h) }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => msg.type() === 'error' && errors.push(msg.text()))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)

const scrollTo = async (selector, offset = 0) => {
  await page.evaluate(
    ([sel, off]) => {
      const el = document.querySelector(sel)
      if (el) window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY + off, behavior: 'instant' })
    },
    [selector, offset],
  )
  await page.waitForTimeout(1600)
}

const setTickets = async (value) => {
  await page.evaluate((v) => {
    const input = document.getElementById('pricing-tickets')
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set
    setter?.call(input, String(v))
    input?.dispatchEvent(new Event('input', { bubbles: true }))
  }, value)
  await page.waitForTimeout(1300)
}

await scrollTo('#pricing', 380)
await page.screenshot({ path: `.screenshots/pricing-${w}-cards.png` })
await page.getByRole('button', { name: /Yearly/ }).click()
await page.waitForTimeout(1200)
await page.screenshot({ path: `.screenshots/pricing-${w}-yearly.png` })
await scrollTo('#pricing-tickets', -320)
await page.screenshot({ path: `.screenshots/pricing-${w}-est-60.png` })
await setTickets(10)
await page.screenshot({ path: `.screenshots/pricing-${w}-est-10.png` })
await setTickets(480)
await page.screenshot({ path: `.screenshots/pricing-${w}-est-480.png` })
console.log('errors', JSON.stringify(errors))
await browser.close()
