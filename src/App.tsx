import { MotionConfig } from 'motion/react'
import { useEffect, useState } from 'react'
import { SmoothScroll } from '@/components/SmoothScroll'
import { setRoutePreloader, useLocation } from '@/lib/router'
import type { AuthMode } from '@/pages/auth/AuthPage'
import { Landing, SITE_TITLE } from '@/pages/Landing'

/* The auth page is its own chunk. The router awaits it before a transition
   starts, so the portal never opens onto an empty page. */
type AuthModule = typeof import('@/pages/auth/AuthPage')
let authModule: AuthModule | null = null
let authPromise: Promise<AuthModule> | null = null

function loadAuth() {
  authPromise ??= import('@/pages/auth/AuthPage').then(
    (mod) => (authModule = mod),
    (error: unknown) => {
      authPromise = null
      throw error
    },
  )
  return authPromise
}

setRoutePreloader((route) => (route === 'home' ? undefined : loadAuth()))

function AuthRoute({ mode }: { mode: AuthMode }) {
  const [mod, setMod] = useState<AuthModule | null>(authModule)
  useEffect(() => {
    if (!mod) void loadAuth().then(setMod, () => undefined)
  }, [mod])
  if (!mod) return <div className="min-h-svh" aria-busy="true" />
  const { AuthPage } = mod
  return <AuthPage mode={mode} />
}

/**
 * True while `active`, and for `ms` after it turns false. Lets the landing
 * page stay mounted (hidden) through the route transition: unmounting ~2,800
 * nodes inside the transition's update callback would hold the frozen frame
 * longer, and a quick "back" finds the page exactly as it was left.
 */
function useLingering(active: boolean, ms: number) {
  const [lingering, setLingering] = useState(active)
  useEffect(() => {
    if (active) {
      setLingering(true)
      return
    }
    const id = window.setTimeout(() => setLingering(false), ms)
    return () => window.clearTimeout(id)
  }, [active, ms])
  return active || lingering
}

export default function App() {
  const { route } = useLocation()
  const home = route === 'home'
  const keepLanding = useLingering(home, 2500)

  useEffect(() => {
    if (home) document.title = SITE_TITLE
  }, [home])
  return (
    <MotionConfig reducedMotion="user">
      <SmoothScroll>
        <div aria-hidden="true" className="grain" />
        {keepLanding && (
          <div hidden={!home}>
            <Landing />
          </div>
        )}
        {!home && <AuthRoute mode={route} />}
      </SmoothScroll>
    </MotionConfig>
  )
}
