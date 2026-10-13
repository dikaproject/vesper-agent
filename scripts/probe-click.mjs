// Temporary probe: which step of a route click forces the expensive style recalc?
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
const btn = page.locator('header').getByRole('link', { name: /Start building/ })
await btn.hover()
await page.waitForTimeout(400)
const result = await page.evaluate(async () => {
  const force = () => document.body.getBoundingClientRect().top
  const time = (fn) => {
    force()
    const t = performance.now()
    fn()
    force()
    return Math.round((performance.now() - t) * 10) / 10
  }
  const link = [...document.querySelectorAll('header a')].find((a) => a.textContent?.includes('Start building'))
  const out = {}
  out.baseline = time(() => {})
  out.focusLink = time(() => link.focus())
  out.blur = time(() => link.blur())
  out.dataAttr = time(() => (document.documentElement.dataset.probe = 'x'))
  out.dataAttr2 = time(() => delete document.documentElement.dataset.probe)
  out.classHtml = time(() => document.documentElement.classList.add('probe'))
  out.mouseDownActive = time(() => link.dispatchEvent(new PointerEvent('pointerdown', { bubbles: true })))
  out.count = document.querySelectorAll('*').length
  return out
})
console.log(JSON.stringify(result, null, 1))
await browser.close()
