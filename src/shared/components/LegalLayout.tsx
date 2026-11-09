import React, { useEffect, useState } from 'react'
import { ChevronDown } from 'lucide-react'

import { Route } from '../nav'
import { PageShell } from './PageShell'
import { PatternBackground } from '../brand/PatternBackground'

export type LegalSection = { id: string; title: string; placeholder: string }

/**
 * Long-form legal page: numbered sections with a sticky contents list on
 * desktop and a collapsible one on mobile. Section bodies are placeholders
 * for the real legal text.
 */
export function LegalLayout({
  current,
  onNavigate,
  title,
  lastUpdated,
  intro,
  sections,
}: {
  current: Route
  onNavigate?: (to: Route) => void
  title: string
  lastUpdated: string
  intro: string
  sections: LegalSection[]
}) {
  const [active, setActive] = useState(sections[0]?.id)

  useEffect(() => {
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (visible) setActive(visible.target.id)
      },
      { rootMargin: '-90px 0px -60% 0px' }
    )
    sections.forEach((s) => {
      const el = document.getElementById(s.id)
      if (el) obs.observe(el)
    })
    return () => obs.disconnect()
  }, [sections])

  const toc = (
    <ol className="space-y-1">
      {sections.map((s, i) => (
        <li key={s.id}>
          <a
            href={`#${s.id}`}
            aria-current={active === s.id ? 'location' : undefined}
            className={`flex min-h-10 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors duration-150 ease-out ${
              active === s.id ? 'bg-green-50 font-semibold text-deep' : 'text-slate hover:text-deep'
            }`}
          >
            <span className="w-5 shrink-0 tabular-nums">{i + 1}.</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <PageShell current={current} onNavigate={onNavigate}>
      <section className="relative -mt-[72px] overflow-hidden bg-deep pt-[72px]">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative py-14 lg:py-20">
          <p className="eyebrow text-sun">Legal</p>
          <h1 className="mt-4 text-[36px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[52px]">{title}</h1>
          <p className="mt-4 text-leaf">
            Last updated: <span className="font-semibold text-white">{lastUpdated}</span>
          </p>
        </div>
      </section>

      <div className="container-vuka grid gap-10 py-10 lg:grid-cols-[260px_1fr] lg:gap-16 lg:py-20">
        <aside aria-label="Contents">
          <details className="group rounded-2xl border border-green-100 lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold text-deep">
              Contents
              <ChevronDown className="size-5 transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden="true" />
            </summary>
            <div className="px-1 pb-3">{toc}</div>
          </details>
          <nav className="sticky top-24 hidden lg:block">
            <p className="mb-3 px-3 text-sm font-semibold text-deep">Contents</p>
            {toc}
          </nav>
        </aside>

        <article className="min-w-0 max-w-3xl">
          <p className="text-lg leading-[1.75] text-slate">{intro}</p>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="scroll-mt-24 border-t border-green-100 pt-8 mt-10 first-of-type:mt-10">
              <h2 id={`${s.id}-h`} className="text-2xl font-bold text-deep">
                <span className="mr-2 text-green-600">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-4 rounded-2xl border-2 border-dashed border-sun/60 bg-sun/10 px-5 py-6 text-ink">{s.placeholder}</div>
            </section>
          ))}
        </article>
      </div>
    </PageShell>
  )
}
