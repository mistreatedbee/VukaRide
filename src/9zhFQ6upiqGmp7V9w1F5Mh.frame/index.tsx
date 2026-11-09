import React from 'react'
import { BadgeCheck, Car, Flag, LifeBuoy, Lightbulb, Share2 } from 'lucide-react'

import { Route } from '../shared/nav'
import { PageShell, PageHero } from '../shared/components/PageShell'
import { CtaBanner } from '../shared/components/CtaBanner'
import { DoorDecal } from '../shared/components/DoorDecal'
import { FeatureCard, Placeholder, Reveal, SectionHeading } from '../shared/components/ui'
import { PatternBackground } from '../shared/brand/PatternBackground'

export const args = {
  intro: 'Safety is part of every step of a Vuka Ride trip, for riders and for drivers. Here is what is in place, and what you can do.',
}

export const argTypes = {
  intro: { control: 'text' },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

const FEATURES = [
  { icon: BadgeCheck, title: 'Verified drivers and ID', body: <>Drivers are checked before they can accept trips and carry a Vuka Ride ID. <Placeholder>[Describe the checks]</Placeholder></> },
  { icon: Car, title: 'Know your driver and car', body: 'Before you get in, the app shows your driver’s name, photo, car model and number plate.' },
  { icon: Share2, title: 'Share your trip', body: 'Send your live trip to a friend or family member so they can follow your route.' },
  { icon: LifeBuoy, title: 'Help during a trip', body: <>Reach support from the trip screen at any time. <Placeholder>[Add emergency and support details]</Placeholder></> },
  { icon: Flag, title: 'Rate and report', body: 'Rate every trip and report anything that felt wrong. Every report is reviewed.' },
  { icon: Lightbulb, title: 'Safety tips', body: 'Simple habits that make every ride safer, for riders and drivers alike. See them below.' },
]

const RIDER_TIPS = [
  'Wait indoors or somewhere well lit until your driver arrives.',
  'Check the name, photo, car and plate match the app before you get in.',
  'Look for the Vuka Ride sticker on the car door.',
  'Sit in the back and wear your seatbelt.',
  'Share your trip with someone you trust.',
  '[Add further rider guidance]',
]

const DRIVER_STANDARDS = [
  'Keep your documents and vehicle checks up to date.',
  'Display the Vuka Ride sticker and carry your driver ID.',
  'Follow the route in the app unless the rider asks otherwise.',
  'Keep your vehicle clean and in good condition.',
  'Treat every rider with respect.',
  '[Add your driver code of conduct]',
]

export default function Safety(props: Props) {
  const { intro, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="safety" onNavigate={onNavigate}>
      <PageHero eyebrow="Safety" title={<>Every ride, <span className="text-sun">looked after.</span></>} intro={intro} />

      <section aria-labelledby="features-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading id="features-title" eyebrow="What we do" title="Built in, not bolted on" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => (
              <FeatureCard key={f.title} icon={f.icon} title={f.title}>
                {f.body}
              </FeatureCard>
            ))}
          </div>
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

      <section aria-label="Safety guidance" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-14 lg:grid-cols-2 lg:gap-20">
          {[
            { title: 'Safety tips for riders', items: RIDER_TIPS },
            { title: 'Safety standards for drivers', items: DRIVER_STANDARDS },
          ].map((list) => (
            <div key={list.title}>
              <h2 className="text-2xl font-bold text-deep sm:text-[28px]">{list.title}</h2>
              <ol className="mt-6 divide-y divide-green-100 border-y border-green-100">
                {list.items.map((t, i) => (
                  <li key={t} className="flex gap-4 py-4">
                    <span className="w-6 shrink-0 font-semibold text-green-600" aria-hidden="true">
                      {i + 1}
                    </span>
                    <span className="leading-[1.6] text-ink">{t.startsWith('[') ? <Placeholder>{t}</Placeholder> : t}</span>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <CtaBanner />
    </PageShell>
  )
}
