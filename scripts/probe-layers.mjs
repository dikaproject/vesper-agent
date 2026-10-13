// Temporary probe: which composited layers repaint during a scenario (LayerTree paintCount diff).
// usage: node scripts/probe-layers.mjs <scenario>   scenario: uth-scroll | uth-idle | pricing-idle | pricing-hover
import { chromium } from 'playwright-core'

const [scenario = 'uth-scroll'] = process.argv.slice(2)
const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(1000)
const client = await page.context().newCDPSession(page)
await client.send('DOM.enable')
await client.send('DOM.getDocument', { depth: -1 })
let layers = []
client.on('LayerTree.layerTreeDidChange', (e) => {
  if (e.layers) layers = e.layers
})
await client.send('LayerTree.enable')

const sectionTop = (sel) => page.evaluate((s) => document.querySelector(s).getBoundingClientRect().top + window.scrollY, sel)
const go = async (y) => {
  await page.evaluate((v) => window.scrollTo(0, v), y)
  await page.waitForTimeout(1200)
}
const smooth = (a, b, v = 1000) =>
  page.evaluate(
    ([from, to, speed]) =>
      new Promise((resolve) => {
        const start = performance.now()
        const dur = (Math.abs(to - from) / speed) * 1000
        const step = (now) => {
          const t = Math.min(1, (now - start) / dur)
          window.scrollTo(0, from + (to - from) * t)
          if (t < 1) requestAnimationFrame(step)
          else resolve()
        }
        requestAnimationFrame(step)
      }),
    [a, b, v],
  )

let run
if (scenario.startsWith('uth')) {
  const top = await sectionTop('#under-the-hood')
  const h = await page.evaluate(() => document.querySelector('#under-the-hood').getBoundingClientRect().height)
  if (scenario === 'uth-scroll') {
    await go(top + 200)
    run = () => smooth(top + 200, top + h - 900)
  } else {
    await go(top + 1300)
    run = () => page.waitForTimeout(2000)
  }
} else {
  const top = await sectionTop('#pricing')
  await go(top + 380)
  if (scenario === 'pricing-idle') run = () => page.waitForTimeout(2000)
  else {
    const c = await page.$eval('#pricing .spotlight', (e) => {
      const r = e.getBoundingClientRect()
      return { x: r.left, y: r.top, w: r.width, h: Math.min(r.height, 860 - r.top) }
    })
    run = async () => {
      for (let i = 0; i <= 60; i++) {
        await page.mouse.move(c.x + c.w * (0.1 + 0.8 * (i / 60)), c.y + c.h * (0.2 + 0.6 * Math.abs(Math.sin((i / 60) * Math.PI * 2))))
        await page.waitForTimeout(14)
      }
    }
  }
}

await page.waitForTimeout(300)
const before = new Map(layers.map((l) => [l.layerId, l.paintCount ?? 0]))
await run()
await page.waitForTimeout(300)
const rows = []
for (const l of layers) {
  const delta = (l.paintCount ?? 0) - (before.get(l.layerId) ?? 0)
  if (delta <= 0) continue
  let desc = '(no node)'
  if (l.backendNodeId) {
    try {
      const { node } = await client.send('DOM.describeNode', { backendNodeId: l.backendNodeId })
      const attrs = node.attributes ?? []
      const cls = attrs[attrs.indexOf('class') + 1] ?? ''
      desc = `${node.localName}.${cls.slice(0, 110)}`
    } catch {
      desc = '(detached)'
    }
  }
  rows.push({ delta, size: `${Math.round(l.width)}x${Math.round(l.height)}`, desc })
}
rows.sort((a, b) => b.delta - a.delta)
console.log(`layers: ${layers.length}, repainted: ${rows.length}`)
for (const r of rows.slice(0, 25)) console.log(String(r.delta).padStart(5), r.size.padStart(10), r.desc)
await browser.close()
