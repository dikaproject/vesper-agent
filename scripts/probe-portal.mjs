// Temporary probe: capture the portal transition mid-flight via CDP (Playwright screenshots can skip a VT).
import { writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [from = '/', label = 'open', selector = 'header a[href="/register"]'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(`http://localhost:4173${from}`, { waitUntil: 'networkidle' })
await page.waitForTimeout(3000)
const cdp = await page.context().newCDPSession(page)
const box = await page.locator(selector).first().boundingBox()
await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2)
const t0 = Date.now()
const marks = label === 'open' ? [330, 520, 720, 960] : [300, 480, 660]
for (const at of marks) {
  const wait = at - (Date.now() - t0)
  if (wait > 0) await new Promise((r) => setTimeout(r, wait))
  const { data } = await cdp.send('Page.captureScreenshot', { format: 'jpeg', quality: 70 })
  await writeFile(`.screenshots/portal-${label}-${at}.jpg`, Buffer.from(data, 'base64'))
  const state = await page.evaluate(() =>
    document
      .getAnimations()
      .filter((a) => a.effect?.pseudoElement)
      .map((a) => `${a.effect.pseudoElement}${a.animationName ? `:${a.animationName}` : ':js'}@${Math.round(a.currentTime ?? -1)}`)
      .join(' | '),
  )
  console.log(at, state || '(no view transition)')
}
console.log('path', await page.evaluate(() => location.pathname), 'errors', JSON.stringify(errors))
await browser.close()
