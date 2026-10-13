// Temporary verification helper: auth page states, flip, portal transition, footer.
// usage: node scripts/shoot-auth.mjs [width] [height] [only]
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const [w = '1440', h = '900', only = 'all'] = process.argv.slice(2)
const W = Number(w)
await mkdir('.screenshots', { recursive: true })
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: W, height: Number(h) }, deviceScaleFactor: 1 })
const errors = []
page.on('pageerror', (err) => errors.push(String(err)))
page.on('console', (msg) => (msg.type() === 'error' || msg.type() === 'warning') && errors.push(`${msg.type()}: ${msg.text()}`))
const shot = (name) => page.screenshot({ path: `.screenshots/auth-${w}-${name}.png` })
const run = (name) => only === 'all' || only.split(',').includes(name)

if (run('states')) {
  await page.goto('http://localhost:4173/login', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1800)
  await shot('login')
  console.log('inert', await page.evaluate(() => [document.getElementById('auth-panel-login')?.inert, document.getElementById('auth-panel-register')?.inert]))
  await page.locator('#auth-panel-login').getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.waitForTimeout(700)
  await shot('login-errors')
  await page.getByRole('tab', { name: 'Create account' }).click()
  await page.waitForTimeout(150)
  await shot('flip-a')
  await shot('flip-b')
  await shot('flip-c')
  await page.waitForTimeout(1400)
  await shot('register')
  await page.fill('#register-name', 'Ava Chen')
  await page.fill('#register-email', 'ava@acme.dev')
  await page.fill('#register-password', 'nightShift-24')
  await page.waitForTimeout(900)
  await shot('register-filled')
  await page.locator('#auth-panel-register').getByRole('button', { name: /Create account/ }).click()
  await page.waitForTimeout(400)
  await shot('register-loading')
  await page.waitForTimeout(3600)
  await shot('register-success')
}

if (run('portal')) {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1500)
  const cta = page.locator('header').getByRole('link', { name: /Start building/ })
  if (await cta.isVisible()) {
    await cta.click()
    for (const t of [120, 380, 640]) {
      await page.waitForTimeout(t === 120 ? 120 : 260)
      await shot(`portal-${t}`)
    }
    await page.waitForTimeout(1500)
    await shot('portal-end')
  }
}

if (run('footer')) {
  await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
  await page.waitForTimeout(1000)
  for (const [name, sel, off] of [['cta', '#get-started', 0], ['footer', 'footer', -120], ['footer-bottom', 'footer', 99999]]) {
    await page.evaluate(([s, o]) => {
      const el = document.querySelector(s)
      const top = el.getBoundingClientRect().top + window.scrollY + o
      window.scrollTo({ top: Math.min(top, document.documentElement.scrollHeight), behavior: 'instant' })
    }, [sel, off])
    await page.waitForTimeout(2200)
    await shot(name)
  }
}
console.log('errors', JSON.stringify(errors, null, 1))
await browser.close()
