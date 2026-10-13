import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { TOKEN_CLASS, tokenizeLine, type Token } from '@/lib/highlight'
import { cn } from '@/lib/utils'

/** Reveals `total` characters at `cps` chars/second while `active`. */
export function useTypedChars(total: number, active: boolean, cps = 90) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    if (!active) {
      setCount(0)
      return
    }
    const start = performance.now()
    let raf = 0
    let last = -1
    const tick = (now: number) => {
      const n = Math.min(total, Math.floor(((now - start) / 1000) * cps))
      if (n !== last) {
        last = n
        setCount(n)
      }
      if (n < total) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [active, total, cps])

  return count
}

function renderTokens(tokens: Token[], visible: number) {
  const out: ReactNode[] = []
  let left = visible
  for (let i = 0; i < tokens.length && left > 0; i++) {
    const token = tokens[i]
    if (!token) break
    const text = token.value.length <= left ? token.value : token.value.slice(0, left)
    left -= text.length
    out.push(
      <span key={i} className={TOKEN_CLASS[token.type]}>
        {text}
      </span>,
    )
  }
  return out
}

interface TypedCodeProps {
  code: string
  /** Characters revealed so far; omit to show the whole snippet. */
  typed?: number
  /** 1-based line numbers rendered as additions (green tint). */
  addedLines?: readonly number[]
  startLine?: number
  className?: string
  showCursor?: boolean
}

/**
 * Syntax-highlighted code with optional typing reveal. Every line slot is
 * always rendered, so the block never changes height while typing.
 */
export function TypedCode({ code, typed, addedLines = [], startLine = 1, className, showCursor = true }: TypedCodeProps) {
  const lines = useMemo(() => code.split('\n').map(tokenizeLine), [code])
  const lengths = useMemo(() => code.split('\n').map((l) => l.length), [code])
  const total = useMemo(() => lengths.reduce((sum, n) => sum + n + 1, 0), [lengths])
  const visibleTotal = typed ?? total
  const typing = typed !== undefined && typed < total

  let offset = 0
  return (
    <pre className={cn('overflow-hidden font-mono text-[12px] leading-[1.75]', className)}>
      <code>
        {lines.map((tokens, i) => {
          const len = lengths[i] ?? 0
          const visible = Math.max(0, Math.min(len, visibleTotal - offset))
          const isCursorLine = typing && visibleTotal >= offset && visibleTotal <= offset + len
          offset += len + 1
          const lineNo = startLine + i
          const added = addedLines.includes(lineNo)
          return (
            <span
              key={i}
              className={cn('flex min-h-[1.75em] pr-4', added && visible > 0 && 'bg-mint-400/[0.06] shadow-[inset_2px_0_0_rgba(79,224,160,0.55)]')}
            >
              <span className={cn('w-9 shrink-0 select-none pr-3 text-right', added && visible > 0 ? 'text-mint-400/70' : 'text-sand-600')}>
                {added && visible > 0 ? '+' : lineNo}
              </span>
              <span className="whitespace-pre">
                {renderTokens(tokens, visible)}
                {showCursor && isCursorLine && (
                  <span aria-hidden="true" className="ml-px inline-block h-[1.15em] w-[2px] translate-y-[0.2em] animate-blink bg-ember-300" />
                )}
              </span>
            </span>
          )
        })}
      </code>
    </pre>
  )
}
