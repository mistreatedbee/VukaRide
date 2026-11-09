import { BadgeCheck, Car, Flag, LifeBuoy, Lightbulb, Share2 } from 'lucide-react'

import { PatternBackground } from '../components/brand/PatternBackground'
import { Bracketed } from '../components/Bracketed'
import { CtaBanner } from '../components/CtaBanner'
import { DoorDecal } from '../components/DoorDecal'
import { PageHero } from '../components/PageShell'
import { FeatureCard, Reveal, SectionHeading } from '../components/ui'

const FEATURES = [
  {
    icon: BadgeCheck,
    title: 'Verified drivers and ID',
    body: 'Drivers carry a Vuka Ride ID and a sticker on the car. See how we verify drivers below.',
  },
  { icon: Car, title: 'Know your driver and car', body: 'Check the driver’s photo, name, plate and car in the app before you get in.' },
  { icon: Share2, title: 'Share your trip', body: 'Send your live trip link to someone you trust.' },
  {
    icon: LifeBuoy,
    title: 'Help during a trip',
    body: 'Tap the shield icon to alert our safety team, or call support in one tap from the trip screen. In danger, call SAPS on 10111 or 112 first. [Confirm the app has these features.]',
  },
  { icon: Flag, title: 'Rate and report', body: 'Tell us how your ride went so we can keep improving.' },
  { icon: Lightbulb, title: 'Safety tips', body: 'Simple habits that make every trip safer.' },
]

const RIDER_TIPS = [
  'Check the plate, car and driver photo match the app before you get in.',
  'Share your trip with someone you trust.',
  'Sit in the back seat if you prefer.',
  'Keep your phone charged.',
  'Report anything that does not feel right.',
  'In danger, call SAPS on 10111 or 112 from a mobile phone, then tell us.',
]

const DRIVER_PROMISE = [
  'I drive safely and obey the law. No phones, no speeding, no alcohol or drugs.',
  'I treat every rider with respect, whatever their gender, race, religion, disability or background.',
  'I keep my car clean, safe and legal, with my documents up to date.',
  'I take the route the rider expects. No detours, no extra charges.',
  'I never harass, threaten or discriminate against a rider, or ask for anything beyond the fare.',
  'I never share a rider’s personal information.',
  'I report accidents and safety incidents to Vuka Ride straight away.',
  'I accept that serious breaches lead to suspension or removal.',
]

const VERIFY_STEPS = [
  { t: 'ID check', d: 'We check the ID against the driver’s selfie.' },
  { t: 'Licence and PrDP', d: 'We check both are valid and current.' },
  { t: 'Criminal record check', d: 'Every driver provides a SAPS Criminal Record Report.' },
  { t: 'Vehicle check', d: 'Registration, roadworthiness and branding.' },
  {
    t: 'Ongoing review',
    d: 'Riders rate every trip. Low ratings or safety reports trigger a review, and serious reports mean immediate suspension.',
  },
]

export default function Safety() {
  return (
    <>
      <PageHero
        eyebrow="Safety"
        title={
          <>
            Safety is part of <span className="text-sun">every ride.</span>
          </>
        }
        intro="We want riders and drivers to feel confident from the moment they open the app to the moment they arrive."
      />

      <section aria-labelledby="features-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading id="features-title" eyebrow="What we do" title="Built in, not bolted on" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title}>
                <Bracketed text={f.body} />
              </FeatureCard>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="verify-title" className="bg-mist pt-12 pb-12 lg:pt-24 lg:pb-24">
        <div className="container-vuka grid gap-12 lg:grid-cols-[1fr_1.3fr] lg:gap-20">
          <Reveal>
            <SectionHeading
              id="verify-title"
              align="left"
              eyebrow="Verified drivers"
              title="How we verify drivers"
              intro={<Bracketed text="[Confirm these steps match what you really do before publishing.]" />}
            />
          </Reveal>
          <Reveal delay={0.06}>
            <ol className="space-y-6">
              {VERIFY_STEPS.map((v, i) => (
                <li key={v.t} className="flex gap-4">
                  <span
                    className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-sun font-bold text-ink"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-deep">
                      <span className="sr-only">Step {i + 1}: </span>
                      {v.t}
                    </h3>
                    <p className="mt-1 leading-[1.7] text-slate">{v.d}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="sticker-title" className="relative overflow-hidden bg-night py-16 lg:py-24">
        <PatternBackground pattern="mark" tone="dark" />
        <div className="container-vuka relative grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          <SectionHeading
            id="sticker-title"
            align="left"
            tone="dark"
            eyebrow="Know the car"
            title="Look for the sticker"
            intro="Every Vuka Ride car carries this decal on the door. If it is missing, or the details do not match the app, do not get in and contact support."
          />
          <div className="mx-auto w-full max-w-sm">
            <DoorDecal />
          </div>
        </div>
      </section>

      <section aria-label="The sticker on the car" className="pt-12 lg:pt-24">
        <div className="container-vuka">
          <figure className="mx-auto max-w-4xl overflow-hidden rounded-[28px] border border-green-100 bg-mist">
            <img
              src="/images/car-mockup.png"
              width={1600}
              height={700}
              alt="Illustration of a white car with the Vuka Ride sticker on its doors"
              loading="lazy"
              decoding="async"
              className="h-auto w-full"
            />
            <figcaption className="px-6 py-4 text-center text-sm font-medium text-slate">
              Look for the Vuka Ride sticker on the door before you get in.
            </figcaption>
          </figure>
        </div>
      </section>

      <section aria-label="Safety guidance" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-14 lg:grid-cols-2 lg:gap-20">
          {[
            { title: 'Safety tips for riders', items: RIDER_TIPS },
            { title: 'The Vuka Ride driver promise', items: DRIVER_PROMISE },
          ].map((list) => (
            <div key={list.title}>
              <h2 className="text-2xl font-bold text-deep sm:text-[28px]">{list.title}</h2>
              <ol className="mt-6 divide-y divide-green-100 border-y border-green-100">
                {list.items.map((t, i) => (
                  <li key={t} className="flex gap-4 py-4">
                    <span className="w-6 shrink-0 font-semibold text-green-600" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="leading-[1.6] text-ink">
                      <Bracketed text={t} />
                    </span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
