import { motion, useTransform, type MotionValue } from 'motion/react'
import { mulberry32 } from '@/lib/random'

const VW = 1600
const VH = 240
const TOWER_X = 1060

type Group = 'evening' | 'late' | 'dawn' | 'vesper'
interface Building {
  x: number
  w: number
  h: number
  antenna: boolean
}
interface Win {
  x: number
  y: number
  g: Group
}

/** Procedural skyline, generated once at module load (seeded → stable). */
function buildSkyline() {
  const rand = mulberry32(42)
  const buildings: Building[] = []
  const windows: Win[] = []
  let x = -12
  while (x < VW + 12) {
    const tower = x < TOWER_X && x + 130 > TOWER_X && !buildings.some((b) => b.h > 215)
    const w = tower ? 78 : 40 + Math.round(rand() * 78)
    const center = 1 - Math.abs(x + w / 2 - VW / 2) / (VW / 2)
    const h = tower ? 222 : Math.round(56 + rand() * 96 + center * 52)
    buildings.push({ x, w, h, antenna: tower || rand() < 0.14 })
    for (let wx = x + 9; wx + 5 <= x + w - 7; wx += 12) {
      for (let wy = VH - h + 14; wy + 7 <= VH - 12; wy += 16) {
        const r = rand()
        if (tower) {
          if (r < 0.62) windows.push({ x: wx, y: wy, g: 'vesper' })
        } else if (r < 0.3) windows.push({ x: wx, y: wy, g: 'evening' })
        else if (r < 0.42) windows.push({ x: wx, y: wy, g: 'late' })
        else if (r < 0.58) windows.push({ x: wx, y: wy, g: 'dawn' })
      }
    }
    x += w + 3 + Math.round(rand() * 7)
  }
  return { buildings, windows }
}

const SKYLINE = buildSkyline()
const TOWER = SKYLINE.buildings.find((b) => b.h === 222)
const WINDOW_COLOR: Record<Group, string> = {
  evening: '#ffcf9f',
  late: '#ffd9b3',
  dawn: '#ffe2c4',
  vesper: '#ff9a5c',
}

const svgProps = {
  viewBox: `0 0 ${VW} ${VH}`,
  preserveAspectRatio: 'xMidYMax slice',
  'aria-hidden': true,
  className: 'absolute inset-0 size-full will-change-[opacity]',
} as const

function WindowLayer({ group, opacity }: { group: Group; opacity?: MotionValue<number> }) {
  return (
    <motion.svg {...svgProps} style={opacity ? { opacity } : undefined}>
      <g fill={WINDOW_COLOR[group]} opacity={group === 'vesper' ? 0.95 : 0.7}>
        {SKYLINE.windows
          .filter((w) => w.g === group)
          .map((w) => (
            <rect key={`${w.x}-${w.y}`} x={w.x} y={w.y} width="5" height="7" rx="0.6" />
          ))}
      </g>
    </motion.svg>
  )
}

/**
 * Silhouette skyline whose windows switch off as the night goes on and back
 * on at dawn. Each window group is its own composited layer, so the whole
 * effect is four opacity values — no repaint while scrolling.
 */
export function Skyline({ progress }: { progress: MotionValue<number> }) {
  const evening = useTransform(progress, [0, 0.2, 0.36], [1, 0.9, 0])
  const late = useTransform(progress, [0, 0.48, 0.62], [1, 1, 0])
  const dawn = useTransform(progress, [0.8, 0.96], [0, 1])
  const rim = useTransform(progress, [0, 0.3, 0.76, 1], [1, 0.12, 0.12, 0.85])

  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[170px] sm:h-[230px]">
      <svg {...svgProps}>
        <defs>
          <linearGradient id="sky-bld" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor="#0d0b0a" />
            <stop offset="1" stopColor="#050404" />
          </linearGradient>
        </defs>
        {SKYLINE.buildings.map((b) => (
          <g key={b.x}>
            <rect x={b.x} y={VH - b.h} width={b.w} height={b.h} fill="url(#sky-bld)" />
            {b.antenna && <rect x={b.x + b.w / 2 - 1} y={VH - b.h - 26} width="2" height="26" fill="#0d0b0a" />}
          </g>
        ))}
      </svg>
      {/* warm rim light on rooftops (sunset / sunrise) */}
      <motion.svg {...svgProps} style={{ opacity: rim }}>
        <g fill="none" stroke="#ff9a5c" strokeOpacity="0.55" strokeWidth="1.2">
          {SKYLINE.buildings.map((b) => (
            <path key={b.x} d={`M ${b.x} ${VH - b.h + 0.6} h ${b.w}`} />
          ))}
        </g>
      </motion.svg>
      <WindowLayer group="evening" opacity={evening} />
      <WindowLayer group="late" opacity={late} />
      <WindowLayer group="dawn" opacity={dawn} />
      <WindowLayer group="vesper" />
      {TOWER && (
        <svg {...svgProps} className="absolute inset-0 size-full">
          <circle cx={TOWER.x + TOWER.w / 2} cy={VH - TOWER.h - 28} r="2.6" fill="#ff6c2c" className="animate-blink [animation-duration:2.2s]" />
        </svg>
      )}
    </div>
  )
}
