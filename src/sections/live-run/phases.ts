import type { AgentId } from '@/data/agents'
import { progressBetween } from '@/lib/utils'

/* Fixed design canvas of the monitor screen (scaled to fit). */
export const SCREEN_W = 1280
export const SCREEN_H = 760

/** Default frame for full-size windows on the desktop. */
export const WIN = { left: 32, top: 46, width: 1216, height: 684 } as const

export interface Phase {
  id: AgentId
  title: string
  agent: string
  status: string
  summary: string
  duration: number
  clock: string
}

export const PHASES: Phase[] = [
  {
    id: 'research',
    title: 'Research',
    agent: 'Scout',
    status: 'searching the web',
    summary: 'Opens a browser, searches docs, issues and blogs, then distills 14 sources into a brief.',
    duration: 7600,
    clock: '02:14',
  },
  {
    id: 'planning',
    title: 'Planning',
    agent: 'Architect',
    status: 'writing PLAN.md',
    summary: 'Writes PLAN.md in your editor — milestones, tasks, estimates — and waits for your approval.',
    duration: 7200,
    clock: '02:15',
  },
  {
    id: 'analysis',
    title: 'Analysis',
    agent: 'Analyst',
    status: 'mapping impact',
    summary: 'Scans the dependency graph to find every module the change touches and scores the risk.',
    duration: 6800,
    clock: '02:16',
  },
  {
    id: 'development',
    title: 'Development',
    agent: 'Builder',
    status: 'writing usage.ts',
    summary: 'Creates the files and writes typed code that follows your conventions, commit by commit.',
    duration: 7800,
    clock: '02:16',
  },
  {
    id: 'qa',
    title: 'QA',
    agent: 'Sentinel',
    status: 'running 142 tests',
    summary: 'Runs the whole suite, patches the one failing test and re-runs until everything is green.',
    duration: 7400,
    clock: '02:17',
  },
  {
    id: 'deploy',
    title: 'Deploy',
    agent: 'Pilot',
    status: 'deploying to production',
    summary: 'Ships to five edge regions behind a canary, then opens the live page on screen.',
    duration: 10400,
    clock: '02:18',
  },
]

/** Scene props: elapsed milliseconds since the scene started. */
export interface SceneProps {
  t: number
}

/** 0..1 progress of `t` between `start` and `end` (ms). */
export const span = (t: number, start: number, end: number) => progressBetween(t, start, end)

/** Characters revealed for a typing animation running from `start` to `end`. */
export const typedChars = (t: number, start: number, end: number, total: number) =>
  Math.floor(span(t, start, end) * total)
