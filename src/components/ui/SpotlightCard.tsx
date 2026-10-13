import { useRef, type ComponentPropsWithoutRef, type PointerEvent } from 'react'
import { cn } from '@/lib/utils'

/** Card with a cursor-following ember glow on its border and surface. */
export function SpotlightCard({ children, className, onPointerMove, ...rest }: ComponentPropsWithoutRef<'div'>) {
  const ref = useRef<HTMLDivElement>(null)

  const handleMove = (event: PointerEvent<HTMLDivElement>) => {
    const el = ref.current
    if (el) {
      const rect = el.getBoundingClientRect()
      el.style.setProperty('--x', `${event.clientX - rect.left}px`)
      el.style.setProperty('--y', `${event.clientY - rect.top}px`)
    }
    onPointerMove?.(event)
  }

  return (
    <div
      ref={ref}
      onPointerMove={handleMove}
      className={cn(
        'spotlight overflow-hidden rounded-3xl border border-white/[0.07] bg-linear-to-b from-white/[0.04] to-white/[0.012] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  )
}
