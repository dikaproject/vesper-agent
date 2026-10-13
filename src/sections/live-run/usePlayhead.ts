import { useCallback, useEffect, useRef, useState } from 'react'
import { PHASES } from './phases'

const FRAME_MS = 1000 / 30

/**
 * Master clock for the live run. Accumulates time only while `playing`
 * (pause resumes where it stopped), publishes `t` at ~30fps and advances
 * to the next phase when the current one ends.
 */
export function usePlayhead(playing: boolean) {
  const [phase, setPhase] = useState(0)
  const [run, setRun] = useState(0)
  const [t, setT] = useState(0)
  const elapsed = useRef(0)

  useEffect(() => {
    if (!playing) return
    const duration = PHASES[phase]?.duration ?? 6000
    let raf = 0
    let last = performance.now()
    let lastPublish = 0

    const tick = (now: number) => {
      // clamp big gaps (tab switch) so scenes never skip ahead abruptly
      elapsed.current += Math.min(100, now - last)
      last = now
      if (elapsed.current >= duration) {
        elapsed.current = 0
        setT(0)
        setPhase((p) => (p + 1) % PHASES.length)
        setRun((r) => r + 1)
        return
      }
      if (now - lastPublish >= FRAME_MS) {
        lastPublish = now
        setT(elapsed.current)
      }
      raf = requestAnimationFrame(tick)
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [playing, phase, run])

  const jump = useCallback((index: number) => {
    elapsed.current = 0
    setT(0)
    setPhase(index)
    setRun((r) => r + 1)
  }, [])

  return { phase, run, t, jump }
}
