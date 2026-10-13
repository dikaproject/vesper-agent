import { motion, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'
import { useFitScale } from '@/hooks/useDom'
import { cn } from '@/lib/utils'
import { FACE as S, FACES } from './LayerFaces'
import { EXPLODE_END, LAYERS } from './layers'

/*
 * Orthographic isometric stack built with CSS 3D:
 * container = rotateX(60deg) rotateZ(-45deg), each plate = translateZ(z).
 * A plate at height z projects to screen-y = −z·sin(60°), and its right-most
 * corner sits at x = S/√2 on the same line, so 2D labels can be aligned to
 * plates with plain math — no measuring, no layout reads while scrolling.
 */
const D = S / Math.SQRT2
const SIN = Math.sin(Math.PI / 3)
const GAP = 42
const COMPACT = 12
const LIFT = 26
/** Extra height for plates above the active one, so its face is revealed. */
const REVEAL = 190
const BOX_H = 600
const BY = 470 // screen-y of the bottom plate centre inside the box
/** While compact, the stack is nudged up so it sits centred in the box. */
const COMPACT_SHIFT = -150

/** Additional z for a plate given the active layer. */
const offsetFor = (index: number, active: number, opened: boolean) => {
  if (!opened) return 0
  if (index === active) return LIFT
  return index > active ? REVEAL : 0
}
const spring = { type: 'spring', stiffness: 150, damping: 22, mass: 0.7 } as const
const zRange = (i: number) => [i * COMPACT, i * GAP]

interface PlateProps {
  index: number
  progress: MotionValue<number>
  state: 'past' | 'active' | 'future'
  offset: number
}

function Plate({ index, progress, state, offset }: PlateProps) {
  const layer = LAYERS[index]
  const z = useTransform(progress, [0, EXPLODE_END], zRange(index))
  if (!layer) return null
  const Face = FACES[layer.id]
  const active = state === 'active'

  return (
    <motion.div className="absolute inset-0" style={{ z, transformStyle: 'preserve-3d' }}>
      <motion.div className="absolute inset-0" animate={{ z: offset }} transition={spring} style={{ transformStyle: 'preserve-3d' }}>
        {/* plate thickness */}
        <div
          className="absolute inset-0 rounded-[26px] border border-white/[0.06] bg-[#080706]"
          style={{ transform: 'translateZ(-8px)', borderColor: active ? 'rgba(255,135,72,0.5)' : undefined }}
        />
        {/* face */}
        <div
          className={cn(
            'absolute inset-0 overflow-hidden rounded-[26px] border bg-[linear-gradient(135deg,rgba(46,38,33,0.9),rgba(15,13,12,0.9))] shadow-[inset_0_1px_0_rgba(255,255,255,0.08)] transition-[border-color,box-shadow,opacity] duration-500',
            active
              ? 'border-ember-300/70 shadow-[inset_0_1px_0_rgba(255,255,255,0.1),0_0_0_1px_rgba(255,150,95,0.3),0_0_80px_-12px_rgba(255,108,44,0.8)]'
              : 'border-white/10',
            state === 'future' ? 'opacity-70' : 'opacity-100',
          )}
        >
          <div className={cn('absolute inset-0 bg-[radial-gradient(70%_70%_at_30%_20%,rgba(255,135,72,0.18),transparent)] transition-opacity duration-500', active ? 'opacity-100' : 'opacity-0')} />
          <Face active={active} />
        </div>
      </motion.div>
    </motion.div>
  )
}

interface LabelProps {
  index: number
  progress: MotionValue<number>
  active: boolean
  offset: number
  x: number
  opacity: MotionValue<number>
}

function Label({ index, progress, active, offset, x, opacity }: LabelProps) {
  const z = useTransform(progress, [0, EXPLODE_END], zRange(index))
  const y = useTransform(z, (v) => BY - v * SIN)
  const layer = LAYERS[index]
  return (
    <motion.div className="absolute left-0 top-0" style={{ x, y, opacity }}>
      <motion.div animate={{ y: -offset * SIN }} transition={spring} className="flex -translate-y-1/2 items-center gap-3 whitespace-nowrap">
        <span className={cn('h-px w-10 transition-colors duration-500', active ? 'bg-ember-300' : 'bg-white/15')} />
        <span className={cn('size-1.5 rounded-full transition-colors duration-500', active ? 'bg-ember-300 shadow-[0_0_10px_rgba(255,135,72,0.9)]' : 'bg-sand-600')} />
        <span className={cn('font-mono text-[10.5px] transition-colors duration-500', active ? 'text-ember-300' : 'text-sand-600')}>0{index + 1}</span>
        <span className={cn('text-[13px] tracking-[-0.01em] transition-colors duration-500', active ? 'text-sand-50' : 'text-sand-500')}>{layer?.title}</span>
      </motion.div>
    </motion.div>
  )
}

/** Grid "floor" under the stack, laid in the same 3D plane. */
function Floor() {
  return (
    <div
      className="absolute rounded-[60px]"
      style={{ left: -S * 0.45, top: -S * 0.45, width: S * 1.9, height: S * 1.9, transform: 'translateZ(-36px)' }}
    >
      <div className="bg-grid absolute inset-0 rounded-[inherit] opacity-80 [mask-image:radial-gradient(closest-side,#000_35%,transparent)]" />
      <div className="absolute inset-[20%] rounded-full bg-[radial-gradient(closest-side,rgba(255,108,44,0.26),transparent)]" />
    </div>
  )
}

/** Light beam rising from the top plate once the release is approved. */
function TopBeam({ on, cx }: { on: boolean; cx: number }) {
  const topY = BY - ((LAYERS.length - 1) * GAP + LIFT) * SIN
  return (
    <div
      className="pointer-events-none absolute transition-opacity duration-700"
      style={{ left: cx - 70, top: topY - 190, width: 140, height: 190, opacity: on ? 1 : 0 }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(255,154,92,0.5),transparent)] [clip-path:polygon(38%_0,62%_0,100%_100%,0_100%)]" />
      <div className="absolute bottom-0 left-1/2 h-full w-px -translate-x-1/2 bg-linear-to-t from-ember-100 to-transparent" />
    </div>
  )
}

interface IsoStackProps {
  progress: MotionValue<number>
  active: number
  /** False while the stack is still assembled (top of the track). */
  opened: boolean
  /** Leader labels next to each plate (desktop). */
  withLabels: boolean
}

export function IsoStack({ progress, active, opened, withLabels }: IsoStackProps) {
  const ref = useRef<HTMLDivElement>(null)
  const baseW = withLabels ? 700 : 480
  const cx = withLabels ? 236 : baseW / 2
  const scale = useFitScale(ref, baseW)
  const labelOpacity = useTransform(progress, [0.05, EXPLODE_END], [0, 1])
  const shiftY = useTransform(progress, [0, EXPLODE_END], [COMPACT_SHIFT, 0])

  return (
    <div ref={ref} aria-hidden="true" className="relative w-full" style={{ height: BOX_H * scale }}>
      <div
        className="absolute left-1/2 top-0"
        style={{ width: baseW, height: BOX_H, marginLeft: -baseW / 2, transform: `scale(${scale})`, transformOrigin: '50% 0' }}
      >
        <motion.div className="absolute inset-0" style={{ y: shiftY, transformStyle: 'preserve-3d' }}>
          <div
            className="absolute"
            style={{
              left: cx - S / 2,
              top: BY - S / 2,
              width: S,
              height: S,
              transformStyle: 'preserve-3d',
              transform: 'rotateX(60deg) rotateZ(-45deg)',
            }}
          >
            <Floor />
            {LAYERS.map((layer, i) => (
              <Plate
                key={layer.id}
                index={i}
                progress={progress}
                state={i === active ? 'active' : i < active ? 'past' : 'future'}
                offset={offsetFor(i, active, opened)}
              />
            ))}
          </div>
          <TopBeam on={active === LAYERS.length - 1} cx={cx} />
          {withLabels &&
            LAYERS.map((layer, i) => (
              <Label
                key={layer.id}
                index={i}
                progress={progress}
                active={i === active}
                offset={offsetFor(i, active, opened)}
                x={cx + D + 12}
                opacity={labelOpacity}
              />
            ))}
        </motion.div>
      </div>
    </div>
  )
}
