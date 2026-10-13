import { motion, useMotionValue, useSpring, useTransform } from 'motion/react'
import { useEffect, useMemo, useRef, type CSSProperties } from 'react'
import { mulberry32 } from '@/lib/random'
import { cn } from '@/lib/utils'

interface StarfieldProps {
  className?: string
  /** Multiplier for the number of static stars per pixel. */
  density?: number
  /** Number of bright, twinkling stars (CSS-animated). */
  twinkles?: number
  shootingStars?: boolean
  parallax?: boolean
  seed?: number
}

/**
 * Performance-first starfield:
 *  - hundreds of faint stars painted ONCE to a canvas (repainted only on resize)
 *  - a few bright stars twinkle with CSS opacity/scale (compositor only)
 *  - shooting stars are CSS transforms
 *  - pointer parallax moves two layers with springs (transform only)
 */
export function Starfield({ className, density = 1, twinkles = 22, shootingStars = true, parallax = true, seed = 7 }: StarfieldProps) {
  const rootRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const px = useMotionValue(0)
  const py = useMotionValue(0)
  const spring = { stiffness: 40, damping: 18, mass: 0.8 }
  const sx = useSpring(px, spring)
  const sy = useSpring(py, spring)
  const farX = useTransform(sx, (v) => v * 10)
  const farY = useTransform(sy, (v) => v * 7)
  const nearX = useTransform(sx, (v) => v * 26)
  const nearY = useTransform(sy, (v) => v * 18)

  const bright = useMemo(() => {
    const rand = mulberry32(seed)
    return Array.from({ length: twinkles }, (_, id) => ({
      id,
      x: rand() * 100,
      y: rand() * 100,
      size: 4 + rand() * 6,
      dur: 2.4 + rand() * 3.6,
      delay: -rand() * 6,
      flare: rand() < 0.3,
    }))
  }, [twinkles, seed])

  // Static field — painted once, repainted only when the box size changes.
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext('2d')
    if (!canvas || !ctx) return
    let lastW = 0
    let lastH = 0

    const paint = () => {
      const { width, height } = canvas.getBoundingClientRect()
      if (Math.abs(width - lastW) < 1 && Math.abs(height - lastH) < 1) return
      lastW = width
      lastH = height
      // tall canvases (whole sections) stay at 1x — stars are dots, and it saves GPU memory
      const dpr = Math.min(window.devicePixelRatio || 1, height > 1200 ? 1 : 1.5)
      canvas.width = Math.max(1, Math.round(width * dpr))
      canvas.height = Math.max(1, Math.round(height * dpr))
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      ctx.clearRect(0, 0, width, height)
      const rand = mulberry32(seed * 31 + 1)
      const count = Math.round(((width * height) / 4200) * density)
      for (let i = 0; i < count; i++) {
        const depth = rand()
        const r = depth * depth * 1.15 + 0.3
        const a = 0.16 + rand() * 0.55
        const warm = rand() < 0.24
        const x = rand() * width
        const y = rand() * height
        ctx.fillStyle = warm ? `rgba(255,196,158,${a})` : `rgba(255,247,240,${a})`
        ctx.beginPath()
        ctx.arc(x, y, r, 0, Math.PI * 2)
        ctx.fill()
        if (r > 1.05 && a > 0.45) {
          ctx.fillStyle = `rgba(255,170,120,${a * 0.1})`
          ctx.beginPath()
          ctx.arc(x, y, r * 4, 0, Math.PI * 2)
          ctx.fill()
        }
      }
    }

    paint()
    let raf = 0
    const ro = new ResizeObserver(() => {
      cancelAnimationFrame(raf)
      raf = requestAnimationFrame(paint)
    })
    ro.observe(canvas)
    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
    }
  }, [density, seed])

  // Pointer parallax, only while the field is on screen and on fine pointers.
  useEffect(() => {
    const root = rootRef.current
    if (!parallax || !root || window.matchMedia('(pointer: coarse)').matches) return
    let visible = true
    const io = new IntersectionObserver(([entry]) => {
      visible = entry?.isIntersecting ?? false
    })
    io.observe(root)
    const onMove = (event: PointerEvent) => {
      if (!visible) return
      px.set(event.clientX / window.innerWidth - 0.5)
      py.set(event.clientY / window.innerHeight - 0.5)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      io.disconnect()
      window.removeEventListener('pointermove', onMove)
    }
  }, [parallax, px, py])

  return (
    <div ref={rootRef} aria-hidden="true" className={cn('pointer-events-none absolute inset-0 overflow-hidden', className)}>
      <motion.canvas
        ref={canvasRef}
        style={{ x: farX, y: farY }}
        className="absolute -left-6 -top-6 h-[calc(100%+3rem)] w-[calc(100%+3rem)]"
      />
      <motion.div style={{ x: nearX, y: nearY }} className="absolute inset-0 will-change-transform">
        {bright.map((s) => (
          <span
            key={s.id}
            className={cn('twinkle-star', s.flare && 'flare')}
            style={{ left: `${s.x}%`, top: `${s.y}%`, '--size': `${s.size}px`, '--dur': `${s.dur}s`, '--delay': `${s.delay}s` } as CSSProperties}
          />
        ))}
      </motion.div>
      {shootingStars && (
        <>
          <span className="shooting-star" style={{ left: '80%', top: '7%', '--dur': '11s', '--delay': '2.5s' } as CSSProperties} />
          <span
            className="shooting-star"
            style={{ left: '44%', top: '15%', '--dur': '15s', '--delay': '8s', '--dx': '-300px', '--dy': '150px', '--angle': '-26.5deg' } as CSSProperties}
          />
        </>
      )}
    </div>
  )
}
