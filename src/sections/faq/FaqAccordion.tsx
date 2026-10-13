import { Plus } from 'lucide-react'
import { AnimatePresence, motion } from 'motion/react'
import { useState } from 'react'
import { AGENTS } from '@/data/agents'
import { EASE_OUT } from '@/lib/motion'
import { cn } from '@/lib/utils'
import { FAQS } from './faqs'
import { Paragraphs } from './RichText'

/** Mobile / tablet FAQ: accessible accordion, one panel open at a time. */
export function FaqAccordion() {
  const [open, setOpen] = useState<string | null>(FAQS[0]?.id ?? null)

  return (
    <ul className="divide-y divide-white/[0.07] overflow-hidden rounded-3xl border border-white/[0.07] bg-white/[0.02]">
      {FAQS.map((faq) => {
        const isOpen = open === faq.id
        const agent = AGENTS.find((a) => a.id === faq.agent)
        const Icon = agent?.icon
        return (
          <li key={faq.id} className={cn('transition-colors duration-300', isOpen && 'bg-ember-500/[0.04]')}>
            <h3>
              <button
                type="button"
                id={`faq-q-${faq.id}`}
                aria-expanded={isOpen}
                aria-controls={`faq-a-${faq.id}`}
                onClick={() => setOpen(isOpen ? null : faq.id)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left"
              >
                <span className={cn('flex-1 text-[15px] tracking-[-0.01em] transition-colors', isOpen ? 'text-sand-50' : 'text-sand-200')}>{faq.question}</span>
                <span
                  className={cn(
                    'grid size-7 shrink-0 place-items-center rounded-full transition-colors',
                    isOpen ? 'bg-ember-500/15 text-ember-200' : 'bg-white/[0.05] text-sand-400',
                  )}
                >
                  <Plus aria-hidden="true" className={cn('size-3.5 transition-transform duration-300', isOpen && 'rotate-45')} />
                </span>
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  id={`faq-a-${faq.id}`}
                  role="region"
                  aria-labelledby={`faq-q-${faq.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: EASE_OUT }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-5">
                    {agent && Icon && (
                      <p className="mb-2.5 flex items-center gap-2 text-[12px] text-sand-500">
                        <span className="grid size-6 place-items-center rounded-lg bg-ember-500/12 text-ember-200 ring-1 ring-inset ring-ember-400/30">
                          <Icon aria-hidden="true" className="size-3" />
                        </span>
                        <span className="text-sand-200">{agent.codename}</span> · {agent.name} agent
                      </p>
                    )}
                    <div className="flex flex-col gap-3 text-[14.5px] leading-relaxed text-sand-300">
                      <Paragraphs text={faq.answer} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </li>
        )
      })}
    </ul>
  )
}
