import { useLenis } from 'lenis/react'
import { ArrowUp, ArrowUpRight } from 'lucide-react'
import type { MouseEvent } from 'react'
import { siDiscord, siGithub, siX, siYoutube } from 'simple-icons'
import { Logo } from '@/components/brand/Logo'
import { BrandIcon } from '@/components/ui/BrandIcon'
import { Newsletter } from './footer/Newsletter'
import { Wordmark } from './footer/Wordmark'

interface FooterLink {
  label: string
  /** "#" marks a page that doesn't exist in this concept. */
  href: string
  badge?: string
}

const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Product',
    links: [
      { label: 'Live run', href: '#platform' },
      { label: 'Night shift', href: '#night-shift' },
      { label: 'How it works', href: '#under-the-hood' },
      { label: 'Pricing', href: '#pricing' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'Developers',
    links: [
      { label: 'Documentation', href: '#' },
      { label: 'CLI', href: '#get-started' },
      { label: 'API reference', href: '#' },
      { label: 'Changelog', href: '#', badge: 'v2.4' },
      { label: 'Status', href: '#' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '#' },
      { label: 'Careers', href: '#', badge: 'Hiring' },
      { label: 'Blog', href: '#' },
      { label: 'Contact', href: 'mailto:hello@vesper.dev' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy', href: '#' },
      { label: 'Terms', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'DPA', href: '#' },
    ],
  },
]

const SOCIALS = [
  { label: 'GitHub', icon: siGithub, href: 'https://github.com' },
  { label: 'X', icon: siX, href: 'https://x.com' },
  { label: 'Discord', icon: siDiscord, href: 'https://discord.com' },
  { label: 'YouTube', icon: siYoutube, href: 'https://youtube.com' },
]

function FooterAnchor({ link }: { link: FooterLink }) {
  const placeholder = link.href === '#'
  return (
    <a
      href={link.href}
      onClick={placeholder ? (event: MouseEvent) => event.preventDefault() : undefined}
      aria-disabled={placeholder || undefined}
      className="group/link inline-flex items-center gap-2 rounded text-[13.5px] text-sand-400 transition-colors duration-300 hover:text-sand-50"
    >
      <span className="relative">
        {link.label}
        <span
          aria-hidden="true"
          className="absolute -bottom-0.5 left-0 h-px w-full origin-left scale-x-0 bg-linear-to-r from-ember-400 to-ember-200 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/link:scale-x-100"
        />
      </span>
      {link.badge && (
        <span className="rounded-full bg-ember-500/12 px-1.5 py-px font-mono text-[9.5px] text-ember-200 ring-1 ring-inset ring-ember-400/25">{link.badge}</span>
      )}
      <ArrowUpRight
        aria-hidden="true"
        className="size-3 -translate-x-1 opacity-0 transition-[opacity,translate] duration-300 group-hover/link:translate-x-0 group-hover/link:opacity-100"
      />
    </a>
  )
}

function StatusPill() {
  return (
    <span className="flex items-center gap-2 rounded-full bg-mint-400/10 px-3 py-1.5 font-mono text-[11px] text-mint-300 ring-1 ring-inset ring-mint-400/25">
      <span aria-hidden="true" className="relative flex size-1.5">
        <span className="absolute inset-0 animate-ping rounded-full bg-mint-400" />
        <span className="relative size-1.5 rounded-full bg-mint-400" />
      </span>
      All systems normal
    </span>
  )
}

function FooterBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
      <div className="absolute left-1/2 top-0 h-px w-[min(1100px,92vw)] -translate-x-1/2 bg-linear-to-r from-transparent via-ember-300/30 to-transparent" />
      <div className="absolute left-1/2 top-0 h-40 w-[min(900px,90vw)] -translate-x-1/2 bg-[radial-gradient(50%_100%_at_50%_0%,rgba(255,108,44,0.1),transparent)]" />
      <div className="bg-dots absolute inset-0 opacity-[0.18] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_30%,#000,transparent)]" />
    </div>
  )
}

export function Footer() {
  const lenis = useLenis()
  const toTop = () => {
    if (lenis) lenis.scrollTo(0, { duration: 1.8 })
    else window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <footer className="relative isolate overflow-hidden border-t border-white/[0.06]">
      <FooterBackdrop />
      <div className="relative mx-auto max-w-7xl px-5 pt-16 sm:px-8 sm:pt-20">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,2fr)] lg:gap-16">
          <div>
            <a href="#top" aria-label="Vesper — back to top" className="inline-block rounded-xl">
              <Logo />
            </a>
            <p className="mt-4 max-w-sm text-pretty text-[14px] leading-relaxed text-sand-400">
              Six AI agents that research, plan, build, test and ship while your team sleeps. You approve the plan and the release; the crew does the rest.
            </p>
            <Newsletter />
            <ul className="mt-7 flex gap-2">
              {SOCIALS.map((social) => (
                <li key={social.label}>
                  <a
                    href={social.href}
                    target="_blank"
                    rel="noreferrer"
                    aria-label={`Vesper on ${social.label}`}
                    className="glass grid size-10 place-items-center rounded-full text-sand-400 transition-[color,translate] duration-300 hover:-translate-y-0.5 hover:text-sand-50"
                  >
                    <BrandIcon icon={social.icon} className="size-4" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title}>
                <h3 className="font-mono text-[10.5px] uppercase tracking-[0.2em] text-sand-500">{column.title}</h3>
                <ul className="mt-4 flex flex-col gap-3">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <FooterAnchor link={link} />
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </nav>
        </div>

        <div className="mt-16 flex flex-col-reverse items-center justify-between gap-4 border-t border-white/[0.06] py-6 sm:flex-row">
          <p className="text-center font-mono text-[11px] text-sand-600 sm:text-left">
            © 2026 Vesper · A portfolio concept by <span className="text-sand-400">INXORA Studio</span>
          </p>
          <div className="flex items-center gap-3">
            <StatusPill />
            <button
              type="button"
              onClick={toTop}
              className="glass group/top flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[12px] text-sand-300 transition-colors hover:text-sand-50"
            >
              Back to top
              <ArrowUp aria-hidden="true" className="size-3.5 transition-transform duration-300 group-hover/top:-translate-y-0.5" />
            </button>
          </div>
        </div>
      </div>
      <Wordmark />
    </footer>
  )
}
