// Temporary QA sweep: console errors, horizontal overflow, offscreen elements, full-page shots per viewport.
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

await mkdir('.screenshots/qa', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const VIEWPORTS = [
  [1440, 900],
  [1024, 768],
  [768, 1024],
  [390, 844],
]
const ROUTES = ['/', '/login', '/register?plan=night']

for (const [w, h] of VIEWPORTS) {
  for (const route of ROUTES) {
    const page = await browser.newPage({ viewport: { width: w, height: h } })
    const errors = []
    page.on('pageerror', (e) => errors.push(`pageerror: ${e}`))
    page.on('console', (m) => (m.type() === 'error' || m.type() === 'warning') && errors.push(`${m.type()}: ${m.text()}`))
    page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()}`))
    page.on('response', (r) => r.status() >= 400 && errors.push(`${r.status()}: ${r.url()}`))
    await page.goto(`http://localhost:4173${route}`, { waitUntil: 'networkidle' })
    await page.waitForTimeout(1200)
    // walk the page so whileInView reveals fire
    const total = await page.evaluate(() => document.documentElement.scrollHeight)
    for (let y = 0; y < total; y += Math.round(h * 0.7)) {
      await page.evaluate((v) => window.scrollTo(0, v), y)
      await page.waitForTimeout(140)
    }
    await page.waitForTimeout(800)
    const report = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth
      const offenders = []
      for (const el of document.querySelectorAll('body *')) {
        const cs = getComputedStyle(el)
        if (cs.position === 'fixed' || el.closest('[aria-hidden="true"]') || el.closest('.pointer-events-none')) continue
        const r = el.getBoundingClientRect()
        if (r.width === 0 || r.height === 0) continue
        if (r.right > vw + 1 || r.left < -1) {
          // ignore descendants of clipped ancestors
          let clipped = false
          for (let p = el.parentElement; p && p !== document.body; p = p.parentElement) {
            const o = getComputedStyle(p)
            if (/(hidden|clip|auto|scroll)/.test(o.overflowX)) {
              const pr = p.getBoundingClientRect()
              if (pr.right <= vw + 1 && pr.left >= -1) clipped = true
              break
            }
          }
          if (!clipped) offenders.push(`${el.tagName.toLowerCase()}.${String(el.className).slice(0, 70)} [${Math.round(r.left)}..${Math.round(r.right)}]`)
        }
      }
      const imgs = [...document.images].filter((i) => !i.complete || i.naturalWidth === 0).map((i) => i.src)
      const unnamed = [...document.querySelectorAll('a,button')].filter((el) => !el.closest('[inert]') && !(el.getAttribute('aria-label') || el.textContent?.trim())).map((el) => el.outerHTML.slice(0, 90))
      const ids = {}
      for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] ?? 0) + 1
      const dupes = Object.entries(ids).filter(([, n]) => n > 1).map(([k]) => k)
      return {
        scrollW: document.documentElement.scrollWidth,
        vw,
        offenders: offenders.slice(0, 8),
        brokenImages: imgs,
        unnamed: unnamed.slice(0, 5),
        dupeIds: dupes,
        title: document.title,
      }
    })
    const name = `${w}${route.replace(/[/?=]/g, '_') || '_home'}`
    await page.evaluate(() => window.scrollTo(0, 0))
    await page.waitForTimeout(400)
    if (route !== '/') await page.screenshot({ path: `.screenshots/qa/${name}.png`, fullPage: true })
    const bad = errors.length || report.offenders.length || report.brokenImages.length || report.unnamed.length || report.dupeIds.length || report.scrollW > report.vw
    console.log(`${bad ? '!!' : 'ok'} ${w}x${h} ${route}  title="${report.title}" scrollW=${report.scrollW}/${report.vw}`)
    if (bad) console.log(JSON.stringify({ errors: errors.slice(0, 8), ...report, title: undefined }, null, 1))
    await page.close()
  }
}
await browser.close()
