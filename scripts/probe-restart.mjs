// Temporary experiment: idle main-thread cost as-is vs. after pause/resume of CSS animations.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
await page.evaluate(() => window.scrollTo(0, document.querySelector('#pricing').getBoundingClientRect().top + window.scrollY + 380))
await page.waitForTimeout(1500)
const client = await page.context().newCDPSession(page)
await client.send('Performance.enable')
const metric = async () => {
  const { metrics } = await client.send('Performance.getMetrics')
  const m = Object.fromEntries(metrics.map((x) => [x.name, x.value]))
  return { style: m.RecalcStyleDuration, layout: m.LayoutDuration, task: m.TaskDuration, styles: m.RecalcStyleCount }
}
const idle = async (label) => {
  const a = await metric()
  await page.waitForTimeout(2000)
  const b = await metric()
  console.log(
    label.padEnd(10),
    `style ${((b.style - a.style) * 1000).toFixed(0)}ms (${b.styles - a.styles} recalcs)  task ${((b.task - a.task) * 1000).toFixed(0)}ms per 2s`,
  )
}
await idle('as-is')
await page.addStyleTag({ content: '.__p *, .__p *::before, .__p *::after { animation-play-state: paused !important }' })
await page.evaluate(() => document.body.classList.add('__p'))
await page.waitForTimeout(300)
await idle('paused')
await page.evaluate(() => document.body.classList.remove('__p'))
await page.waitForTimeout(300)
await idle('resumed')
await browser.close()
