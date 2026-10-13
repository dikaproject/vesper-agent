import { useLoopStep } from '@/hooks/useTimeline'
import { AGENTS } from '@/data/agents'

/* Fixed design canvas for the hero pipeline (scaled to fit on desktop). */
export const W = 1200
export const H = 420

export const PILL_W = 290
export const PILL_H = 42
export const PILL_X = 455
export const PILL_R = PILL_X + PILL_W
export const PILL_Y = [75, 129, 183, 237, 291, 345] as const
export const JY = 210 // junction height where the buses meet the feed/output

export const LBUS = 390
export const RBUS = 810
export const L_DIAMOND = 422
export const R_DIAMOND = 778
const CORNER = 16

export const INPUT = { x: 92, y: 318, r: 46 }
export const REPO = { x: 205, y: 158, r: 22 }
export const CORE = { x: 318, y: 210, s: 52 }
export const REVIEW = { x: 880, y: 210, r: 22 }
export const DEVICE = { x: 1000, y: 92, s: 156 }

const dir = (y: number) => (y < JY ? 1 : -1)

export const leftBranch = (y: number) =>
  `M ${LBUS} ${JY} V ${y + dir(y) * CORNER} Q ${LBUS} ${y} ${LBUS + CORNER} ${y} H ${PILL_X}`

export const rightBranch = (y: number) =>
  `M ${PILL_R} ${y} H ${RBUS - CORNER} Q ${RBUS} ${y} ${RBUS} ${y + dir(y) * CORNER} V ${JY} H ${REVIEW.x - REVIEW.r}`

export const FEED_PATH = `M ${INPUT.x} ${INPUT.y - INPUT.r} V 194 Q ${INPUT.x} ${REPO.y} 128 ${REPO.y} H 286 Q ${CORE.x} ${REPO.y} ${CORE.x} 190 V ${JY} H ${LBUS}`
export const OUTPUT_PATH = `M ${REVIEW.x + REVIEW.r} ${JY} C 948 ${JY} 952 170 ${DEVICE.x} 170 H ${DEVICE.x + DEVICE.s / 2}`

/** Static dotted network (drawn once, no overlapping segments). */
export const BASE_PATHS = [
  `M ${INPUT.x} ${INPUT.y - INPUT.r} V 194 Q ${INPUT.x} ${REPO.y} 128 ${REPO.y} H ${REPO.x - REPO.r}`,
  `M ${REPO.x + REPO.r} ${REPO.y} H 286 Q ${CORE.x} ${REPO.y} ${CORE.x} ${CORE.y - CORE.s / 2}`,
  `M ${CORE.x + CORE.s / 2} ${JY} H ${LBUS}`,
  `M ${LBUS} ${PILL_Y[0] + CORNER} V ${PILL_Y[5] - CORNER}`,
  `M ${RBUS} ${PILL_Y[0] + CORNER} V ${PILL_Y[5] - CORNER}`,
  `M ${RBUS} ${JY} H ${REVIEW.x - REVIEW.r}`,
  `M ${REVIEW.x + REVIEW.r} ${JY} C 948 ${JY} 952 170 ${DEVICE.x} 170`,
  ...PILL_Y.map((y) => `M ${LBUS} ${y + dir(y) * CORNER} Q ${LBUS} ${y} ${LBUS + CORNER} ${y} H ${PILL_X}`),
  ...PILL_Y.map((y) => `M ${PILL_R} ${y} H ${RBUS - CORNER} Q ${RBUS} ${y} ${RBUS} ${y + dir(y) * CORNER}`),
]

/* ------------------------------------------------------------------ */
/* Pipeline cycle: each agent runs for STAGE_MS, then the release ships */
/* ------------------------------------------------------------------ */
export const STAGE_MS = 1750
export const SHIP_MS = 3200
const DURATIONS = [...AGENTS.map(() => STAGE_MS), SHIP_MS]

export type StageState = 'pending' | 'active' | 'done'

export function stateFor(index: number, stage: number): StageState {
  if (index < stage) return 'done'
  if (index === stage) return 'active'
  return 'pending'
}

export function usePipelineCycle(active: boolean) {
  const { step } = useLoopStep(DURATIONS, active)
  return { stage: step, shipped: step === AGENTS.length, deploying: step === AGENTS.length - 1 }
}
