import { cn, hashString } from '@/lib/utils'

/**
 * Generated "mesh gradient" avatar — deterministic per name, so every
 * testimonial and teammate gets a unique HD portrait without photos.
 */
export function GradientAvatar({ name, size = 36, className }: { name: string; size?: number; className?: string }) {
  const h = hashString(name)
  const hueA = 8 + (h % 34)
  const hueB = (h >>> 5) % 360
  const hueC = (hueA + 300 + ((h >>> 11) % 80)) % 360
  const spotA = `${18 + ((h >>> 3) % 34)}% ${14 + ((h >>> 7) % 30)}%`
  const spotB = `${60 + ((h >>> 13) % 30)}% ${62 + ((h >>> 17) % 30)}%`
  const initials = name
    .split(' ')
    .map((part) => part[0] ?? '')
    .slice(0, 2)
    .join('')

  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative inline-grid shrink-0 select-none place-items-center overflow-hidden rounded-full font-semibold text-white/95 ring-1 ring-white/15',
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.34),
        background: `radial-gradient(circle at ${spotA}, hsl(${hueA} 100% 72%), transparent 55%), radial-gradient(circle at ${spotB}, hsl(${hueB} 70% 52% / 0.85), transparent 58%), linear-gradient(140deg, hsl(${hueC} 45% 26%), hsl(${hueA} 55% 13%))`,
      }}
    >
      <span className="relative drop-shadow-[0_1px_2px_rgba(0,0,0,0.5)]">{initials}</span>
    </span>
  )
}
