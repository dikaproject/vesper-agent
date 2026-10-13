import { useSyncExternalStore, type MouseEvent } from 'react'
import { flushSync } from 'react-dom'

/*
 * Tiny History API router for three routes. Page changes run inside a View
 * Transition (a circular "portal" that grows from the clicked link, or a
 * fade), the landing page's scroll position is restored on back, and pages
 * are code-split through a preloader the app registers.
 */
export type RouteId = 'home' | 'login' | 'register'

export interface Point {
  x: number
  y: number
}

const ROUTES: Record<string, RouteId> = { '/': 'home', '/login': 'login', '/register': 'register' }
const normalize = (pathname: string) => pathname.replace(/\/+$/, '') || '/'
export const routeOf = (pathname: string): RouteId => ROUTES[normalize(pathname)] ?? 'home'
const isAuth = (route: RouteId) => route !== 'home'
const HEADER_OFFSET = 84

let preloader: (route: RouteId) => Promise<unknown> | undefined = () => undefined

/** Lets the router wait for a page chunk before it starts a transition. */
export function setRoutePreloader(fn: typeof preloader) {
  preloader = fn
}

export function prefetchRoute(href: string) {
  const url = new URL(href, window.location.href)
  if (url.origin === window.location.origin) void preloader(routeOf(url.pathname))?.catch(() => undefined)
}

const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}
const getHref = () => window.location.pathname + window.location.search
let current: RouteId = routeOf(window.location.pathname)

export function useLocation() {
  const href = useSyncExternalStore(subscribe, getHref, getHref)
  const url = new URL(href, window.location.origin)
  return { route: routeOf(url.pathname), search: url.searchParams }
}

/** How the current page was entered. Read by pages for their intro (e.g. the portal ring). */
export interface Entry {
  origin: Point | null
  portal: boolean
}
let entry: Entry = { origin: null, portal: false }
export const getEntry = () => entry

const notify = () => listeners.forEach((listener) => listener())

function scrollToY(top: number) {
  window.scrollTo({ top, left: 0, behavior: 'instant' })
}

function scrollToHash(hash: string) {
  const el = document.getElementById(decodeURIComponent(hash.slice(1)))
  if (el) scrollToY(el.getBoundingClientRect().top + window.scrollY - HEADER_OFFSET)
}

function saveScroll() {
  window.history.scrollRestoration = 'manual'
  const state = (window.history.state as Record<string, unknown> | null) ?? {}
  window.history.replaceState({ ...state, scrollY: window.scrollY }, '')
}

/** Render the next page synchronously (inside the view transition) and set its scroll. */
function commit(route: RouteId, scroll: { y?: number; hash?: string }) {
  current = route
  flushSync(notify)
  if (scroll.hash) scrollToHash(scroll.hash)
  else scrollToY(scroll.y ?? 0)
}

type Kind = 'portal-open' | 'portal-close' | 'fade'

const canAnimate = () =>
  typeof document.startViewTransition === 'function' && !window.matchMedia('(prefers-reduced-motion: reduce)').matches

/** Must match the portal timings in index.css (sink / rise and .portal-ring). */
export const PORTAL = { open: 950, close: 800, easing: 'cubic-bezier(0.65, 0, 0.35, 1)' } as const

function runTransition(kind: Kind | null, update: () => void, origin: Point | null) {
  if (!kind || !canAnimate()) {
    update()
    return
  }
  const root = document.documentElement
  // Only an attribute on <html> (matched by ::view-transition selectors). Custom
  // properties on <html> would restyle the whole landing page right on click.
  const open = kind === 'portal-open'
  let ring: HTMLSpanElement | null = null
  root.dataset.vt = kind

  const transition = document.startViewTransition(() => {
    update()
    if (open && origin) {
      // lives in the new page, so it is drawn inside the growing circle, right at its edge
      ring = document.createElement('span')
      ring.className = 'portal-ring'
      ring.setAttribute('aria-hidden', 'true')
      ring.style.left = `${origin.x}px`
      ring.style.top = `${origin.y}px`
      ring.style.opacity = '0'
      document.body.append(ring)
    }
  })
  const cleanup = () => {
    delete root.dataset.vt
    ring?.remove()
  }

  transition.ready
    .then(() => {
      if (!origin || kind === 'fade') return
      const { innerWidth: w, innerHeight: h } = window
      const radius = Math.ceil(Math.hypot(Math.max(origin.x, w - origin.x), Math.max(origin.y, h - origin.y))) + 4
      const at = `at ${Math.round(origin.x)}px ${Math.round(origin.y)}px`
      const circle = [`circle(0px ${at})`, `circle(${radius}px ${at})`]
      const timing = { duration: open ? PORTAL.open : PORTAL.close, easing: PORTAL.easing, fill: 'both' } as const
      root.animate({ clipPath: open ? circle : circle.reverse() }, { ...timing, pseudoElement: open ? '::view-transition-new(root)' : '::view-transition-old(root)' })
      // same clock and curve as the clip, so the ring hugs the edge the whole way out
      ring?.animate(
        [
          { transform: 'scale(0)', opacity: 1 },
          { opacity: 0.85, offset: 0.45 },
          { transform: `scale(${(radius / PORTAL_RING_RADIUS).toFixed(3)})`, opacity: 0 },
        ],
        timing,
      )
    })
    .catch(() => undefined)
  transition.finished.then(cleanup, cleanup)
}

/** Half the .portal-ring size in index.css. */
const PORTAL_RING_RADIUS = 500

let token = 0

export interface NavigateOptions {
  replace?: boolean
  /** Screen point the portal grows from (usually the centre of the clicked link). */
  origin?: Point | null
}

export async function navigate(to: string, { replace = false, origin = null }: NavigateOptions = {}) {
  const url = new URL(to, window.location.href)
  if (url.origin !== window.location.origin) {
    window.location.assign(url.href)
    return
  }
  const next = routeOf(url.pathname)
  const target = url.pathname + url.search + url.hash

  // Same view: login <-> register flip in place, or an in-page anchor.
  if (next === current || (isAuth(next) && isAuth(current))) {
    window.history.replaceState(window.history.state, '', target)
    current = next
    notify()
    if (url.hash) scrollToHash(url.hash)
    return
  }

  const mine = ++token
  await Promise.resolve(preloader(next)).catch(() => undefined)
  if (mine !== token) return
  if (current === 'home') saveScroll()

  const kind: Kind = !origin ? 'fade' : isAuth(next) ? 'portal-open' : 'portal-close'
  entry = { origin, portal: kind === 'portal-open' && canAnimate() }
  runTransition(
    kind,
    () => {
      window.history[replace ? 'replaceState' : 'pushState'](null, '', target)
      commit(next, url.hash ? { hash: url.hash } : { y: 0 })
    },
    origin,
  )
}

window.addEventListener('popstate', (event) => {
  const next = routeOf(window.location.pathname)
  if (next === current || (isAuth(next) && isAuth(current))) {
    current = next
    notify()
    return
  }
  const mine = ++token
  const y = (event.state as { scrollY?: number } | null)?.scrollY ?? 0
  void Promise.resolve(preloader(next))
    .catch(() => undefined)
    .then(() => {
      if (mine !== token) return
      entry = { origin: null, portal: false }
      runTransition('fade', () => commit(next, { y }), null)
    })
})

/** True for same-origin paths this router handles ("/", "/login", "/register?plan=…", "/#faq"). */
export const isRouteHref = (href: string) => href.startsWith('/') && !href.startsWith('//')

/** onClick for <a href="/…">: client-side navigation with the portal growing from the link. */
export function onRouteClick(event: MouseEvent<HTMLAnchorElement>) {
  const anchor = event.currentTarget
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  if (anchor.target && anchor.target !== '_self') return
  const url = new URL(anchor.href)
  if (url.origin !== window.location.origin) return
  // in-page anchors on the current view are left to Lenis (smooth glide)
  if (routeOf(url.pathname) === current && url.hash) return
  event.preventDefault()
  const rect = anchor.getBoundingClientRect()
  void navigate(url.pathname + url.search + url.hash, {
    origin: { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 },
  })
}
