import { useEffect, useState } from 'react'

type Phase = 'typing' | 'holding' | 'deleting'

/** Types, holds and deletes a list of phrases in a loop (used for placeholders). */
export function useTypewriterCycle(phrases: readonly string[], active: boolean) {
  const [index, setIndex] = useState(0)
  const [text, setText] = useState('')
  const [phase, setPhase] = useState<Phase>('typing')

  useEffect(() => {
    if (!active) return
    const full = phrases[index] ?? ''
    let id = 0
    if (phase === 'typing') {
      id = text.length < full.length
        ? window.setTimeout(() => setText(full.slice(0, text.length + 1)), 34 + Math.random() * 46)
        : window.setTimeout(() => setPhase('holding'), 60)
    } else if (phase === 'holding') {
      id = window.setTimeout(() => setPhase('deleting'), 2300)
    } else {
      id = text.length > 0
        ? window.setTimeout(() => setText(full.slice(0, text.length - 1)), 16)
        : window.setTimeout(() => {
            setIndex((i) => (i + 1) % phrases.length)
            setPhase('typing')
          }, 280)
    }
    return () => window.clearTimeout(id)
  }, [active, index, phase, text, phrases])

  return text
}
