// Temporary experiment: does a trivial opacity/transform animation composite in this browser?
import { chromium } from 'playwright-core'

const variants = {
  plain: '',
  reducedRule: '@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .001ms !important } }',
  hiddenRule: '[hidden]:where(:not([hidden=until-found])) { display: none !important }',
  importantOther: '.x { color: red !important }',
}
const browser = await chromium.launch({ channel: 'msedge' })
for (const [name, extra] of Object.entries(variants)) {
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } })
  await browser.startTracing(page, { categories: ['devtools.timeline', 'disabled-by-default-devtools.timeline'] })
  await page.setContent(`<!doctype html><style>
    @keyframes tw { 0%,100% { opacity: .2; transform: scale(.8) } 50% { opacity: 1; transform: scale(1) } }
    .s { position: absolute; left: 100px; top: 100px; width: 40px; height: 40px; background: orange; animation: tw 2s ease-in-out infinite }
    ${extra}
  </style><div class="s x"></div>`)
  await page.waitForTimeout(800)
  const events = JSON.parse((await browser.stopTracing()).toString()).traceEvents
  const fails = events.filter((e) => e.name === 'Animation' && e.args?.data?.compositeFailed !== undefined).map((e) => e.args.data.compositeFailed)
  console.log(name.padEnd(15), JSON.stringify(fails))
  await page.close()
}
await browser.close()
