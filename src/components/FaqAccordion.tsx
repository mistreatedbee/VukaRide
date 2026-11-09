import { useId, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'
import { Minus, Plus } from 'lucide-react'

export type FaqItem = { q: string; a: ReactNode }

/** Accessible accordion: button headers with aria-expanded, one region per answer, arrow/Home/End keys move between headers. */
export function FaqAccordion({ items, defaultOpen = 0 }: { items: FaqItem[]; defaultOpen?: number | null }) {
  const [open, setOpen] = useState<number | null>(defaultOpen)
  const base = useId()
  const buttons = useRef<(HTMLButtonElement | null)[]>([])

  const onKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    const last = items.length - 1
    const target = { ArrowDown: i === last ? 0 : i + 1, ArrowUp: i === 0 ? last : i - 1, Home: 0, End: last }[e.key]
    if (target === undefined) return
    e.preventDefault()
    buttons.current[target]?.focus()
  }

  return (
    <ul className="divide-y divide-green-100 border-y border-green-100">
      {items.map((item, i) => {
        const isOpen = open === i
        const btnId = `${base}-q${i}`
        const panelId = `${base}-a${i}`
        return (
          <li key={item.q}>
            <h3>
              <button
                ref={(el) => {
                  buttons.current[i] = el
                }}
                id={btnId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => setOpen(isOpen ? null : i)}
                onKeyDown={(e) => onKeyDown(e, i)}
                className="flex min-h-16 w-full items-center justify-between gap-6 py-5 text-left text-lg font-bold text-deep"
              >
                {item.q}
                <span className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-green-50 text-green-600">
                  {isOpen ? <Minus className="size-4" aria-hidden="true" /> : <Plus className="size-4" aria-hidden="true" />}
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              aria-labelledby={btnId}
              className={`grid transition-[grid-template-rows,visibility] duration-200 ease-out ${isOpen ? 'visible grid-rows-[1fr]' : 'invisible grid-rows-[0fr]'}`}
            >
              <div className="overflow-hidden">
                <div className="max-w-2xl pr-12 pb-6 leading-[1.7] text-slate">{item.a}</div>
              </div>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
