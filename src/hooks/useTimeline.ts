import { useEffect, useRef, useState } from 'react'

/**
 * Returns the elapsed time (ms) inside a looping timeline of `period` ms.
 * Only ticks while `active` is true, at a throttled frame rate, so the
 * decorative visuals stay cheap when they are off-screen.
 */
export function useTimeline(active: boolean, period: number, fps = 30) {
  const [t, setT] = useState(0)

  useEffect(() => {
    if (!active) return
    const start = performance.now()
    let raf = 0
    let last = 0
    const frame = 1000 / fps
    const tick = (now: number) => {
      if (now - last >= frame) {
        last = now
        setT((now - start) % period)
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(raf)
      setT(0)
    }
  }, [active, period, fps])

  return t
}

/**
 * Cycles through `durations.length` steps, waiting `durations[i]` ms on step i.
 * Pauses while `active` is false. Returns the current step and loop counter.
 */
export function useLoopStep(durations: readonly number[], active: boolean) {
  const [state, setState] = useState({ step: 0, loop: 0 })
  const durationsRef = useRef(durations)

  useEffect(() => {
    durationsRef.current = durations
  })

  useEffect(() => {
    if (!active) return
    const list = durationsRef.current
    const id = window.setTimeout(() => {
      setState((s) =>
        s.step + 1 >= list.length ? { step: 0, loop: s.loop + 1 } : { step: s.step + 1, loop: s.loop },
      )
    }, list[state.step] ?? 1000)
    return () => window.clearTimeout(id)
  }, [active, state])

  return state
}
