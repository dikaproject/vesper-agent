import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Eyebrow } from './Badge'
import { Reveal } from './Reveal'
import { RevealText } from './RevealText'

interface SectionHeadingProps {
  eyebrow: string
  /** Supports *accent* words and "\n" line breaks. */
  title: string
  description?: ReactNode
  align?: 'center' | 'left'
  className?: string
}

export function SectionHeading({ eyebrow, title, description, align = 'center', className }: SectionHeadingProps) {
  const centered = align === 'center'
  return (
    <div className={cn('flex flex-col gap-5', centered ? 'items-center text-center' : 'items-start text-left', className)}>
      <Reveal y={12}>
        <Eyebrow>{eyebrow}</Eyebrow>
      </Reveal>
      <RevealText
        text={title}
        className="max-w-4xl text-balance text-[2.1rem] font-medium leading-[1.06] tracking-[-0.04em] sm:text-5xl lg:text-[3.6rem]"
      />
      {description && (
        <Reveal blur delay={0.15} className={cn('max-w-2xl text-pretty text-[15px] leading-relaxed text-sand-400 sm:text-base', centered && 'mx-auto')}>
          {description}
        </Reveal>
      )}
    </div>
  )
}
