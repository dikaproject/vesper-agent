import { memo, type CSSProperties } from 'react'
import { AGENTS } from '@/data/agents'
import { useSvgId } from '@/hooks/useDom'
import {
  BASE_PATHS,
  FEED_PATH,
  H,
  L_DIAMOND,
  OUTPUT_PATH,
  PILL_Y,
  R_DIAMOND,
  W,
  leftBranch,
  rightBranch,
  stateFor,
} from './flow'

/** Static dotted network — memoised so it is painted exactly once. */
export const FlowBase = memo(function FlowBase() {
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="absolute inset-0 overflow-visible">
      <g fill="none" stroke="rgba(255,240,228,0.2)" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 7">
        {BASE_PATHS.map((d) => (
          <path key={d} d={d} />
        ))}
      </g>
    </svg>
  )
})

/** Stage highlights + diamonds. Repaints only when the stage changes. */
export function FlowHighlights({ stage, shipped, deploying }: { stage: number; shipped: boolean; deploying: boolean }) {
  const id = useSvgId('flow')
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true" className="absolute inset-0 overflow-visible">
      <defs>
        <radialGradient id={`${id}-halo`}>
          <stop offset="0" stopColor="#FF8748" stopOpacity="0.7" />
          <stop offset="1" stopColor="#FF8748" stopOpacity="0" />
        </radialGradient>
      </defs>

      {PILL_Y.map((y, i) => {
        const state = stateFor(i, stage)
        return (
          <g
            key={y}
            fill="none"
            strokeWidth="1.5"
            strokeLinecap="round"
            stroke={state === 'active' ? '#FF8748' : 'rgba(255,135,72,0.5)'}
            style={{ opacity: state === 'active' ? 0.95 : state === 'done' ? 0.4 : 0, transition: 'opacity 600ms ease' }}
          >
            <path d={leftBranch(y)} />
            <path d={rightBranch(y)} />
          </g>
        )
      })}
      <path
        d={OUTPUT_PATH}
        fill="none"
        stroke="#FF8748"
        strokeWidth="1.5"
        style={{ opacity: deploying || shipped ? 0.9 : 0, transition: 'opacity 600ms ease' }}
      />

      {PILL_Y.flatMap((y, i) => {
        const state = stateFor(i, stage)
        return [L_DIAMOND, R_DIAMOND].map((x) => (
          <g key={`${x}-${y}`}>
            <circle cx={x} cy={y} r="13" fill={`url(#${id}-halo)`} style={{ opacity: state === 'active' ? 1 : 0, transition: 'opacity 500ms ease' }} />
            <rect
              x={x - 4.5}
              y={y - 4.5}
              width="9"
              height="9"
              rx="1.6"
              transform={`rotate(45 ${x} ${y})`}
              fill={state === 'active' ? '#FFB27F' : state === 'done' ? '#B9440F' : '#1F1B19'}
              stroke={state === 'pending' ? 'rgba(255,255,255,0.22)' : 'rgba(255,205,175,0.7)'}
              strokeWidth="1"
              style={{ transition: 'fill 500ms ease, stroke 500ms ease' }}
            />
          </g>
        ))
      })}
    </svg>
  )
}

interface CometProps {
  d: string
  dur: number
  delay?: number
  /** Visual length in px. */
  length?: number
}

/** HTML comet riding a CSS motion path — moves via transform, never repaints. */
function Comet({ d, dur, delay = 0, length = 46 }: CometProps) {
  return (
    <span
      className="comet-dot"
      style={{ offsetPath: `path('${d}')`, width: length, '--dur': `${dur}s`, '--delay': `${delay}s` } as CSSProperties}
    />
  )
}

export function FlowComets({ stage, shipped, deploying }: { stage: number; shipped: boolean; deploying: boolean }) {
  const y = PILL_Y[Math.min(stage, PILL_Y.length - 1)] ?? PILL_Y[0]
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0">
      <Comet d={FEED_PATH} dur={2.4} />
      <Comet d={FEED_PATH} dur={2.4} delay={1.2} />
      {stage < AGENTS.length && (
        <div key={`stage-${stage}`}>
          <Comet d={leftBranch(y)} dur={1} length={54} />
          <Comet d={rightBranch(y)} dur={1.1} delay={0.45} length={50} />
        </div>
      )}
      {(deploying || shipped) && <Comet d={OUTPUT_PATH} dur={0.95} length={56} />}
    </div>
  )
}
