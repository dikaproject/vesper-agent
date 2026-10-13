import { cn } from '@/lib/utils'

const DIGITS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]

interface RollingNumberProps {
  value: number
  className?: string
  format?: (value: number) => string
}

/**
 * Odometer-style number: each digit is a 0–9 column translated with CSS
 * transform, so changes roll smoothly on the compositor. Columns are keyed
 * from the right, so 149 → 119 only rolls the middle digit.
 */
export function RollingNumber({ value, className, format = (v) => Math.round(v).toLocaleString('en-US') }: RollingNumberProps) {
  const text = format(value)
  const chars = text.split('')

  return (
    <span className={cn('relative inline-flex tabular-nums leading-none', className)}>
      <span className="sr-only">{text}</span>
      <span aria-hidden="true" className="inline-flex">
        {chars.map((ch, i) => {
          const fromRight = chars.length - i
          if (!/\d/.test(ch)) {
            return (
              <span key={`s${fromRight}`} className="inline-block h-[1em]">
                {ch}
              </span>
            )
          }
          const digit = Number(ch)
          return (
            <span key={`d${fromRight}`} className="relative inline-block h-[1em] overflow-hidden">
              <span
                className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                style={{ transform: `translateY(${-digit * 10}%)`, transitionDelay: `${fromRight * 45}ms` }}
              >
                {DIGITS.map((n) => (
                  <span key={n} className="block h-[1em] leading-none">
                    {n}
                  </span>
                ))}
              </span>
            </span>
          )
        })}
      </span>
    </span>
  )
}
