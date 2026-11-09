import React from 'react'

import { NavProvider, Route } from '../nav'
import { Header } from './Header'
import { Footer } from './Footer'
import { PatternBackground } from '../brand/PatternBackground'

/**
 * Header, main and footer around a page. Each page's first section is dark and
 * pulls up under the transparent header with `-mt-[72px] pt-[72px]`.
 */
export function PageShell({ current, onNavigate, children }: { current?: Route; onNavigate?: (to: Route) => void; children: React.ReactNode }) {
  return (
    <NavProvider onNavigate={onNavigate}>
      <div className="flex min-h-full flex-col overflow-x-clip bg-white font-sans text-ink">
        <a
          href="#main"
          className="sr-only z-50 rounded-full bg-sun px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
        >
          Skip to content
        </a>
        <Header current={current} />
        <main id="main" className="flex-1">
          {children}
        </main>
        <Footer />
      </div>
    </NavProvider>
  )
}

/** Dark page hero used by every page except Home. */
export function PageHero({
  eyebrow,
  title,
  intro,
  children,
  pattern = true,
}: {
  eyebrow: string
  title: React.ReactNode
  intro?: React.ReactNode
  children?: React.ReactNode
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
