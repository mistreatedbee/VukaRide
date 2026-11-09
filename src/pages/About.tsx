import { HandHeart, ShieldCheck, Timer, Users } from 'lucide-react'

import { PatternBackground } from '../components/brand/PatternBackground'
import { VukaMark } from '../components/brand/VukaMark'
import { Bracketed } from '../components/Bracketed'
import { CtaBanner } from '../components/CtaBanner'
import { PageHero } from '../components/PageShell'
import { FeatureCard, Placeholder, Reveal, SectionHeading } from '../components/ui'

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About Vuka Ride"
        title={
          <>
            Why we are called <span className="text-sun">Vuka.</span>
          </>
        }
        intro="A ride-hailing app built for Africa."
      />

      <section aria-labelledby="story-title" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <Reveal>
            <p className="eyebrow text-green-600">Our name</p>
            <p className="mt-4 flex items-end gap-2 text-[64px] leading-none font-bold tracking-[-0.03em] text-deep sm:text-[96px]">
              Vuka
              <span className="mb-2 inline-block size-3 rounded-full bg-sun sm:mb-3 sm:size-4" aria-hidden="true" />
            </p>
            <p className="mt-4 text-lg text-slate">
              <em className="font-semibold text-ink not-italic">vuka</em> (verb): to rise; to wake up.
            </p>
          </Reveal>
          <Reveal delay={0.06}>
            <h2 id="story-title" className="h2-display text-deep">
              Our story
            </h2>
            <div className="mt-6 space-y-5 text-base leading-[1.75] text-slate sm:text-lg">
              <p>
                “Vuka” means to rise, to wake up. Our logo is a road that opens up to a rising sun, because every journey is a new start.
              </p>
              <p>
                <Bracketed text="[Add your founding story.]" />
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="mission-title" className="bg-brand relative overflow-hidden py-16 lg:py-24">
        <PatternBackground pattern="road" tone="dark" />
        <Reveal className="container-vuka relative flex flex-col items-center text-center">
          <VukaMark size={72} />
          <p className="eyebrow mt-6 text-sun">Our mission</p>
          <h2 id="mission-title" className="h2-display mt-3 text-white">
            Moving Africa Forward
          </h2>
          <p className="mt-5 max-w-2xl rounded-lg bg-white px-3 py-2 text-lg leading-[1.7] text-ink sm:text-xl">
            <Bracketed text="[One sentence on what you want to change.]" />
          </p>
        </Reveal>
      </section>

      <section aria-labelledby="values-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <SectionHeading id="values-title" eyebrow="What we stand for" title="Our values" />
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Safety' },
              { icon: HandHeart, title: 'Dignity' },
              { icon: Users, title: 'Community' },
              { icon: Timer, title: 'Reliability' },
            ].map((v) => (
              <FeatureCard key={v.title} icon={v.icon} title={v.title}>
                <Placeholder>[One line about {v.title.toLowerCase()}]</Placeholder>
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
