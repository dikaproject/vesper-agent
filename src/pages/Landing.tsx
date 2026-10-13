import { useEffect } from 'react'
import { Footer } from '@/components/layout/Footer'
import { Navbar } from '@/components/layout/Navbar'
import { prefetchRoute } from '@/lib/router'
import { FaqSection } from '@/sections/FaqSection'
import { FinalCta } from '@/sections/FinalCta'
import { Hero } from '@/sections/Hero'
import { LiveRun } from '@/sections/LiveRun'
import { NightShift } from '@/sections/NightShift'
import { Pricing } from '@/sections/Pricing'
import { UnderTheHood } from '@/sections/UnderTheHood'

export const SITE_TITLE = 'Vesper — Your autonomous AI engineering crew'

export function Landing() {
  useEffect(() => {
    // warm the auth chunk while the visitor reads, so the portal opens instantly
    const id = window.setTimeout(() => prefetchRoute('/login'), 2500)
    return () => window.clearTimeout(id)
  }, [])

  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <LiveRun />
        <NightShift />
        <UnderTheHood />
        <Pricing />
        <FaqSection />
        <FinalCta />
      </main>
      <Footer />
    </>
  )
}
