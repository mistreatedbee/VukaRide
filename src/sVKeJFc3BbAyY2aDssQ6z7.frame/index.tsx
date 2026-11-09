import React from 'react'

import { Route } from '../shared/nav'
import { PageShell } from '../shared/components/PageShell'
import { VukaMark } from '../shared/brand/VukaMark'
import { PatternBackground } from '../shared/brand/PatternBackground'
import { ButtonLink } from '../shared/components/ui'

export const args = {
  message: 'The page you were looking for has moved or never existed. Let us get you back on track.',
}

export const argTypes = {
  message: { control: 'text' },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

export default function NotFound(props: Props) {
  const { message, onNavigate } = { ...args, ...props }
  return (
    <PageShell current="not-found" onNavigate={onNavigate}>
      <section className="bg-brand relative -mt-[72px] overflow-hidden pt-[72px]">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative flex flex-col items-center py-24 text-center lg:py-36">
          <VukaMark size={112} />
          <p className="eyebrow mt-8 text-sun">Error 404</p>
          <h1 className="mt-4 max-w-2xl text-[36px] leading-[1.08] font-bold tracking-[-0.02em] text-white sm:text-[52px]">This road does not lead anywhere</h1>
          <p className="mt-5 max-w-md text-base leading-[1.7] text-leaf sm:text-lg">{message}</p>
          <ButtonLink to="home" variant="sun" className="mt-10">
            Back to home
          </ButtonLink>
        </div>
      </section>
    </PageShell>
  )
}
