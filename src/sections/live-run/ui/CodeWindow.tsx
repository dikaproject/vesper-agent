import { Blocks, Bug, ChevronDown, ChevronRight, Files, GitBranch, Search, Settings, X } from 'lucide-react'
import { motion } from 'motion/react'
import { Fragment, type CSSProperties, type ReactNode } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { WIN } from '../phases'
import { ScreenWindow } from './ScreenWindow'

export interface FileNode {
  id: string
  name: string
  depth: number
  folder?: boolean
  open?: boolean
  badge?: 'U' | 'A' | 'M'
  /** Appear time (ms) — new files flash in. */
  at?: number
  active?: boolean
}

export interface EditorTab {
  name: string
  active?: boolean
  dirty?: boolean
  at?: number
}

const GLYPHS: Record<string, { label: string; color: string }> = {
  ts: { label: 'TS', color: '#6cb0ff' },
  tsx: { label: 'TSX', color: '#5fd3f0' },
  md: { label: 'M↓', color: '#c9bfb5' },
  sql: { label: 'SQL', color: '#f2b880' },
  json: { label: '{}', color: '#e8c66f' },
}

export function FileGlyph({ name }: { name: string }) {
  const glyph = GLYPHS[name.split('.').pop() ?? '']
  return (
    <span className="w-6 shrink-0 text-center font-mono text-[8.5px] font-bold" style={{ color: glyph?.color }}>
      {glyph?.label}
    </span>
  )
}

const ACTIVITY = [Files, Search, GitBranch, Bug, Blocks]

function ActivityBar() {
  return (
    <div className="flex w-12 shrink-0 flex-col items-center gap-1 border-r border-white/[0.05] bg-ink-900 py-2">
      {ACTIVITY.map((Icon, i) => (
        <span key={i} className={cn('relative grid size-10 place-items-center', i === 0 ? 'text-sand-100' : 'text-sand-600')}>
          {i === 0 && <span className="absolute inset-y-2 left-0 w-0.5 rounded-full bg-sand-100" />}
          <Icon className="size-[18px]" strokeWidth={1.6} />
        </span>
      ))}
      <span className="mt-auto grid size-10 place-items-center">
        <span className="grid size-7 place-items-center rounded-lg bg-ember-500/15 shadow-[0_0_16px_rgba(255,108,44,0.35)] ring-1 ring-ember-400/40">
          <LogoMark size={16} glow={false} />
        </span>
      </span>
      <span className="grid size-10 place-items-center text-sand-600">
        <Settings className="size-[18px]" strokeWidth={1.6} />
      </span>
    </div>
  )
}

function Explorer({ t, files }: { t: number; files: FileNode[] }) {
  return (
    <div className="w-[232px] shrink-0 border-r border-white/[0.05] bg-ink-900/60">
      <p className="px-4 pb-2 pt-3 text-[10.5px] font-medium uppercase tracking-[0.14em] text-sand-500">Explorer</p>
      <p className="flex items-center gap-1 px-2 pb-1 text-[11px] font-semibold uppercase tracking-wide text-sand-300">
        <ChevronDown className="size-3.5" />
        acme-web-app
      </p>
      {files.map((file) => {
        if (file.at !== undefined && t < file.at) return null
        const fresh = file.at !== undefined
        return (
          <motion.div
            key={file.id}
            initial={fresh ? { opacity: 0, x: -8, backgroundColor: 'rgba(255,135,72,0.24)' } : false}
            animate={{ opacity: 1, x: 0, backgroundColor: file.active ? 'rgba(255,255,255,0.06)' : 'rgba(255,135,72,0)' }}
            transition={{ duration: 0.9, ease: EASE_OUT }}
            className="flex h-[22px] items-center gap-1 pr-3 text-[12px]"
            style={{ paddingLeft: 8 + file.depth * 12 }}
          >
            {file.folder ? (
              file.open ? <ChevronDown className="size-3.5 text-sand-500" /> : <ChevronRight className="size-3.5 text-sand-500" />
            ) : (
              <FileGlyph name={file.name} />
            )}
            <span className={cn('truncate', file.badge ? 'text-mint-300' : 'text-sand-300', file.active && 'text-sand-50')}>{file.name}</span>
            {file.badge && <span className="ml-auto font-mono text-[10px] font-semibold text-mint-400">{file.badge}</span>}
          </motion.div>
        )
      })}
    </div>
  )
}

function Tabs({ t, tabs }: { t: number; tabs: EditorTab[] }) {
  return (
    <div className="flex h-9 shrink-0 items-stretch border-b border-white/[0.05] bg-ink-900">
      {tabs.map((tab) => {
        if (tab.at !== undefined && t < tab.at) return null
        return (
          <motion.div
            key={tab.name}
            initial={tab.at !== undefined ? { opacity: 0, y: -6 } : false}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE_OUT }}
            className={cn(
              'flex items-center gap-1.5 border-r border-white/[0.05] pl-2 pr-3.5 text-[12px]',
              tab.active ? 'bg-ink-850 text-sand-100 shadow-[inset_0_1px_0_#ff8748]' : 'text-sand-500',
            )}
          >
            <FileGlyph name={tab.name} />
            {tab.name}
            {tab.dirty ? <span className="ml-1 size-2 rounded-full bg-sand-300" /> : <X className="ml-1 size-3 opacity-40" />}
          </motion.div>
        )
      })}
    </div>
  )
}

/** Right-hand agent chat panel, like an AI extension sidebar. */
export function AgentPanel({ name, role, children }: { name: string; role: string; children: ReactNode }) {
  return (
    <div className="relative flex w-[300px] shrink-0 flex-col border-l border-white/[0.05] bg-ink-900/70">
      <div className="flex h-9 shrink-0 items-center gap-2 border-b border-white/[0.05] px-3.5">
        <LogoMark size={14} glow={false} />
        <span className="text-[10.5px] font-semibold uppercase tracking-[0.16em] text-sand-300">Vesper</span>
        <span className="ml-auto rounded-full bg-ember-500/15 px-2 py-0.5 text-[10px] text-ember-200 ring-1 ring-inset ring-ember-400/25">
          {name} · {role}
        </span>
      </div>
      <div className="relative min-h-0 flex-1">{children}</div>
    </div>
  )
}

interface CodeWindowProps {
  t: number
  title: string
  files: FileNode[]
  tabs: EditorTab[]
  breadcrumb: string[]
  statusLeft: ReactNode
  statusRight: ReactNode
  side?: ReactNode
  bottom?: ReactNode
  children: ReactNode
  style?: CSSProperties
}

/** Editor window in the spirit of VS Code: activity bar, explorer, tabs, status bar. */
export function CodeWindow({ t, title, files, tabs, breadcrumb, statusLeft, statusRight, side, bottom, children, style = WIN }: CodeWindowProps) {
  return (
    <ScreenWindow style={style} title={title}>
      <div className="flex h-full flex-col">
        <div className="flex min-h-0 flex-1">
          <ActivityBar />
          <Explorer t={t} files={files} />
          <div className="flex min-w-0 flex-1 flex-col bg-ink-850">
            <Tabs t={t} tabs={tabs} />
            <div className="flex h-6 shrink-0 items-center gap-1 px-4 text-[11px] text-sand-500">
              {breadcrumb.map((crumb, i) => (
                <Fragment key={crumb}>
                  {i > 0 && <ChevronRight className="size-3" />}
                  <span className={i === breadcrumb.length - 1 ? 'text-sand-300' : undefined}>{crumb}</span>
                </Fragment>
              ))}
            </div>
            <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
            {bottom}
          </div>
          {side}
        </div>
        <div className="flex h-6 shrink-0 items-center justify-between bg-ember-800 px-3 font-mono text-[10.5px] text-ember-50">
          <div className="flex items-center gap-4">{statusLeft}</div>
          <div className="flex items-center gap-4">{statusRight}</div>
        </div>
      </div>
    </ScreenWindow>
  )
}
