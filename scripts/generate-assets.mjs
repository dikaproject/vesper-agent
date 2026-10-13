// Portfolio mockups + brand assets, rendered from the real site.
// 1. npm run build && npx vite preview --port 4173
// 2. npm run assets
// Output: mockups/*.png (HD presentation shots) and public/{og-image,icon-192,icon-512,apple-touch-icon}.png
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { chromium } from 'playwright-core'

const BASE = process.env.BASE_URL ?? 'http://localhost:4173'
const OUT = 'mockups'
await mkdir(`${OUT}/raw`, { recursive: true })
const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL ?? 'msedge' })
const wait = (ms) => new Promise((r) => setTimeout(r, ms))

/* ------------------------------------------------------------------ */
/* 1. Capture the live site                                            */
/* ------------------------------------------------------------------ */
async function capture(name, { route = '/', w = 1440, h = 900, dpr = 2, prep }) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr })
  await page.goto(BASE + route, { waitUntil: 'networkidle' })
  await page.evaluate(() => document.fonts.ready)
  await wait(1200)
  if (prep) await prep(page)
  const file = `${OUT}/raw/${name}.png`
  await page.screenshot({ path: file })
  await page.close()
  console.log('captured', name)
  return file
}

const scrollTo = (selector, offset = 0, settle = 2200) => async (page) => {
  // walk down so whileInView reveals on the way have fired
  const target = await page.evaluate(([s, o]) => document.querySelector(s).getBoundingClientRect().top + window.scrollY + o, [selector, offset])
  for (let y = 0; y < target; y += 600) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await wait(60)
  }
  await page.evaluate((v) => window.scrollTo(0, v), target)
  await wait(settle)
}

const trackAt = (sectionId, progress, settle = 2200) => async (page) => {
  const target = await page.evaluate(
    ([id, p]) => {
      const track = document.querySelector(`#${id} .sticky`).parentElement
      const top = track.getBoundingClientRect().top + window.scrollY
      return top + p * (track.offsetHeight - window.innerHeight)
    },
    [sectionId, progress],
  )
  for (let y = 0; y < target; y += 700) {
    await page.evaluate((v) => window.scrollTo(0, v), y)
    await wait(50)
  }
  await page.evaluate((v) => window.scrollTo(0, v), target)
  await wait(settle)
}

const fillRegister = async (page) => {
  await page.fill('#register-name', 'Ava Chen')
  await page.fill('#register-email', 'ava@acme.dev')
  await page.fill('#register-password', 'nightShift-24')
  await page.locator('#register-name').blur()
  await wait(900)
}

const D = { w: 1440, h: 900, dpr: 2 }
const M = { w: 390, h: 844, dpr: 3 }
// --bg: background plates only (no site captures, preview server not needed)
const BG_ONLY = process.argv.includes('--bg')
const shots = BG_ONLY ? {} : {
  hero: await capture('desktop-hero', { ...D, prep: () => wait(5200) }),
  live: await capture('desktop-live-run', { ...D, prep: scrollTo('#platform', 40, 7000) }),
  night: await capture('desktop-night-shift', { ...D, prep: trackAt('night-shift', 0.62) }),
  stack: await capture('desktop-under-the-hood', { ...D, prep: trackAt('under-the-hood', 0.5) }),
  pricing: await capture('desktop-pricing', { ...D, prep: scrollTo('#pricing', 330) }),
  faq: await capture('desktop-faq', { ...D, prep: scrollTo('#faq', 250, 7500) }),
  cta: await capture('desktop-final-cta', { ...D, prep: scrollTo('#get-started', 40) }),
  login: await capture('desktop-login', { ...D, route: '/login', prep: () => wait(2400) }),
  register: await capture('desktop-register', { ...D, route: '/register?plan=night', prep: async (p) => (await wait(1600), fillRegister(p)) }),
  flip: await capture('desktop-flip', {
    ...D,
    route: '/login',
    prep: async (p) => {
      await wait(1800)
      await p.getByRole('tab', { name: 'Create account' }).click()
      await wait(210)
    },
  }),
  mHero: await capture('mobile-hero', { ...M, prep: () => wait(3500) }),
  mPricing: await capture('mobile-pricing', { ...M, prep: scrollTo('#pricing', 520) }),
  mRegister: await capture('mobile-register', { ...M, route: '/register?plan=night', prep: async (p) => (await wait(1400), fillRegister(p)) }),
  mLogin: await capture('mobile-login', { ...M, route: '/login', prep: () => wait(2000) }),
  mFaq: await capture('mobile-faq', { ...M, prep: scrollTo('#faq', 300) }),
}

/* ------------------------------------------------------------------ */
/* 2. Compose mockups (HTML scenes rendered at 4K)                     */
/* ------------------------------------------------------------------ */
const dataUrl = async (file, type = 'image/png') => `data:${type};base64,${(await readFile(file)).toString('base64')}`
const img = Object.fromEntries(await Promise.all(Object.entries(shots).map(async ([k, f]) => [k, await dataUrl(f)])))
const font = await dataUrl('node_modules/@fontsource-variable/geist/files/geist-latin-wght-normal.woff2', 'font/woff2')
const mono = await dataUrl('node_modules/@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2', 'font/woff2')
const favicon = await dataUrl('public/favicon.svg', 'image/svg+xml')

const BASE_CSS = `
@font-face { font-family: Geist; src: url(${font}) format('woff2'); font-weight: 100 900; }
@font-face { font-family: GeistMono; src: url(${mono}) format('woff2'); font-weight: 100 900; }
* { box-sizing: border-box; margin: 0; padding: 0; }
html, body { width: 100%; height: 100%; }
body { position: relative; overflow: hidden; background: #0a0908; color: #f2ede7; font-family: Geist, system-ui, sans-serif; -webkit-font-smoothing: antialiased; }
.bg { position: absolute; inset: 0; overflow: hidden; }
.bg .glow { position: absolute; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,108,44,.28), rgba(255,108,44,.08) 55%, transparent); }
.bg .grid { position: absolute; inset: 0; opacity: .5;
  background-image: linear-gradient(to right, rgba(255,255,255,.035) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,.035) 1px, transparent 1px);
  background-size: 96px 96px; -webkit-mask-image: radial-gradient(ellipse 60% 60% at 50% 45%, #000 20%, transparent 78%); }
.bg .horizon { position: absolute; left: 50%; transform: translateX(-50%); border-radius: 50%; border-top: 2px solid rgba(255,165,109,.45);
  background: radial-gradient(48% 30% at 50% 0%, rgba(255,108,44,.22), transparent), #080706; box-shadow: 0 -80px 220px -60px rgba(255,108,44,.6); }
.bg canvas { position: absolute; inset: 0; }
.grain { position: absolute; inset: 0; opacity: .06; pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 220 220' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E"); }
.shot { display: block; width: 100%; height: 100%; object-fit: cover; object-position: top center; }

/* browser window */
.browser { position: absolute; border-radius: 22px; overflow: hidden; background: #131110;
  box-shadow: 0 0 0 1.5px rgba(255,255,255,.1), 0 2px 0 0 rgba(255,255,255,.06) inset, 0 80px 160px -40px rgba(0,0,0,.95), 0 0 200px -60px rgba(255,108,44,.45); }
.browser .bar { height: 56px; display: flex; align-items: center; gap: 22px; padding: 0 24px; background: linear-gradient(180deg,#1f1b19,#171412); border-bottom: 1px solid rgba(255,255,255,.06); }
.browser .dots { display: flex; gap: 10px; } .browser .dots i { width: 14px; height: 14px; border-radius: 50%; background: #3a342f; }
.browser .dots i:nth-child(1) { background: #ff6f5b; } .browser .dots i:nth-child(2) { background: #ffbd4c; } .browser .dots i:nth-child(3) { background: #3fcf6e; }
.browser .url { flex: 1; max-width: 560px; margin: 0 auto; height: 34px; border-radius: 10px; background: rgba(255,255,255,.05); display: flex; align-items: center; justify-content: center; gap: 10px;
  font: 500 16px GeistMono, monospace; color: #948a81; }
.browser .url b { color: #f2ede7; font-weight: 500; }
.browser .url img { width: 18px; height: 18px; }
.browser .view { position: absolute; left: 0; right: 0; top: 56px; bottom: 0; }

/* phone */
.phone { position: absolute; border-radius: 74px; padding: 14px; background: linear-gradient(145deg,#3a332e,#121010 40%,#2a2420);
  box-shadow: 0 0 0 2px rgba(255,255,255,.08) inset, 0 0 0 1.5px #050404, 0 70px 140px -30px rgba(0,0,0,.95), 0 0 160px -50px rgba(255,108,44,.5); }
.phone .screen { position: relative; width: 100%; height: 100%; border-radius: 60px; overflow: hidden; background: #0a0908; }
.phone .island { position: absolute; z-index: 2; left: 50%; top: 22px; width: 130px; height: 38px; transform: translateX(-50%); border-radius: 20px; background: #000; }
.phone .btn { position: absolute; width: 5px; border-radius: 3px; background: #2a2420; }

/* laptop */
.laptop { position: absolute; }
.laptop .lid { position: absolute; inset: 0 0 auto 0; border-radius: 34px 34px 10px 10px; padding: 26px 26px 34px; background: linear-gradient(180deg,#2c2622,#141110);
  box-shadow: 0 0 0 2px rgba(255,255,255,.07) inset, 0 0 0 1.5px #050404, 0 90px 180px -40px rgba(0,0,0,.95), 0 0 220px -60px rgba(255,108,44,.5); }
.laptop .display { position: relative; width: 100%; height: 100%; border-radius: 10px; overflow: hidden; background: #000; }
.laptop .cam { position: absolute; left: 50%; top: 10px; width: 9px; height: 9px; margin-left: -4px; border-radius: 50%; background: #0b0a09; box-shadow: 0 0 0 2px #1f1b19; }
.laptop .base { position: absolute; left: -7%; right: -7%; height: 30px; border-radius: 4px 4px 26px 26px;
  background: linear-gradient(180deg,#4a413a 0%,#2a2420 30%,#141110 100%); box-shadow: 0 40px 70px -20px rgba(0,0,0,.95); }
.laptop .base::before { content: ''; position: absolute; left: 50%; top: 0; width: 15%; height: 12px; transform: translateX(-50%); border-radius: 0 0 14px 14px; background: #1a1614; }

/* type */
.eyebrow { font: 500 22px GeistMono, monospace; letter-spacing: .24em; text-transform: uppercase; color: rgba(255,165,109,.9); display: flex; align-items: center; gap: 18px; }
.eyebrow::before, .eyebrow::after { content: ''; width: 56px; height: 1.5px; background: linear-gradient(90deg, transparent, rgba(255,135,72,.8)); }
.eyebrow::after { transform: scaleX(-1); }
.title { font-weight: 500; letter-spacing: -.05em; line-height: 1.02;
  background: linear-gradient(180deg,#fff 0%,#fbf3ec 40%,#9d938a 125%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.title em { font-style: normal; background: linear-gradient(180deg,#ffeadb 0%,#ffb182 42%,#ff6c2c 100%); -webkit-background-clip: text; background-clip: text; color: transparent; }
.muted { color: #948a81; }
.tag { display: inline-flex; align-items: center; gap: 12px; padding: 12px 22px; border-radius: 999px; font: 500 20px GeistMono, monospace; color: #bbb1a7;
  background: linear-gradient(180deg, rgba(255,255,255,.07), rgba(255,255,255,.02)); border: 1px solid rgba(255,255,255,.09); }
.tag i { width: 9px; height: 9px; border-radius: 50%; background: #ff8748; box-shadow: 0 0 12px #ff6c2c; }
.brand { display: flex; align-items: center; gap: 18px; font-size: 34px; font-weight: 600; letter-spacing: -.03em; color: #fbf8f4; }
.brand img { width: 60px; height: 60px; }
`

/** Stars painted once into a canvas (same recipe as the site's Starfield). */
const STARS_JS = `
for (const c of document.querySelectorAll('canvas[data-stars]')) {
  const r = c.getBoundingClientRect(); c.width = r.width; c.height = r.height
  const ctx = c.getContext('2d'); let s = Number(c.dataset.stars) || 7
  const rand = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296 }
  const n = Math.round(r.width * r.height / 5200)
  for (let i = 0; i < n; i++) {
    const d = rand(), rad = d * d * 1.6 + .4, a = .14 + rand() * .55, x = rand() * r.width, y = rand() * r.height
    ctx.fillStyle = rand() < .25 ? 'rgba(255,196,158,' + a + ')' : 'rgba(255,247,240,' + a + ')'
    ctx.beginPath(); ctx.arc(x, y, rad, 0, 7); ctx.fill()
    if (rad > 1.4 && a > .5) { ctx.fillStyle = 'rgba(255,170,120,' + a * .12 + ')'; ctx.beginPath(); ctx.arc(x, y, rad * 5, 0, 7); ctx.fill() }
  }
}`

/* building blocks (all positions in scene px) */
const browserEl = ({ x, y, w, src, path = '', style = '' }) => {
  const h = Math.round(w * (900 / 1440)) + 56
  return `<div class="browser" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}">
    <div class="bar"><div class="dots"><i></i><i></i><i></i></div>
      <div class="url"><img src="${favicon}" alt="">vesper.dev<b>${path}</b></div><div style="width:66px"></div></div>
    <div class="view"><img class="shot" src="${src}" alt=""></div></div>`
}
const phoneEl = ({ x, y, w, src, style = '' }) => {
  const h = Math.round((w - 28) * (844 / 390)) + 28
  return `<div class="phone" style="left:${x}px;top:${y}px;width:${w}px;height:${h}px;${style}">
    <i class="btn" style="left:-4px;top:${h * 0.2}px;height:${h * 0.06}px"></i><i class="btn" style="left:-4px;top:${h * 0.3}px;height:${h * 0.1}px"></i>
    <i class="btn" style="right:-4px;top:${h * 0.26}px;height:${h * 0.14}px"></i>
    <div class="screen"><div class="island"></div><img class="shot" src="${src}" alt=""></div></div>`
}
const laptopEl = ({ x, y, w, src }) => {
  const sh = Math.round((w - 52) * (900 / 1440)) + 60
  return `<div class="laptop" style="left:${x}px;top:${y}px;width:${w}px;height:${sh + 30}px">
    <div class="lid" style="height:${sh}px"><span class="cam"></span><div class="display"><img class="shot" src="${src}" alt=""></div></div>
    <div class="base" style="top:${sh - 2}px"></div></div>`
}
const backdrop = ({ w, h, seed = 7, glows = [], horizon }) => `<div class="bg">
  <canvas data-stars="${seed}" style="width:${w}px;height:${h}px"></canvas><div class="grid"></div>
  ${glows.map(([x, y, s, o = 1]) => `<div class="glow" style="left:${x - s / 2}px;top:${y - s / 2}px;width:${s}px;height:${s}px;opacity:${o}"></div>`).join('')}
  ${horizon ? `<div class="horizon" style="top:${horizon.y}px;width:${horizon.w}px;height:${horizon.w * 0.4}px"></div>` : ''}
</div>`

async function render(name, { w, h, body, dpr = 1, transparent = false }) {
  const page = await browser.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: dpr })
  const extra = transparent ? 'html,body{background:transparent!important}' : ''
  await page.setContent(`<!doctype html><html><head><meta charset="utf-8"><style>${BASE_CSS}${extra}</style></head>
    <body>${body}${transparent ? '' : '<div class="grain"></div>'}<script>${STARS_JS}</script></body></html>`)
  await page.evaluate(() => Promise.all([document.fonts.ready, ...[...document.images].map((i) => i.decode().catch(() => { }))]))
  await wait(300)
  const file = name.startsWith('public/') ? name : `${OUT}/${name}.png`
  await page.screenshot({ path: file, omitBackground: transparent })
  await page.close()
  console.log('rendered', file)
}

const W4 = 3840
const H4 = 2160
const STACK = 'React 19 · Motion · Tailwind 4 · Lenis'
const header = (right = STACK) => `
  <div class="brand" style="position:absolute;left:160px;top:120px"><img src="${favicon}" alt="">Vesper</div>
  <div style="position:absolute;right:160px;top:124px;display:flex;gap:16px"><span class="tag"><i></i>${right}</span><span class="tag">INXORA Studio</span></div>`

if (BG_ONLY) {
  // Empty plates to put a screen recording on top of. Same backdrop recipe as the mockups.
  await mkdir(`${OUT}/backgrounds`, { recursive: true })
  const glowCenter = [[1920, 1100, 3000, 0.9]]
  await render('backgrounds/bg-plain', { w: W4, h: H4, body: backdrop({ w: W4, h: H4, seed: 23, glows: glowCenter }) })
  await render('backgrounds/bg-horizon', {
    w: W4,
    h: H4,
    body: backdrop({ w: W4, h: H4, seed: 53, glows: [[1920, 1100, 2600]], horizon: { y: 1960, w: 5000 } }),
  })
  await render('backgrounds/bg-branded', { w: W4, h: H4, body: `${backdrop({ w: W4, h: H4, seed: 23, glows: glowCenter })}${header()}` })

  // Browser chrome with a see-through 16:9 screen: stack bg → video → this frame.
  const FW = 2900
  const FH = Math.round((FW * 9) / 16) + 56
  const FX = (W4 - FW) / 2
  const FY = Math.round((H4 - FH) / 2)
  await render('backgrounds/frame-browser-16x9', {
    w: W4,
    h: H4,
    transparent: true,
    body: `<div class="browser" style="left:${FX}px;top:${FY}px;width:${FW}px;height:${FH}px;background:transparent">
      <div class="bar"><div class="dots"><i></i><i></i><i></i></div>
        <div class="url"><img src="${favicon}" alt="">vesper.dev</div><div style="width:66px"></div></div></div>`,
  })
  await writeFile(
    `${OUT}/backgrounds/README.txt`,
    [
      'Background plates, 3840x2160 (scale to 1920x1080 for a 1080p edit: divide by 2).',
      'bg-plain / bg-horizon / bg-branded: empty backdrops.',
      `frame-browser-16x9: transparent PNG, put it ABOVE the video. Video area: x=${FX} y=${FY + 56} w=${FW} h=${FH - 56} (4K px).`,
      '',
    ].join('\n'),
  )
  await browser.close()
  process.exit(0)
}

// 01 · laptop + phone hero
await render('01-hero-devices', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 11, glows: [[1700, 1150, 2600], [3070, 1400, 1100, 0.8]], horizon: { y: 1930, w: 5200 } })}
    ${header()}
    ${laptopEl({ x: 400, y: 400, w: 2440, src: img.hero })}
    ${phoneEl({ x: 2760, y: 700, w: 620, src: img.mHero })}`,
})

// 02 · Live Run, full browser
await render('02-live-run', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 23, glows: [[1920, 1100, 3000, 0.9]] })}
    ${browserEl({ x: 470, y: 180, w: 2900, src: img.live, path: '/#platform' })}`,
})

// 03 · auth: the flip mid-turn + both faces on mobile
await render('03-auth-flip', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 37, glows: [[1300, 1200, 2400], [3100, 1200, 1500, 0.8]], horizon: { y: 1990, w: 5400 } })}
    <div style="position:absolute;left:200px;top:150px">
      <div class="eyebrow">Login · Register</div>
      <h2 class="title" style="margin-top:28px;font-size:118px">One card. <em>Two sides.</em></h2>
    </div>
    ${browserEl({ x: 200, y: 520, w: 2160, src: img.flip, path: '/register' })}
    ${phoneEl({ x: 3120, y: 470, w: 580, src: img.mLogin })}
    ${phoneEl({ x: 2480, y: 640, w: 580, src: img.mRegister })}`,
})

// 04 · isometric wall of every section
const wall = [
  [img.hero, img.pricing, img.login],
  [img.live, img.stack, img.faq],
  [img.night, img.cta, img.register],
]
await render('04-isometric-wall', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 41, glows: [[1920, 1080, 3400, 0.9]] })}
    <div style="position:absolute;left:50%;top:50%;width:4260px;height:3000px;margin:-1500px 0 0 -2130px;transform:rotateX(52deg) rotateZ(-36deg);transform-style:preserve-3d;display:flex;gap:70px">
      ${wall
      .map(
        (col, i) => `<div style="flex:1;display:flex;flex-direction:column;gap:70px;transform:translateY(${[-260, 120, -60][i]}px)">
          ${col.map((src) => `<div style="aspect-ratio:1440/900;border-radius:28px;overflow:hidden;box-shadow:0 0 0 2px rgba(255,255,255,.09),-60px 80px 120px -30px rgba(0,0,0,.95),0 0 160px -60px rgba(255,108,44,.45)"><img class="shot" src="${src}" alt=""></div>`).join('')}
        </div>`,
      )
      .join('')}
    </div>
    <div style="position:absolute;inset:0;background:radial-gradient(ellipse 75% 70% at 50% 50%,transparent 55%,rgba(10,9,8,.9))"></div>
    ${header()}`,
})

// 05 · three phones
await render('05-mobile-trio', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 53, glows: [[1920, 1100, 2600]], horizon: { y: 1960, w: 5000 } })}
    ${phoneEl({ x: 700, y: 420, w: 700, src: img.mPricing, style: 'transform:rotate(-4deg)' })}
    ${phoneEl({ x: 2440, y: 420, w: 700, src: img.mFaq, style: 'transform:rotate(4deg)' })}
    ${phoneEl({ x: 1550, y: 250, w: 740, src: img.mHero, style: 'z-index:2' })}`,
})

// 06 · pricing + FAQ, overlapping browsers
await render('06-pricing-faq', {
  w: W4,
  h: H4,
  body: `${backdrop({ w: W4, h: H4, seed: 67, glows: [[1300, 900, 2200], [2600, 1400, 2200, 0.8]] })}
    ${browserEl({ x: 160, y: 150, w: 2200, src: img.pricing, path: '/#pricing' })}
    ${browserEl({ x: 1480, y: 640, w: 2200, src: img.faq, path: '/#faq' })}`,
})

// Open Graph (2400×1260): headline left, the hero bleeding off the right edge
await render('public/og-image.png', {
  w: 2400,
  h: 1260,
  body: `${backdrop({ w: 2400, h: 1260, seed: 5, glows: [[1750, 700, 1700], [500, 640, 1200, 0.6]], horizon: { y: 1160, w: 3600 } })}
    <div style="position:absolute;left:130px;top:120px;width:980px">
      <div class="brand"><img src="${favicon}" alt="">Vesper</div>
      <h1 class="title" style="margin-top:110px;font-size:124px">Ship production code <em>while you sleep.</em></h1>
      <p class="muted" style="margin-top:40px;font-size:36px;line-height:1.45;max-width:880px">Six AI agents research, plan, build, test and deploy, from one prompt to a reviewed release.</p>
      <div style="margin-top:56px;display:flex;gap:16px"><span class="tag"><i></i>50 free agent-hours</span><span class="tag">SOC 2 Type II</span></div>
    </div>
    ${laptopEl({ x: 1220, y: 250, w: 1700, src: img.hero })}`,
})

// Icons + logo lockup (transparent)
const iconBody = (size, pad = 0, bg = 'transparent') =>
  `<div style="position:absolute;inset:0;background:${bg};display:grid;place-items:center"><img src="${favicon}" style="width:${size - pad * 2}px;height:${size - pad * 2}px" alt=""></div>`
await render('public/icon-512.png', { w: 512, h: 512, body: iconBody(512), transparent: true })
await render('public/icon-192.png', { w: 192, h: 192, body: iconBody(192), transparent: true })
// iOS rounds the corners itself, so the tile is flattened onto the page colour
await render('public/apple-touch-icon.png', { w: 180, h: 180, body: iconBody(180, 0, '#0a0908'), transparent: true })
await render('vesper-logo', {
  w: 1600,
  h: 600,
  dpr: 2,
  transparent: true,
  body: `<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;gap:56px">
    <img src="${favicon}" style="width:280px;height:280px" alt=""><span style="font-size:230px;font-weight:600;letter-spacing:-.05em;color:#fbf8f4">Vesper</span></div>`,
})

await browser.close()
await writeFile(`${OUT}/README.txt`, 'Generated by `npm run assets` from the live site. raw/ holds the source captures (2x desktop, 3x mobile).\n')
