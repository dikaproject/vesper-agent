import { motion, type Variants } from 'motion/react'
import { Fragment } from 'react'
import { EASE_OUT, inViewOnce } from '@/lib/motion'
import { cn } from '@/lib/utils'

/**
 * Word-by-word blur/rise reveal.
 * Markup: wrap accent words in *asterisks* and use "\n" for line breaks.
 * Each word carries its own gradient so `background-clip: text` survives
 * the per-word transforms.
 */
interface Segment {
  text: string
  accent: boolean
}

function parse(text: string): Segment[][] {
  return text.split('\n').map((line) =>
    line
      .split(/(\*[^*]+\*)/g)
      .filter(Boolean)
      .map((part) =>
        part.startsWith('*') && part.endsWith('*')
          ? { text: part.slice(1, -1), accent: true }
          : { text: part, accent: false },
      ),
  )
}

const word: Variants = {
  hidden: { opacity: 0, y: '0.42em', filter: 'blur(10px)' },
  show: { opacity: 1, y: '0em', filter: 'blur(0px)', transition: { duration: 1, ease: EASE_OUT } },
}

const TAGS = { h1: motion.h1, h2: motion.h2, h3: motion.h3, p: motion.p }

interface RevealTextProps {
  text: string
  as?: keyof typeof TAGS
  className?: string
  delay?: number
  stagger?: number
  wordClassName?: string
  accentClassName?: string
  /** Animate on mount instead of when scrolled into view. */
  immediate?: boolean
}

export function RevealText({
  text,
  as = 'h2',
  className,
  delay = 0,
  stagger = 0.055,
  wordClassName = 'text-gradient',
  accentClassName = 'text-gradient-ember',
  immediate = false,
}: RevealTextProps) {
  const Tag = TAGS[as] as typeof motion.h2
  const lines = parse(text)
  const trigger = immediate
    ? { initial: 'hidden', animate: 'show' }
    : { initial: 'hidden', whileInView: 'show', viewport: inViewOnce }

  return (
    <Tag
      className={className}
      {...trigger}
      variants={{ hidden: {}, show: { transition: { staggerChildren: stagger, delayChildren: delay } } }}
    >
      {lines.map((segments, li) => (
        <span key={li} className="block">
          {segments.map((segment, si) =>
            segment.text
              .split(' ')
              .filter(Boolean)
              .map((w, wi) => (
                <Fragment key={`${si}-${wi}`}>
                  <motion.span
                    variants={word}
                    className={cn(
                      'inline-block pb-[0.14em] -mb-[0.14em]',
                      segment.accent ? accentClassName : wordClassName,
                    )}
                  >
                    {w}
                  </motion.span>{' '}
                </Fragment>
              )),
          )}
        </span>
      ))}
    </Tag>
  )
}
