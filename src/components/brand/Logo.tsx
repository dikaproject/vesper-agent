import { motion } from 'motion/react'
import { useSvgId } from '@/hooks/useDom'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

/*
 * Vesper mark — two converging arms (the V-model of software delivery:
 * research → plan → analyze on the way down, test → ship on the way up)
 * that point at a single glowing point: the release.
 */
const LEFT_ARM = 'M12.5 10.5 20.45 28.4'
const RIGHT_ARM = 'M35.5 10.5 27.55 28.4'
const DOT = { cx: 24, cy: 36.4 }

interface LogoMarkProps {
  className?: string
  size?: number
  /** Draw the arms in and pop the core on mount. */
  animate?: boolean
  glow?: boolean
}

export function LogoMark({ className, size = 28, animate = false, glow = true }: LogoMarkProps) {
  const id = useSvgId('vmark')
  const armProps = {
    stroke: `url(#${id}-arm)`,
    strokeWidth: 5,
    strokeLinecap: 'round' as const,
    fill: 'none',
  }

  return (
    <svg viewBox="0 0 48 48" width={size} height={size} className={className} aria-hidden="true" fill="none">
      <defs>
        <linearGradient id={`${id}-arm`} x1="24" y1="8" x2="24" y2="31" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FFF3EA" />
          <stop offset="0.5" stopColor="#FFB383" />
          <stop offset="1" stopColor="#FF6C2C" />
        </linearGradient>
        <radialGradient id={`${id}-glow`} cx={DOT.cx} cy={DOT.cy} r="11" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#FF9A5C" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#FF6C2C" stopOpacity="0.35" />
          <stop offset="1" stopColor="#FF6C2C" stopOpacity="0" />
        </radialGradient>
      </defs>

      {animate ? (
        <>
          <motion.path d={LEFT_ARM} {...armProps} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.9, ease: EASE_OUT }} />
          <motion.path d={RIGHT_ARM} {...armProps} initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.9, delay: 0.12, ease: EASE_OUT }} />
        </>
      ) : (
        <>
          <path d={LEFT_ARM} {...armProps} />
          <path d={RIGHT_ARM} {...armProps} />
        </>
      )}

      {glow && <circle cx={DOT.cx} cy={DOT.cy} r="11" fill={`url(#${id}-glow)`} />}
      {animate ? (
        <motion.circle
          cx={DOT.cx}
          cy={DOT.cy}
          r="3.6"
          fill="#FFF4EA"
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.6 }}
          style={{ transformOrigin: `${DOT.cx}px ${DOT.cy}px` }}
        />
      ) : (
        <circle cx={DOT.cx} cy={DOT.cy} r="3.6" fill="#FFF4EA" />
      )}
    </svg>
  )
}

interface LogoIconProps {
  className?: string
  size?: number
  animate?: boolean
}

/** App-icon version: glossy dark tile with an ember under-glow. */
export function LogoIcon({ className, size = 36, animate = false }: LogoIconProps) {
  const id = useSvgId('vicon')
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden="true" className="absolute inset-0">
        <defs>
          <linearGradient id={`${id}-bg`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#2A221D" />
            <stop offset="1" stopColor="#0C0A09" />
          </linearGradient>
          <radialGradient id={`${id}-under`} cx="32" cy="54" r="30" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FF6C2C" stopOpacity="0.42" />
            <stop offset="1" stopColor="#FF6C2C" stopOpacity="0" />
          </radialGradient>
          <linearGradient id={`${id}-rim`} x1="32" y1="0" x2="32" y2="64" gradientUnits="userSpaceOnUse">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.28" />
            <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.05" />
            <stop offset="1" stopColor="#FF8748" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="16" fill={`url(#${id}-bg)`} />
        <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="16" fill={`url(#${id}-under)`} />
        <rect x="0.75" y="0.75" width="62.5" height="62.5" rx="16" fill="none" stroke={`url(#${id}-rim)`} strokeWidth="1.5" />
      </svg>
      <LogoMark size={size * 0.74} animate={animate} className="relative" />
    </span>
  )
}

export function Logo({ className, iconSize = 34 }: { className?: string; iconSize?: number }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoIcon size={iconSize} />
      <span className="text-[17px] font-semibold tracking-[-0.03em] text-sand-50">Vesper</span>
    </span>
  )
}
