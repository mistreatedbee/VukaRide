import { BadgeCheck, Check, LifeBuoy, MapPin, Receipt, Share2, ShieldCheck } from 'lucide-react'
import { Link } from 'react-router-dom'

import { PatternBackground } from '../components/brand/PatternBackground'
import { Bracketed } from '../components/Bracketed'
import { CtaBanner } from '../components/CtaBanner'
import { DoorDecal } from '../components/DoorDecal'
import { FaqAccordion } from '../components/FaqAccordion'
import { PhoneMockup } from '../components/PhoneMockup'
import { StoreButtons } from '../components/StoreButtons'
import { ButtonLink, FeatureCard, Reveal, SectionHeading, StepCard } from '../components/ui'
import { applyToDriveHref } from '../lib/site-config'

export default function Home() {
  return (
    <>
      <section aria-labelledby="hero-title" className="bg-brand relative -mt-[72px] overflow-hidden pt-[72px]">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative grid items-center gap-14 py-14 lg:grid-cols-[1.15fr_1fr] lg:gap-10 lg:py-24">
          <div>
            <p className="eyebrow inline-flex rounded-full border border-sun/40 bg-night/40 px-4 py-2 text-sun">Moving Africa Forward</p>
            <h1 id="hero-title" className="h1-display mt-6 text-white">
              <span className="text-sun">Vuka.</span> Your ride is waiting.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-[1.7] text-leaf sm:text-lg">
              Request a ride in a few taps, meet a verified driver, and get where you are going safely.
            </p>
            <StoreButtons className="mt-9" />
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneMockup />
          </div>
        </div>
      </section>

      <section aria-labelledby="why-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading
              id="why-title"
              eyebrow="Why Vuka Ride"
              title="Built for everyday journeys"
              intro="Whether it is the morning commute or a night out, Vuka Ride gets you there with less stress."
            />
          </Reveal>
          <div className="mt-12 grid gap-5 md:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Verified drivers', body: 'Look for the Vuka Ride sticker and driver ID before you get in.' },
              {
                icon: MapPin,
                title: 'Follow your trip',
                body: 'See your driver arrive and your route on the map, from pickup to drop-off.',
              },
              { icon: Receipt, title: 'Clear fares', body: 'Know what to expect before you confirm your ride.' },
            ].map((f, i) => (
              <Reveal key={f.title} delay={i * 0.05} className="h-full">
                <FeatureCard icon={f.icon} title={f.title}>
                  {f.body}
                </FeatureCard>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="how" aria-labelledby="how-title" className="relative scroll-mt-[72px] bg-mist py-12 lg:py-24">
        <PatternBackground pattern="dots" tone="light" />
        <div className="container-vuka relative">
          <Reveal>
            <SectionHeading id="how-title" eyebrow="How it works" title="Three taps from here to there" />
          </Reveal>
          <ol className="mt-12 grid gap-5 md:grid-cols-3">
            <StepCard n={1} title="Request">
              Enter where you are going and request a ride.
            </StepCard>
            <StepCard n={2} title="Meet your driver">
              Check the car and driver details in the app, then hop in.
            </StepCard>
            <StepCard n={3} title="Arrive">
              Get to your destination and rate your trip.
            </StepCard>
          </ol>
        </div>
      </section>

      <section id="safety" aria-labelledby="safety-title" className="relative scroll-mt-[72px] overflow-hidden bg-night py-16 lg:py-24">
        <PatternBackground pattern="mark" tone="dark" />
        <div className="container-vuka relative grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading
              id="safety-title"
              align="left"
              tone="dark"
              eyebrow="Safety first"
              title="Every ride, looked after"
              intro="We want you to feel confident from the moment you open the app to the moment you arrive."
            />
            <ul className="mt-8 space-y-5">
              {[
                {
                  icon: BadgeCheck,
                  title: 'Verified driver badge and ID',
                  body: 'Every driver carries a Vuka Ride ID and displays our sticker on the car.',
                },
                { icon: Share2, title: 'Share your trip', body: 'Let someone you trust follow your journey.' },
                { icon: LifeBuoy, title: 'Help when you need it', body: 'Reach support from inside the app during or after a ride.' },
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
            <ButtonLink to="/safety" variant="outline-light" className="mt-10">
              How we keep you safe
            </ButtonLink>
          </Reveal>
          <Reveal className="mx-auto w-full max-w-md" delay={0.06}>
            <figure className="-rotate-2 rounded-[28px] bg-white p-4 shadow-[0_30px_60px_-20px_rgba(0,0,0,0.5)] sm:p-5">
              <DoorDecal />
              <figcaption className="mt-4 text-center text-sm font-medium text-slate">
                Look for this sticker on every Vuka Ride car.
              </figcaption>
            </figure>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="drive-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal className="grid items-center gap-10 rounded-[32px] bg-sun p-7 sm:p-12 lg:grid-cols-2 lg:gap-16 lg:p-16">
            <div>
              <p className="eyebrow text-deep">Drive with us</p>
              <h2 id="drive-title" className="h2-display mt-3 text-deep">
                Drive with Vuka Ride
              </h2>
              <p className="mt-4 text-base leading-[1.7] text-ink sm:text-lg">
                <Bracketed text="Join the drivers moving Africa forward. [Driver requirements and earnings summary.]" />
              </p>
              <ButtonLink to={applyToDriveHref()} variant="deep" className="mt-8">
                Apply to drive
              </ButtonLink>
            </div>
            <ol className="space-y-3">
              {['Sign up in the app', 'Upload your documents', 'Get verified and start driving'].map((step, i) => (
                <li key={step} className="flex min-h-16 items-center gap-4 rounded-full bg-white py-3 pr-6 pl-3">
                  <span
                    className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-deep font-bold text-white"
                    aria-hidden="true"
                  >
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

      <section id="faq" aria-labelledby="faq-title" className="scroll-mt-[72px] py-12 lg:py-24">
        <div className="mx-auto w-full max-w-[860px] px-5">
          <SectionHeading id="faq-title" eyebrow="FAQ" title="Questions, answered" />
          <div className="mt-10">
            <FaqAccordion
              items={[
                { q: 'Where is Vuka Ride available?', a: <Bracketed text="[Launch cities.] Check the app for service in your area." /> },
                { q: 'How do I pay for a ride?', a: <Bracketed text="[Payment methods the app supports.]" /> },
                {
                  q: 'How do I become a driver?',
                  a: (
                    <>
                      Tap Drive with us, sign up in the app and upload your documents. Drivers are verified before they can accept rides.
                      You can also{' '}
                      <Link to="/drive" className="font-semibold text-green-600 underline underline-offset-2">
                        apply on our driver page
                      </Link>
                      .
                    </>
                  ),
                },
                { q: 'What if I need help during a trip?', a: <Bracketed text="[In-app support and contact details.]" /> },
                {
                  q: 'How is my information used?',
                  a: (
                    <>
                      <Bracketed text="[Short privacy summary.]" /> Read our{' '}
                      <Link to="/privacy" className="font-semibold text-green-600 underline underline-offset-2">
                        Privacy Policy
                      </Link>{' '}
                      for the full details.
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>
    </>
  )
}
