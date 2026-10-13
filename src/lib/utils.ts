import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merge Tailwind classes with conditional support. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Pragmatic email check for form hints (the server is the real validator). */
export const isEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

/** Normalised 0..1 progress of `t` between `start` and `end`. */
export const progressBetween = (t: number, start: number, end: number) =>
  clamp((t - start) / (end - start), 0, 1)

/** Small deterministic string hash (used for generated avatars). */
export function hashString(input: string) {
  let h = 2166136261
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}
