import type { ReactNode } from 'react'
import { Marquee } from '@/components/ui/Marquee'
import { Reveal } from '@/components/ui/Reveal'
import { cn } from '@/lib/utils'

/* Fictional customer wordmarks (concept project — no real brands implied). */
const mark = (children: ReactNode) => (
  <svg viewBox="0 0 24 24" aria-hidden="true" className="size-[18px] shrink-0" fill="currentColor">
    {children}
  </svg>
)

const BRANDS: { name: string; className: string; icon: ReactNode }[] = [
  { name: 'Northwind', className: 'text-[17px] font-semibold tracking-[-0.03em]', icon: mark(<path d="M4 19 12 4v15H4Zm9.5 0V9l6.5 10h-6.5Z" />) },
  { name: 'LUMINA', className: 'font-mono text-[13px] tracking-[0.28em]', icon: mark(<><circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2.2" /><circle cx="12" cy="12" r="2.6" /></>) },
  { name: 'quantix', className: 'text-[18px] font-bold lowercase tracking-[-0.04em]', icon: mark(<><rect x="3" y="3" width="8" height="8" rx="2" /><rect x="13" y="13" width="8" height="8" rx="2" /><rect x="13" y="3" width="8" height="8" rx="4" opacity=".55" /></>) },
  { name: 'Helix Labs', className: 'text-[16px] font-medium tracking-[-0.02em]', icon: mark(<path d="M6 3c0 6 12 6 12 12v6h-2.5v-6c0-4-9.5-4-9.5-12H6Zm12 0c0 3-2 4.6-4.4 5.8l-1.9-1.4C14.2 6.3 15.5 5.2 15.5 3H18ZM6 21c0-3 2-4.6 4.4-5.8l1.9 1.4C9.8 17.7 8.5 18.8 8.5 21H6Z" />) },
  { name: 'STRATUS', className: 'text-[14px] font-semibold tracking-[0.2em]', icon: mark(<><rect x="3" y="5" width="18" height="3" rx="1.5" /><rect x="6" y="10.5" width="14" height="3" rx="1.5" /><rect x="9" y="16" width="10" height="3" rx="1.5" /></>) },
  { name: 'Polaris', className: 'text-[17px] font-medium italic tracking-[-0.03em]', icon: mark(<path d="M12 2c.6 5.2 3.6 8.4 9 9.9v.2c-5.4 1.5-8.4 4.7-9 9.9h-.1c-.6-5.2-3.6-8.4-9-9.9v-.2c5.4-1.5 8.4-4.7 9-9.9h.1Z" />) },
  { name: 'arcadia', className: 'font-mono text-[15px] lowercase tracking-[-0.02em]', icon: mark(<path d="M4 20V12a8 8 0 0 1 16 0v8h-3.2v-8a4.8 4.8 0 0 0-9.6 0v8H4Z" />) },
  { name: 'Monolith', className: 'text-[16px] font-semibold uppercase tracking-[0.08em]', icon: mark(<path d="M8 2h8v20H8V2Zm2.4 3v14h3.2V5h-3.2Z" />) },
  { name: 'Kinetic', className: 'text-[17px] font-bold tracking-[-0.045em]', icon: mark(<path d="m3 5 6 7-6 7h4l6-7-6-7H3Zm8 0 6 7-6 7h4l6-7-6-7h-4Z" />) },
]

export function LogoCloud() {
  return (
    <div className="relative mx-auto mt-16 max-w-6xl px-5 pb-20 sm:px-8 lg:mt-20">
      <Reveal y={10}>
        <p className="text-center font-mono text-[11px] uppercase tracking-[0.22em] text-sand-500">
          Trusted by 4,000+ teams shipping with autonomous agents
        </p>
      </Reveal>
      <Marquee className="fade-x mt-8" duration={38} gap="3.5rem" repeat={3}>
        {BRANDS.map((brand) => (
          <span
            key={brand.name}
            className={cn('flex items-center gap-2 whitespace-nowrap text-sand-400/75 transition-colors duration-300 hover:text-sand-100', brand.className)}
          >
            {brand.icon}
            {brand.name}
          </span>
        ))}
      </Marquee>
    </div>
  )
}
