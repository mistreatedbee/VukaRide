import { useEffect, useState } from 'react'
import { ChevronDown, TriangleAlert } from 'lucide-react'

import { LEGAL_DRAFT, type LegalSection } from '../content/legal'
import { PatternBackground } from './brand/PatternBackground'
import { Bracketed } from './Bracketed'
import { DataTable } from './DataTable'

/**
 * Long-form legal page: numbered sections with a sticky contents list on desktop and a collapsible one
 * on mobile. Shows a "Draft" notice while LEGAL_DRAFT is true (src/content/legal.ts).
 */
export function LegalLayout({ title, intro, sections }: { title: string; intro: string; sections: LegalSection[] }) {
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
            className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-[15px] transition-colors duration-150 ease-out ${
              active === s.id ? 'bg-green-50 font-semibold text-deep' : 'text-slate hover:text-deep'
            }`}
          >
            <span className="w-6 shrink-0 tabular-nums">{i + 1}.</span>
            {s.title}
          </a>
        </li>
      ))}
    </ol>
  )

  return (
    <>
      <section className="relative -mt-[72px] overflow-hidden bg-deep pt-[72px]">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative py-14 lg:py-20">
          <p className="eyebrow text-sun">Legal</p>
          <h1 className="mt-4 text-[36px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[52px]">{title}</h1>
          <p className="mt-4 text-leaf">
            Last updated: <span className="font-semibold text-white">[date]</span>
          </p>
        </div>
      </section>

      {/* Remove this notice by setting LEGAL_DRAFT = false in src/content/legal.ts once the text is approved. */}
      {LEGAL_DRAFT && (
        <div role="note" className="border-b border-sun bg-sun/25">
          <p className="container-vuka flex items-start gap-3 py-4 text-sm font-medium text-ink">
            <TriangleAlert className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
            Draft: pending legal review. This page is an outline, not final legal text. Do not rely on it.
          </p>
        </div>
      )}

      <div className="container-vuka grid gap-10 py-10 lg:grid-cols-[280px_1fr] lg:gap-16 lg:py-20">
        <aside aria-label="Contents">
          <details className="group rounded-2xl border border-green-100 lg:hidden">
            <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 font-semibold text-deep">
              Contents
              <ChevronDown className="size-5 transition-transform duration-200 ease-out group-open:rotate-180" aria-hidden="true" />
            </summary>
            <nav aria-label="Contents" className="px-1 pb-3">
              {toc}
            </nav>
          </details>
          <nav aria-label="Contents" className="sticky top-24 hidden lg:block">
            <p className="mb-3 px-3 text-sm font-semibold text-deep">Contents</p>
            {toc}
          </nav>
        </aside>

        <article className="max-w-3xl min-w-0">
          <p className="text-lg leading-[1.75] text-slate">{intro}</p>
          {sections.map((s, i) => (
            <section key={s.id} id={s.id} aria-labelledby={`${s.id}-h`} className="mt-10 scroll-mt-24 border-t border-green-100 pt-8">
              <h2 id={`${s.id}-h`} className="text-2xl font-bold text-deep">
                <span className="mr-2 text-green-600">{i + 1}.</span>
                {s.title}
              </h2>
              <div className="mt-4 space-y-4 leading-[1.75] text-ink">
                {s.paragraphs?.map((p) => (
                  <p key={p}>
                    <Bracketed text={p} />
                  </p>
                ))}
                {s.list && (
                  <ul className="list-disc space-y-2 pl-6">
                    {s.list.map((item) => (
                      <li key={item}>
                        <Bracketed text={item} />
                      </li>
                    ))}
                  </ul>
                )}
                {s.after?.map((p) => (
                  <p key={p}>
                    <Bracketed text={p} />
                  </p>
                ))}
                {s.tables?.map((t) => (
                  <DataTable
                    key={t.caption}
                    caption={t.caption}
                    head={t.head}
                    rows={t.rows.map((r) => r.map((c) => <Bracketed key={c} text={c} />))}
                  />
                ))}
                <p className="rounded-2xl border-2 border-dashed border-sun bg-sun/10 px-5 py-4 text-sm">
                  <Bracketed text={`[Insert final ${title} text for this section]`} />
                </p>
              </div>
            </section>
          ))}
        </article>
      </div>
    </>
  )
}
