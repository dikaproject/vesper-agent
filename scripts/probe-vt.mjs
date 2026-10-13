// Temporary probe: does the route change run inside a View Transition? Samples data-vt + pseudo animations.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const logs = []
page.on('console', (m) => logs.push(`${m.type()}: ${m.text()}`))
page.on('pageerror', (e) => logs.push(`pageerror: ${e}`))
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1200)
await page.evaluate(() => {
  window.__vt = []
  const t0 = performance.now()
  const orig = document.startViewTransition?.bind(document)
  window.__hasVT = typeof orig === 'function'
  if (orig) {
    document.startViewTransition = (cb) => {
      window.__vt.push({ at: Math.round(performance.now() - t0), ev: 'start' })
      const t = orig(cb)
      t.ready.then(() => window.__vt.push({ at: Math.round(performance.now() - t0), ev: 'ready' }), (e) => window.__vt.push({ ev: 'ready-rejected', msg: String(e) }))
      t.updateCallbackDone.then(() => window.__vt.push({ at: Math.round(performance.now() - t0), ev: 'updated' }), (e) => window.__vt.push({ ev: 'update-rejected', msg: String(e) }))
      t.finished.then(() => window.__vt.push({ at: Math.round(performance.now() - t0), ev: 'finished' }))
      return t
    }
  }
  const sample = () => {
    const anims = document.getAnimations().filter((a) => a.effect?.pseudoElement?.includes('view-transition'))
    window.__vt.push({
      at: Math.round(performance.now() - t0),
      vt: document.documentElement.dataset.vt ?? null,
      pseudo: anims.map((a) => `${a.effect.pseudoElement}:${a.animationName}:${Math.round(a.currentTime ?? -1)}`).join(' | '),
    })
    if (performance.now() - t0 < 1600) setTimeout(sample, 80)
  }
  sample()
})
await page.locator('header').getByRole('link', { name: /Start building/ }).click()
await page.waitForTimeout(1800)
const out = await page.evaluate(() => ({ has: window.__hasVT, vt: window.__vt, path: location.pathname }))
console.log(JSON.stringify(out, null, 1))
console.log(logs.join('\n'))
await browser.close()
