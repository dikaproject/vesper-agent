import type { SimpleIcon } from 'simple-icons'

/** Renders a Simple Icons brand glyph as a monochrome inline SVG. */
export function BrandIcon({ icon, className, title }: { icon: SimpleIcon; className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      role={title ? 'img' : undefined}
      aria-hidden={title ? undefined : true}
    >
      {title && <title>{title}</title>}
      <path d={icon.path} />
    </svg>
  )
}
