import { Tween } from '@/components/ui/Tween'
import { cn } from '@/lib/utils'
import type { NightTotals } from './events'

export function NightStats({ totals, className }: { totals: NightTotals; className?: string }) {
  const stats = [
    { label: 'PRs merged', value: totals.prs, tone: 'text-sand-50' },
    { label: 'tests run', value: totals.tests, tone: 'text-sand-50' },
    { label: 'incidents handled', value: totals.incidents, tone: 'text-sand-50' },
    { label: 'pages to on-call', value: 0, tone: 'text-mint-300' },
  ]
  return (
    <dl className={cn('grid grid-cols-2 gap-x-8 gap-y-3 sm:flex sm:items-center sm:gap-10', className)}>
      {stats.map((stat) => (
        <div key={stat.label} className="flex items-baseline gap-2">
          <dt className="sr-only">{stat.label}</dt>
          <dd className={cn('font-mono text-[22px] font-medium tracking-[-0.03em] sm:text-[26px]', stat.tone)}>
            <Tween value={stat.value} />
          </dd>
          <span aria-hidden="true" className="text-[12px] text-sand-500">
            {stat.label}
          </span>
        </div>
      ))}
    </dl>
  )
}
