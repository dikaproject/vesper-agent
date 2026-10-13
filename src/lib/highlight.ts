/**
 * Tiny TypeScript tokenizer for the decorative code editors.
 * It is intentionally small: just enough to colour keywords, strings,
 * numbers, comments, functions and types convincingly.
 */
export type TokenType = 'kw' | 'str' | 'num' | 'com' | 'fn' | 'type' | 'punc' | 'prop' | 'plain'
export interface Token {
  type: TokenType
  value: string
}

const KEYWORDS = new Set([
  'import', 'from', 'export', 'const', 'let', 'return', 'async', 'await', 'function',
  'if', 'else', 'new', 'type', 'interface', 'extends', 'throw', 'for', 'of', 'in',
  'try', 'catch', 'default', 'as', 'true', 'false', 'null', 'undefined', 'satisfies',
])

const TOKEN_RE =
  /(\/\/.*$)|('(?:[^'\\]|\\.)*'|"(?:[^"\\]|\\.)*"|`(?:[^`\\]|\\.)*`)|(\b\d+(?:\.\d+)?\b)|([A-Za-z_$][\w$]*)|(\s+)|([^\sA-Za-z_$\d'"`]+)/g

export function tokenizeLine(line: string): Token[] {
  const tokens: Token[] = []
  for (const match of line.matchAll(TOKEN_RE)) {
    const [value, com, str, num, ident, space] = match
    const start = match.index ?? 0
    const end = start + value.length
    if (com) tokens.push({ type: 'com', value })
    else if (str) tokens.push({ type: 'str', value })
    else if (num) tokens.push({ type: 'num', value })
    else if (ident) {
      const prev = line.slice(0, start).trimEnd()
      const next = line.slice(end).trimStart()
      if (KEYWORDS.has(value)) tokens.push({ type: 'kw', value })
      else if (next.startsWith('(')) tokens.push({ type: 'fn', value })
      else if (/^[A-Z]/.test(value)) tokens.push({ type: 'type', value })
      else if (prev.endsWith('.') || next.startsWith(':')) tokens.push({ type: 'prop', value })
      else tokens.push({ type: 'plain', value })
    } else if (space) tokens.push({ type: 'plain', value })
    else tokens.push({ type: 'punc', value })
  }
  return tokens
}

export const TOKEN_CLASS: Record<TokenType, string> = {
  kw: 'text-[#ff8f57]',
  str: 'text-[#a9dba0]',
  num: 'text-[#ffbe94]',
  com: 'text-sand-500 italic',
  fn: 'text-[#ffd9b8]',
  type: 'text-[#f2b880]',
  punc: 'text-sand-400',
  prop: 'text-sand-200',
  plain: 'text-sand-100',
}
