import React from 'react'
import { HandHeart, ShieldCheck, Timer, Users } from 'lucide-react'

import { Route } from '../shared/nav'
import { PageShell, PageHero } from '../shared/components/PageShell'
import { CtaBanner } from '../shared/components/CtaBanner'
import { VukaMark } from '../shared/brand/VukaMark'
import { PatternBackground } from '../shared/brand/PatternBackground'
import { FeatureCard, Placeholder, Reveal, SectionHeading } from '../shared/components/ui'

export const args = {
  mission: 'To make getting around safe, simple and fair for every rider and every driver, in every city we serve.',
}

export const argTypes = {
  mission: { control: 'text' },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

export default function About(props: Props) {
  const { mission, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="about" onNavigate={onNavigate}>
      <PageHero eyebrow="About Vuka Ride" title={<>Rise and <span className="text-sun">go.</span></>} intro="A ride-hailing app made in Africa, for the way Africa moves." />

      {/* Story */}
      <section aria-labelledby="story-title" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-green-600">Our name</p>
            <p className="mt-4 text-[64px] leading-none font-bold tracking-[-0.03em] text-deep sm:text-[96px]">
              Vuka<span className="text-orange">.</span>
            </p>
            <p className="mt-4 text-lg text-slate">
              <em className="not-italic font-semibold text-ink">vuka</em> (verb): to rise; to wake up.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="story-title" className="h2-display text-deep">
              Our story
            </h2>
            <div className="mt-6 space-y-5 text-base leading-[1.75] text-slate sm:text-lg">
              <p>
                Every morning, millions of people wake up and set out: to work, to class, to market, to family. We named the app for that moment, when the day starts and
                the road opens up ahead.
              </p>
              <p>
                <Placeholder>[Add your story: who started Vuka Ride, where, and why.]</Placeholder>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mission */}
      <section aria-labelledby="mission-title" className="relative overflow-hidden bg-brand py-16 lg:py-24">
        <PatternBackground pattern="road" tone="dark" />
        <Reveal className="container-vuka relative flex flex-col items-center text-center">
          <VukaMark size={72} />
          <p className="eyebrow mt-6 text-sun">Our mission</p>
          <h2 id="mission-title" className="h2-display mt-3 text-white">
            Moving Africa Forward
          </h2>
          <p className="mt-5 max-w-2xl text-lg leading-[1.7] text-leaf sm:text-xl">{mission}</p>
        </Reveal>
      </section>

      {/* Values */}
      <section aria-labelledby="values-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <SectionHeading id="values-title" eyebrow="What we stand for" title="Our values" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={ShieldCheck} title="Safety">
              Every decision starts with whether it keeps riders and drivers safe.
            </FeatureCard>
            <FeatureCard icon={HandHeart} title="Dignity">
              Riders and drivers are treated with respect, and paid and priced fairly.
            </FeatureCard>
            <FeatureCard icon={Users} title="Community">
              We grow with the cities we serve and the drivers who live in them.
            </FeatureCard>
            <FeatureCard icon={Timer} title="Reliability">
              When you need a ride, it should be there, and arrive when we say it will.
            </FeatureCard>
          </div>
        </div>
      </section>

      <CtaBanner />
    </PageShell>
  )
}
