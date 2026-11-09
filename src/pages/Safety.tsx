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
    body: 'Drivers carry a Vuka Ride ID and a sticker on the car. [Describe your verification steps.]',
  },
  { icon: Car, title: 'Know your driver and car', body: 'See driver and vehicle details in the app before pickup.' },
  { icon: Share2, title: 'Share your trip', body: 'Let someone you trust follow your journey.' },
  { icon: LifeBuoy, title: 'Help during a trip', body: 'Reach support from inside the app.' },
  { icon: Flag, title: 'Rate and report', body: 'Tell us how your ride went so we can keep improving.' },
  { icon: Lightbulb, title: 'Safety tips', body: 'Simple habits that make every trip safer.' },
]

const RIDER_TIPS = [
  'Check the plate, car and driver photo match the app before you get in.',
  'Share your trip with someone you trust.',
  'Sit in the back seat if you prefer.',
  'Keep your phone charged.',
  'Report anything that does not feel right.',
]

const DRIVER_STANDARDS = ['[Add your code of conduct summary.]']

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
