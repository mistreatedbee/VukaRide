import React from 'react'
import { BadgeCheck, Check, LifeBuoy, MapPin, Receipt, Share2, ShieldCheck } from 'lucide-react'

import { Link, Route } from '../shared/nav'
import { PageShell } from '../shared/components/PageShell'
import { PatternBackground } from '../shared/brand/PatternBackground'
import { StoreButtons } from '../shared/components/StoreButtons'
import { PhoneMockup } from '../shared/components/PhoneMockup'
import { DoorDecal } from '../shared/components/DoorDecal'
import { FaqAccordion } from '../shared/components/FaqAccordion'
import { CtaBanner } from '../shared/components/CtaBanner'
import { ButtonLink, FeatureCard, Placeholder, Reveal, SectionHeading, StepCard } from '../shared/components/ui'

export const args = {
  headline: 'Your ride is waiting.',
  subcopy: 'Request a ride in a few taps, meet a verified driver, and get where you are going safely.',
  faqOpen: 0,
}

export const argTypes = {
  headline: { control: 'text' },
  subcopy: { control: 'text' },
  faqOpen: { control: 'select', options: [0, 1, 2, 3, 4] },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

export default function Home(props: Props) {
  const { headline, subcopy, faqOpen, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="home" onNavigate={onNavigate}>
      {/* Hero */}
      <section aria-labelledby="hero-title" className="bg-brand relative -mt-[72px] overflow-hidden pt-[72px]">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative grid items-center gap-14 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:py-24">
          <div>
            <p className="eyebrow inline-flex rounded-full border border-sun/40 bg-night/40 px-4 py-2 text-sun">Moving Africa Forward</p>
            <h1 id="hero-title" className="h1-display mt-6 text-white">
              <span className="text-sun">Vuka.</span> {headline}
            </h1>
            <p className="mt-6 max-w-lg text-base leading-[1.7] text-leaf sm:text-lg">{subcopy}</p>
            <StoreButtons className="mt-9" />
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      {/* Why Vuka Ride */}
      <section aria-labelledby="why-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading
              id="why-title"
              eyebrow="Why Vuka Ride"
              title="Built for everyday journeys"
              intro="To work, to class, to family on a Sunday: rides that are simple to book and easy to trust."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Verified drivers', body: 'Every driver is checked before their first trip, and you see who is coming before they arrive.' },
              { icon: MapPin, title: 'Follow your trip', body: 'Watch your driver approach on the map, then follow the route all the way to your door.' },
              { icon: Receipt, title: 'Clear fares', body: 'See the fare before you request, so there is no guessing at the end of the ride.' },
            ].map((f, i) => (
              <React.Fragment key={f.title}>
                <Reveal delay={i * 0.05} className="h-full">
                  <FeatureCard icon={f.icon} title={f.title}>
                    {f.body}
                  </FeatureCard>
                </Reveal>
              </React.Fragment>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how" aria-labelledby="how-title" className="relative scroll-mt-[72px] bg-mist py-12 lg:py-24">
        <PatternBackground pattern="dots" tone="light" />
        <div className="container-vuka relative">
          <Reveal>
            <SectionHeading id="how-title" eyebrow="How it works" title="Three taps from here to there" />
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            <StepCard n={1} title="Request">
              Open the app, enter where you are going and confirm your pickup point.
            </StepCard>
            <StepCard n={2} title="Meet your driver">
              Check the driver's name, photo and number plate before you get in.
            </StepCard>
            <StepCard n={3} title="Arrive">
              Ride with your trip on the map, then rate your driver when you get there.
            </StepCard>
          </ol>
        </div>
      </section>

      {/* Safety */}
      <section id="safety" aria-labelledby="safety-title" className="relative overflow-hidden bg-night py-16 lg:py-24">
        <PatternBackground pattern="mark" tone="dark" />
        <div className="container-vuka relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading
              id="safety-title"
              align="left"
              tone="dark"
              eyebrow="Safety first"
              title="Every ride, looked after"
              intro="From the moment you request to the moment you step out, safety is built into every part of the trip."
            />
            <ul className="mt-8 space-y-5">
              {[
                { icon: BadgeCheck, title: 'Verified driver badge and ID', body: 'Drivers carry a Vuka Ride ID, and verified drivers show a badge in the app.' },
                { icon: Share2, title: 'Share your trip', body: 'Send your live trip to someone you trust so they can follow along.' },
                { icon: LifeBuoy, title: 'Help when you need it', body: <>Reach support from inside the trip. <Placeholder>[Add support details]</Placeholder></> },
              ].map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sun text-ink">
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <div>
                    <p className="font-semibold text-white">{item.title}</p>
                    <p className="mt-1 text-[15px] leading-[1.65] text-leaf">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
            <ButtonLink to="safety" variant="outline-light" className="mt-10">
              How we keep you safe
            </ButtonLink>
          </Reveal>
          <Reveal className="mx-auto w-full max-w-md" delay={0.06}>
            <figure className="-rotate-2 rounded-[28px] bg-white p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] sm:p-5">
              <DoorDecal />
              <figcaption className="mt-4 text-center text-sm font-medium text-slate">Look for this sticker on every Vuka Ride car.</figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      {/* Drive with us */}
      <section aria-labelledby="drive-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal className="grid items-center gap-10 rounded-[32px] bg-sun p-7 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
            <div>
              <p className="eyebrow text-deep">Drive with us</p>
              <h2 id="drive-title" className="h2-display mt-3 text-deep">
                Drive with Vuka Ride
              </h2>
              <p className="mt-4 text-base leading-[1.7] text-ink sm:text-lg">
                Join the drivers moving Africa forward. <Placeholder>[Add driver requirements and earnings details here.]</Placeholder>
              </p>
              <ButtonLink to="drive" variant="deep" className="mt-8">
                Apply to drive
              </ButtonLink>
            </div>
            <ol className="space-y-3">
              {['Sign up in the app', 'Upload your documents', 'Get verified and start driving'].map((step, i) => (
                <li key={step} className="flex min-h-16 items-center gap-4 rounded-full bg-white py-3 pr-6 pl-3">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-deep font-bold text-white" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-ink">{step}</span>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <CtaBanner />

      {/* FAQ */}
      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-[72px] py-12 lg:py-24">
        <div className="mx-auto w-full max-w-[860px] px-5">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10">
            <FaqAccordion
              defaultOpen={faqOpen}
              items={[
                { q: 'Where is Vuka Ride available?', a: <Placeholder>[Add your launch cities here.]</Placeholder> },
                { q: 'How do I pay for a ride?', a: <Placeholder>[Add the payment methods the app supports.]</Placeholder> },
                {
                  q: 'How do I become a driver?',
                  a: (
                    <>
                      Sign up in the app, upload your documents and wait for verification. You can also{' '}
                      <Link to="drive" className="font-semibold text-green-600 underline underline-offset-2">
                        apply on our driver page
                      </Link>
                      .
                    </>
                  ),
                },
                { q: 'What if I need help during a trip?', a: <>Use the help button on your trip screen. <Placeholder>[Add support details.]</Placeholder></> },
                {
                  q: 'How is my information used?',
                  a: (
                    <>
                      We use your details to arrange rides, keep trips safe and support you when something goes wrong. Read the full{' '}
                      <Link to="privacy" className="font-semibold text-green-600 underline underline-offset-2">
                        Privacy Policy
                      </Link>
                      .
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>
    </PageShell>
  )
}
