import type { ComponentPropsWithoutRef } from 'react'
import { isRouteHref, onRouteClick, prefetchRoute } from '@/lib/router'

type LinkProps = ComponentPropsWithoutRef<'a'> & { href: string }

/**
 * Anchor that routes client-side for internal paths ("/login", "/#pricing")
 * and prefetches the target page on hover or focus. Hash-only and external
 * links behave like plain anchors.
 */
export function Link({ href, onClick, onPointerEnter, onFocus, ...rest }: LinkProps) {
  const internal = isRouteHref(href)
  return (
    <a
      href={href}
      {...rest}
      onClick={(event) => {
        onClick?.(event)
        if (internal) onRouteClick(event)
      }}
      onPointerEnter={(event) => {
        onPointerEnter?.(event)
        if (internal) prefetchRoute(href)
      }}
      onFocus={(event) => {
        onFocus?.(event)
        if (internal) prefetchRoute(href)
      }}
    />
  )
}
