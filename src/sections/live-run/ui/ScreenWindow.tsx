import { motion } from 'motion/react'
import type { CSSProperties, ReactNode } from 'react'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'

export function TrafficLights({ className }: { className?: string }) {
  return (
    <span className={cn('flex shrink-0 items-center gap-[7px]', className)}>
      <span className="size-3 rounded-full bg-[#ff5f57]/85" />
      <span className="size-3 rounded-full bg-[#febc2e]/85" />
      <span className="size-3 rounded-full bg-[#28c840]/85" />
    </span>
  )
}

interface ScreenWindowProps {
  children: ReactNode
  style?: CSSProperties
  className?: string
  /** Default macOS title bar content. Ignored when `header` is passed. */
  title?: ReactNode
  icon?: ReactNode
  /** Fully custom title area (e.g. browser tabs). */
  header?: ReactNode
  /** Push the window back (used when another window opens on top). */
  dim?: boolean
  delay?: number
}

/** A desktop window that opens with a quick scale-in, like macOS. */
export function ScreenWindow({ children, style, className, title, icon, header, dim = false, delay = 0 }: ScreenWindowProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.965, y: 14 }}
      animate={{ opacity: dim ? 0.45 : 1, scale: dim ? 0.97 : 1, y: 0 }}
      transition={{ duration: 0.6, delay, ease: EASE_OUT }}
      style={style}
      className={cn(
        'absolute flex flex-col overflow-hidden rounded-[12px] border border-white/10 bg-ink-850 shadow-[0_30px_80px_-24px_rgba(0,0,0,0.95),0_0_0_1px_rgba(0,0,0,0.55)]',
        className,
      )}
    >
      {header ?? (
        <div className="flex h-9 shrink-0 items-center border-b border-white/[0.06] bg-ink-800 px-3.5">
          <TrafficLights />
          <div className="flex flex-1 items-center justify-center gap-2 text-[12px] text-sand-400">
            {icon}
            {title}
          </div>
          <span className="w-[52px]" />
        </div>
      )}
      <div className="relative min-h-0 flex-1">{children}</div>
    </motion.div>
  )
}
