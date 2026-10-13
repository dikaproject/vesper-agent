import { Fragment } from 'react'

/** Renders `code` spans inside FAQ answers. */
export function Inline({ text }: { text: string }) {
  return (
    <>
      {text.split(/(`[^`]*`?)/g).map((part, i) =>
        part.startsWith('`') ? (
          <code key={i} className="rounded-md bg-ember-500/12 px-1.5 py-0.5 font-mono text-[0.88em] text-ember-200">
            {part.replace(/`/g, '')}
          </code>
        ) : (
          <Fragment key={i}>{part}</Fragment>
        ),
      )}
    </>
  )
}

/** Paragraphs separated by blank lines. */
export function Paragraphs({ text, className }: { text: string; className?: string }) {
  return (
    <>
      {text.split('\n\n').map((para, i) => (
        <p key={i} className={className}>
          <Inline text={para} />
        </p>
      ))}
    </>
  )
}
