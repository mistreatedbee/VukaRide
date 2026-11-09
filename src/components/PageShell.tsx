import type { ReactNode } from 'react'

import { PatternBackground } from './brand/PatternBackground'

/** Dark page hero used by every page except Home. Renders the page's single h1. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  pattern = true,
}: {
  eyebrow: string
  title: ReactNode
  intro?: ReactNode
  children?: ReactNode
  pattern?: boolean
}) {
  return (
    <section className="relative -mt-[72px] overflow-hidden bg-deep pt-[72px]">
      {pattern && <PatternBackground pattern="road" tone="dark" />}
      <div className="container-vuka relative py-16 lg:py-24">
        <p className="eyebrow text-sun">{eyebrow}</p>
        <h1 className="h1-display mt-4 max-w-3xl text-white">{title}</h1>
        {intro && <p className="mt-5 max-w-2xl text-base leading-[1.7] text-leaf sm:text-lg">{intro}</p>}
        {children}
      </div>
    </section>
  )
}
