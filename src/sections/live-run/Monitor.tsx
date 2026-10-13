import { Moon, Wifi } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useRef, type ComponentType } from 'react'
import { LogoMark } from '@/components/brand/Logo'
import { useFitScale } from '@/hooks/useDom'
import { PHASES, SCREEN_H, SCREEN_W, type SceneProps } from './phases'
import { AnalysisScene } from './scenes/AnalysisScene'
import { DeployScene } from './scenes/DeployScene'
import { DevelopmentScene } from './scenes/DevelopmentScene'
import { PlanningScene } from './scenes/PlanningScene'
import { QAScene } from './scenes/QAScene'
import { ResearchScene } from './scenes/ResearchScene'

const SCENES: ComponentType<SceneProps>[] = [ResearchScene, PlanningScene, AnalysisScene, DevelopmentScene, QAScene, DeployScene]

export interface PlaybackProps {
  phase: number
  /** Increments on every phase change; used to remount the scene. */
  run: number
  /** Elapsed ms inside the current phase (ticks at ~30fps while playing). */
  t: number
}

/** Only the active scene is mounted — the others cost nothing. */
function SceneHost({ phase, t }: { phase: number; t: number }) {
  const Scene = SCENES[phase] ?? ResearchScene
  return <Scene t={t} />
}

function MenuBar({ phase }: { phase: number }) {
  const meta = PHASES[phase] ?? PHASES[0]
  return (
    <div className="absolute inset-x-0 top-0 z-40 flex h-7 items-center justify-between bg-black/45 px-4 text-[12px] text-sand-200 shadow-[inset_0_-1px_0_rgba(255,255,255,0.05)]">
      <div className="flex items-center gap-4">
        <LogoMark size={14} glow={false} />
        <span className="font-semibold text-sand-50">Vesper Agent</span>
        {['File', 'Edit', 'View', 'Run', 'Window'].map((item) => (
          <span key={item} className="text-sand-400">
            {item}
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3.5">
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={meta?.agent}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-1.5 rounded-full bg-ember-500/15 px-2.5 py-0.5 text-[11px] text-ember-100 ring-1 ring-inset ring-ember-400/30"
          >
            <span className="size-1.5 animate-pulse rounded-full bg-ember-300" />
            {meta?.agent} · {meta?.status}
          </motion.span>
        </AnimatePresence>
        <span className="flex items-center gap-1 font-mono text-[10.5px] text-coral-400">
          <span className="size-1.5 rounded-full bg-coral-400" />
          REC
        </span>
        <Wifi className="size-3.5 text-sand-400" />
        <span className="flex items-center gap-1.5 font-mono text-[11px] text-sand-300">
          <Moon className="size-3 text-ember-200" />
          {meta?.clock} AM
        </span>
      </div>
    </div>
  )
}

function Wallpaper() {
  return (
    <div aria-hidden="true" className="absolute inset-0">
      <div className="absolute inset-0 bg-[radial-gradient(90%_70%_at_50%_118%,rgba(255,108,44,0.3),transparent_60%),radial-gradient(60%_50%_at_85%_-10%,rgba(255,170,120,0.07),transparent_60%),linear-gradient(180deg,#0e0c0b,#080706)]" />
      <div className="bg-dots absolute inset-0 opacity-25 [mask-image:radial-gradient(ellipse_at_50%_60%,#000,transparent_70%)]" />
      <div className="absolute left-1/2 top-[52%] -translate-x-1/2 -translate-y-1/2 opacity-[0.08]">
        <LogoMark size={180} glow={false} />
      </div>
    </div>
  )
}

function Desktop({ phase, run, t }: PlaybackProps) {
  return (
    <div className="relative size-full overflow-hidden bg-[#090807]">
      <Wallpaper />
      <MenuBar phase={phase} />
      <AnimatePresence initial={false}>
        <motion.div
          key={`${phase}-${run}`}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.45 }}
        >
          <SceneHost phase={phase} t={t} />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

function Stand() {
  return (
    <div aria-hidden="true" className="relative mx-auto hidden h-[96px] sm:block">
      <div className="absolute left-1/2 top-0 h-[70px] w-[15%] -translate-x-1/2 bg-[linear-gradient(90deg,#121010,#3a3430_35%,#2a2522_65%,#100e0d)] [clip-path:polygon(10%_0,90%_0,100%_100%,0_100%)]" />
      <div className="absolute left-1/2 top-[66px] h-[12px] w-[30%] -translate-x-1/2 rounded-[10px] bg-[linear-gradient(180deg,#3f3934,#171412)] shadow-[0_18px_40px_-10px_rgba(0,0,0,0.9),inset_0_1px_0_rgba(255,255,255,0.14)]" />
      <div className="absolute left-1/2 top-[74px] h-10 w-[50%] -translate-x-1/2 bg-[radial-gradient(closest-side,rgba(255,108,44,0.2),transparent)]" />
    </div>
  )
}

/** Studio-display style monitor; the 1280×760 desktop is scaled to fit. */
export function Monitor({ phase, run, t }: PlaybackProps) {
  const screenRef = useRef<HTMLDivElement>(null)
  const scale = useFitScale(screenRef, SCREEN_W)

  return (
    <div className="relative mx-auto w-full max-w-[1180px]">
      <div className="relative rounded-[18px] bg-[linear-gradient(180deg,#2c2825,#151312_60%,#100e0d)] p-[8px] shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.14),0_50px_120px_-40px_rgba(0,0,0,0.95),0_30px_90px_-50px_rgba(255,108,44,0.5)] sm:rounded-[26px] sm:p-[14px]">
        <span aria-hidden="true" className="absolute left-1/2 top-[3px] size-1 -translate-x-1/2 rounded-full bg-ink-950 ring-1 ring-white/10 sm:top-[5px] sm:size-[5px]" />
        <div
          ref={screenRef}
          className="relative overflow-hidden rounded-[10px] bg-ink-950 [contain:strict] sm:rounded-[14px]"
          style={{ height: SCREEN_H * scale }}
        >
          <div className="absolute left-0 top-0 origin-top-left" style={{ width: SCREEN_W, height: SCREEN_H, transform: `scale(${scale})` }}>
            <Desktop phase={phase} run={run} t={t} />
          </div>
          {/* glass reflection */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[linear-gradient(115deg,rgba(255,255,255,0.055)_0%,transparent_26%,transparent_72%,rgba(255,255,255,0.025)_100%)]"
          />
        </div>
      </div>
      <Stand />
    </div>
  )
}
