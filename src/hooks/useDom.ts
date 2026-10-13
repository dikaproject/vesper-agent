import { useEffect, useId, useLayoutEffect, useState, type RefObject } from 'react'

/** SVG-safe unique id (React ids can contain characters invalid in url(#id)). */
export function useSvgId(prefix: string) {
  const id = useId()
  return `${prefix}-${id.replace(/[^a-zA-Z0-9_-]/g, '')}`
}

export function useMediaQuery(query: string, fallback = false) {
  const [matches, setMatches] = useState(() =>
    typeof window === 'undefined' ? fallback : window.matchMedia(query).matches,
  )
  useEffect(() => {
    const mql = window.matchMedia(query)
    const onChange = () => setMatches(mql.matches)
    onChange()
    mql.addEventListener('change', onChange)
    return () => mql.removeEventListener('change', onChange)
  }, [query])
  return matches
}

/** Scale factor that fits a fixed-size design canvas into its container width. */
export function useFitScale(ref: RefObject<HTMLElement | null>, baseWidth: number, max = 1) {
  const [scale, setScale] = useState(1)
  useLayoutEffect(() => {
    const el = ref.current
    if (!el) return
    const update = () => setScale(Math.min(max, el.clientWidth / baseWidth))
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [ref, baseWidth, max])
  return scale
}
