import { ArrowRight } from 'lucide-react'
import type { ComponentPropsWithoutRef, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Link } from './Link'

type Variant = 'primary' | 'secondary' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

interface CommonProps {
  variant?: Variant
  size?: Size
  /** Trailing arrow that nudges on hover. */
  arrow?: boolean
  /** Periodic light sweep (primary only). */
  shimmer?: boolean
  className?: string
  children: ReactNode
}

type AnchorProps = CommonProps & Omit<ComponentPropsWithoutRef<'a'>, keyof CommonProps> & { href: string }
type NativeProps = CommonProps & Omit<ComponentPropsWithoutRef<'button'>, keyof CommonProps> & { href?: never }
export type ButtonProps = AnchorProps | NativeProps

const base =
  'group/btn relative inline-flex select-none items-center justify-center gap-2 overflow-hidden whitespace-nowrap rounded-full font-medium tracking-[-0.01em] transition-[transform,box-shadow,background-color,color] duration-300 ease-out active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50'

const variants: Record<Variant, string> = {
  primary:
    'text-ink-950 bg-[linear-gradient(180deg,#ffc9a6_0%,#ff8b4d_46%,#ee5d1c_100%)] shadow-[0_0_0_1px_rgba(255,170,120,0.55),0_10px_32px_-8px_rgba(255,108,44,0.7),inset_0_1px_0_rgba(255,255,255,0.55),inset_0_-3px_8px_rgba(150,45,8,0.35)] hover:shadow-[0_0_0_1px_rgba(255,196,160,0.8),0_16px_46px_-6px_rgba(255,108,44,0.95),inset_0_1px_0_rgba(255,255,255,0.6),inset_0_-3px_8px_rgba(150,45,8,0.35)]',
  secondary:
    'text-sand-100 bg-white/[0.05] ring-1 ring-inset ring-white/10 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] hover:bg-white/[0.09] hover:ring-white/20',
  ghost: 'text-sand-300 hover:text-sand-50 hover:bg-white/[0.05]',
}

const sizes: Record<Size, string> = {
  sm: 'h-9 px-4 text-[13px]',
  md: 'h-11 px-5 text-sm',
  lg: 'h-13 px-7 text-[15px]',
}

export function Button(props: ButtonProps) {
  const { variant = 'primary', size = 'md', arrow = false, shimmer = false, className, children, ...rest } = props
  const classes = cn(base, variants[variant], sizes[size], className)

  const inner = (
    <>
      {shimmer && variant === 'primary' && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/3 animate-shimmer bg-linear-to-r from-transparent via-white/70 to-transparent opacity-60 mix-blend-overlay"
        />
      )}
      <span className="relative z-10 inline-flex items-center gap-2">
        {children}
        {arrow && (
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-300 ease-out group-hover/btn:translate-x-0.5"
          />
        )}
      </span>
    </>
  )

  if (typeof rest.href === 'string') {
    return (
      <Link {...(rest as ComponentPropsWithoutRef<'a'> & { href: string })} className={classes}>
        {inner}
      </Link>
    )
  }
  return (
    <button type="button" {...(rest as ComponentPropsWithoutRef<'button'>)} className={classes}>
      {inner}
    </button>
  )
}
