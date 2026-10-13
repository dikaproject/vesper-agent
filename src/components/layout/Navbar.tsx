import { ArrowUpRight, Menu, X } from 'lucide-react'
import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { useState } from 'react'
import { Logo } from '@/components/brand/Logo'
import { ScrollProgress } from '@/components/effects/ScrollProgress'
import { Button } from '@/components/ui/Button'
import { Link } from '@/components/ui/Link'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

export const NAV_LINKS = [
  { label: 'Live run', href: '#platform' },
  { label: 'Night shift', href: '#night-shift' },
  { label: 'How it works', href: '#under-the-hood' },
  { label: 'Pricing', href: '#pricing' },
  { label: 'FAQ', href: '#faq' },
]

export function Navbar() {
  const { scrollY } = useScroll()
  const [scrolled, setScrolled] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [open, setOpen] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const delta = y - (scrollY.getPrevious() ?? 0)
    setScrolled(y > 24)
    if (y < 720 || open) setHidden(false)
    else if (delta > 4) setHidden(true)
    else if (delta < -4) setHidden(false)
  })

  return (
    <motion.header
      initial={{ y: -28, opacity: 0 }}
      animate={{ y: hidden ? -96 : 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: EASE_OUT }}
      className="fixed inset-x-0 top-0 z-50"
    >
      <div
        className={cn(
          'relative border-b transition-[background-color,border-color,backdrop-filter] duration-500',
          scrolled || open ? 'border-white/[0.06] bg-ink-900/80 backdrop-blur-md' : 'border-transparent bg-transparent',
        )}
      >
        <nav aria-label="Main" className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-6 px-5 sm:px-8">
          <a href="#top" aria-label="Vesper — back to top" className="shrink-0 rounded-xl">
            <Logo />
          </a>

          <ul className="glass hidden items-center rounded-full p-1 md:flex" onMouseLeave={() => setHovered(null)}>
            {NAV_LINKS.map((link) => (
              <li key={link.href} className="relative">
                {hovered === link.href && (
                  <motion.span
                    layoutId="nav-pill"
                    className="absolute inset-0 rounded-full bg-white/[0.08] ring-1 ring-inset ring-white/10"
                    transition={{ type: 'spring', bounce: 0.18, duration: 0.5 }}
                  />
                )}
                <a
                  href={link.href}
                  onMouseEnter={() => setHovered(link.href)}
                  onFocus={() => setHovered(link.href)}
                  className="relative z-10 block rounded-full px-4 py-1.5 text-[13px] text-sand-300 transition-colors hover:text-sand-50"
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>

          <div className="flex items-center gap-1.5">
            <Link href="/login" className="hidden rounded-full px-3.5 py-2 text-[13px] text-sand-300 transition-colors hover:text-sand-50 sm:block">
              Sign in
            </Link>
            <Button href="/register" size="sm" arrow className="hidden sm:inline-flex">
              Start building
            </Button>
            <button
              type="button"
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? 'Close menu' : 'Open menu'}
              className="glass grid size-10 place-items-center rounded-full text-sand-100 md:hidden"
            >
              {open ? <X className="size-4.5" /> : <Menu className="size-4.5" />}
            </button>
          </div>
        </nav>
        <ScrollProgress />
      </div>

      <AnimatePresence>{open && <MobileMenu onNavigate={() => setOpen(false)} />}</AnimatePresence>
    </motion.header>
  )
}

function MobileMenu({ onNavigate }: { onNavigate: () => void }) {
  return (
    <motion.div
      id="mobile-menu"
      initial={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -8, filter: 'blur(6px)' }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      className="glass-solid mx-4 mt-2 overflow-hidden rounded-3xl p-2 md:hidden"
    >
      <ul className="flex flex-col">
        {NAV_LINKS.map((link, i) => (
          <motion.li
            key={link.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.05 + i * 0.05, duration: 0.45, ease: EASE_OUT }}
          >
            <a
              href={link.href}
              onClick={onNavigate}
              className="flex items-center justify-between rounded-2xl px-4 py-3.5 text-lg tracking-[-0.02em] text-sand-100 transition-colors hover:bg-white/[0.05]"
            >
              {link.label}
              <ArrowUpRight aria-hidden="true" className="size-4 text-sand-500" />
            </a>
          </motion.li>
        ))}
      </ul>
      <div className="mt-1 grid grid-cols-2 gap-2 border-t border-white/[0.06] p-2 pt-3">
        <Button href="/login" variant="secondary" onClick={onNavigate}>
          Sign in
        </Button>
        <Button href="/register" onClick={onNavigate}>
          Start building
        </Button>
      </div>
    </motion.div>
  )
}
