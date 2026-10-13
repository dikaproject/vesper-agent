import { useSvgId } from '@/hooks/useDom'
import { cn } from '@/lib/utils'

const LAYERS = [86, 66, 46] // y of each slab's top-face centre, drawn bottom → top

/** Isometric "production" server stack with a glowing core and light beam. */
export function ServerStack({ lit, busy, className }: { lit: boolean; busy: boolean; className?: string }) {
  const id = useSvgId('srv')
  return (
    <svg viewBox="0 0 120 120" aria-hidden="true" className={cn('size-[128px]', className)}>
      <defs>
        <linearGradient id={`${id}-top`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3d3029" />
          <stop offset="1" stopColor="#16120f" />
        </linearGradient>
        <linearGradient id={`${id}-l`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1b1512" />
          <stop offset="1" stopColor="#0a0807" />
        </linearGradient>
        <linearGradient id={`${id}-r`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a221c" />
          <stop offset="1" stopColor="#100d0b" />
        </linearGradient>
        <radialGradient id={`${id}-disc`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFF4EA" />
          <stop offset="0.35" stopColor="#FFA56D" />
          <stop offset="1" stopColor="#FF6C2C" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-beam`} x1="0" y1="1" x2="0" y2="0">
          <stop offset="0" stopColor="#FF9A5C" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FF9A5C" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* light beam above the core */}
      <rect
        x="53"
        y="0"
        width="14"
        height="46"
        fill={`url(#${id}-beam)`}
        style={{ opacity: lit ? 1 : busy ? 0.55 : 0.25, transition: 'opacity 700ms ease' }}
      />

      {LAYERS.map((y, i) => (
        <g key={y}>
          <path d={`M26 ${y} L60 ${y + 17} L60 ${y + 27} L26 ${y + 10} Z`} fill={`url(#${id}-l)`} />
          <path d={`M60 ${y + 17} L94 ${y} L94 ${y + 10} L60 ${y + 27} Z`} fill={`url(#${id}-r)`} />
          <path d={`M60 ${y - 17} L94 ${y} L60 ${y + 17} L26 ${y} Z`} fill={`url(#${id}-top)`} stroke="rgba(255,214,186,0.22)" strokeWidth="0.6" />
          <path
            d={`M26 ${y} L60 ${y + 17} L94 ${y}`}
            fill="none"
            strokeWidth="0.8"
            stroke={lit ? 'rgba(255,160,105,0.95)' : 'rgba(255,196,160,0.28)'}
            style={{ transition: 'stroke 700ms ease' }}
          />
          {[0, 1, 2].map((k) => {
            const cx = 68 + k * 7
            const on = lit || (busy && (k + i) % 2 === 0)
            return (
              <circle
                key={k}
                cx={cx}
                cy={y + 17 - (cx - 60) * 0.5 + 5}
                r="1.15"
                fill={on ? '#FFB27F' : 'rgba(255,255,255,0.18)'}
                className={busy ? 'animate-twinkle' : undefined}
                style={{
                  animationDelay: `${(i * 3 + k) * 0.18}s`,
                  transition: 'fill 500ms ease',
                  transformBox: 'fill-box',
                  transformOrigin: 'center',
                }}
              />
            )
          })}
        </g>
      ))}

      {/* glowing core disc on the top slab */}
      <ellipse cx="60" cy="46" rx="15" ry="7.5" fill={`url(#${id}-disc)`} style={{ opacity: lit ? 1 : 0.55, transition: 'opacity 700ms ease' }} />
      <ellipse cx="60" cy="46" rx="4.5" ry="2.2" fill="#FFF6EE" style={{ opacity: lit ? 1 : 0.7 }} />
    </svg>
  )
}
