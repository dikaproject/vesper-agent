// Temporary probe: environment media features + computed animation state of a twinkle star.
import { chromium } from 'playwright-core'

const browser = await chromium.launch({ channel: 'msedge' })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' })
await page.waitForTimeout(800)
const out = await page.evaluate(() => {
  const star = document.querySelector('.twinkle-star')
  const cs = star && getComputedStyle(star)
  const anim = star?.getAnimations()[0]
  return {
    reducedMotion: matchMedia('(prefers-reduced-motion: reduce)').matches,
    ua: navigator.userAgent,
    dpr: devicePixelRatio,
    duration: cs?.animationDuration,
    iteration: cs?.animationIterationCount,
    playState: anim?.playState,
    currentTime: anim?.currentTime,
  }
})
console.log(JSON.stringify(out, null, 2))
await browser.close()
