import { BadgeCheck, Check, Clock, Headset, Wallet } from 'lucide-react'

import { PatternBackground } from '../components/brand/PatternBackground'
import { Bracketed } from '../components/Bracketed'
import { CtaBanner } from '../components/CtaBanner'
import { FaqAccordion } from '../components/FaqAccordion'
import { ApplyForm } from '../components/forms/ApplyForm'
import { PageHero } from '../components/PageShell'
import { ButtonLink, FeatureCard, Reveal, SectionHeading } from '../components/ui'
import { applyToDriveHref, siteConfig } from '../lib/site-config'

const driversEmail = siteConfig.driversEmail

const DRIVER_REQUIREMENTS = [
  'Valid South African driving licence (code B or higher)',
  'Valid Professional Driving Permit (PrDP) for passengers. You must be at least 21 to hold one.',
  'South African ID, or a valid work permit or visa that allows work',
  'SAPS Criminal Record Report',
  'Proof of address, not older than 3 months',
  'A clear selfie and profile photo',
  'A smartphone that runs the Vuka Ride driver app',
  'A bank account in your own name',
]

const VEHICLE_REQUIREMENTS = [
  'Registered, licensed and roadworthy',
  'Valid insurance that suits carrying passengers [confirm the cover required]',
  'An e-hailing operating licence from the Provincial Regulatory Entity for your province',
  'Vuka Ride branding on the car (door sticker)',
  'Vehicle age and class: [Cars up to X years old, decide before publishing]',
]

const STEPS = [
  { t: 'Sign up in the app', d: '' },
  { t: 'Upload your documents', d: '' },
  {
    t: 'Get verified and start driving',
    d: 'Most applications are reviewed within 2 to 5 working days once all documents are uploaded. Incomplete applications take longer. The provincial operating licence is issued by your Provincial Regulatory Entity, so its timing is not in our hands. [Confirm these times.]',
  },
]

function RequirementList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold text-deep">{title}</h3>
      <ul className="mt-4 space-y-4">
        {items.map((r) => (
          <li key={r} className="flex items-start gap-3">
            <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
              <Check className="size-4" strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="leading-[1.6] text-ink">
              <Bracketed text={r} />
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default function Drive() {
  return (
    <>
      <PageHero
        eyebrow="Drive with us"
        title={
          <>
            Drive. Earn. <span className="text-sun">Move Africa forward.</span>
          </>
        }
        intro="Join the drivers moving Africa forward with Vuka Ride."
      >
        <ButtonLink to={applyToDriveHref()} variant="sun" className="mt-9">
          Apply now
        </ButtonLink>
      </PageHero>

      <section aria-labelledby="benefits-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading id="benefits-title" eyebrow="Why drive with Vuka Ride" title="Work that fits your life" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Clock} title="Flexible hours">
              <Bracketed text="Drive when it suits you. [Confirm.]" />
            </FeatureCard>
            <FeatureCard icon={Wallet} title="Clear earnings">
              <Bracketed text="Card trips are paid to your bank account every Wednesday for the previous Monday to Sunday, with a weekly statement of every trip. [Commission: add the percentage, or say it is shown on every trip.]" />
            </FeatureCard>
            <FeatureCard icon={BadgeCheck} title="Verified and respected">
              Every driver gets a Vuka Ride ID and car sticker, so riders know who to expect.
            </FeatureCard>
            <FeatureCard icon={Headset} title="Support when you need it">
              <Bracketed text="Help in the app (Menu, Help, Driver support), every day 06:00 to 22:00. Driver WhatsApp line: [number]." />
            </FeatureCard>
          </div>
        </div>
      </section>

      <section aria-labelledby="verified-title" className="pb-12 lg:pb-24">
        <div className="container-vuka grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <Reveal className="order-2 lg:order-1">
            <figure>
              <img
                src="/images/driver-id-card.svg"
                width={1600}
                height={1009}
                alt="Vuka Ride driver ID card design with a photo, name, driver ID, vehicle registration and QR code"
                loading="lazy"
                decoding="async"
                className="h-auto w-full max-w-lg rounded-[24px] shadow-[0_24px_60px_-30px_rgba(4,55,31,0.45)]"
              />
            </figure>
          </Reveal>
          <Reveal className="order-1 lg:order-2" delay={0.06}>
            <SectionHeading
              align="left"
              id="verified-title"
              eyebrow="Your ID and sticker"
              title="Riders know who to expect"
              intro="Every driver gets a Vuka Ride ID and car sticker, so riders know who to expect."
            />
            <img
              src="/images/car-mockup.png"
              width={1600}
              height={700}
              alt="Illustration of a white car with the Vuka Ride sticker on its doors"
              loading="lazy"
              decoding="async"
              className="mt-8 h-auto w-full rounded-[24px]"
            />
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="req-title" className="relative bg-mist py-12 lg:py-24">
        <PatternBackground pattern="dots" tone="light" />
        <div className="container-vuka relative grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading
              align="left"
              id="req-title"
              eyebrow="Requirements"
              title="What you will need"
              intro={<Bracketed text="[Confirm each item with your Provincial Regulatory Entity before publishing.]" />}
            />
            <RequirementList title="You" items={DRIVER_REQUIREMENTS} />
            <RequirementList title="Your car" items={VEHICLE_REQUIREMENTS} />
          </Reveal>

          <Reveal delay={0.06}>
            <SectionHeading align="left" eyebrow="How to start" title="On the road in three steps" />
            <ol className="relative mt-8 space-y-8 border-l-2 border-dashed border-green-300 pl-8">
              {STEPS.map((s, i) => (
                <li key={s.t} className="relative">
                  <span
                    className="absolute top-0 -left-[49px] inline-flex size-8 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-deep">
                    <span className="sr-only">Step {i + 1}: </span>
                    {s.t}
                  </h3>
                  {s.d && (
                    <p className="mt-1 leading-[1.7] text-slate">
                      <Bracketed text={s.d} />
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-[72px] py-12 lg:py-24">
        <div className="container-vuka">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10 lg:p-12">
            <h2 id="apply-title" className="h2-display text-deep">
              Apply to drive
            </h2>
            <p className="mt-3 leading-[1.7] text-slate">Leave your details and we will contact you about next steps.</p>
            <div className="mt-8">
              <ApplyForm />
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="dfaq-title" className="pb-12 lg:pb-24">
        <div className="mx-auto w-full max-w-[860px] px-5">
          <SectionHeading id="dfaq-title" eyebrow="Driver FAQ" title="Before you apply" />
          <div className="mt-10">
            <FaqAccordion
              items={[
                {
                  q: 'How long does verification take?',
                  a: (
                    <Bracketed text="Most applications are reviewed within 2 to 5 working days once all documents are uploaded. Incomplete applications take longer. We will email you when your status changes. The provincial operating licence is issued by your Provincial Regulatory Entity, and its timing depends on them. [Confirm.]" />
                  ),
                },
                {
                  q: 'How and when do I get paid?',
                  a: (
                    <Bracketed text="Card trips are paid to your bank account every Wednesday for the previous Monday to Sunday. For cash trips you keep the cash, and the platform fee is taken from your wallet or your next card payout. You get a weekly earnings statement in the app. [Confirm.]" />
                  ),
                },
                { q: 'Can I drive part time?', a: <Bracketed text="You choose when to go online. [Confirm.]" /> },
                {
                  q: 'Who do I contact for driver support?',
                  a: (
                    <>
                      <Bracketed text="In the app: Menu, Help, Driver support. Every day 06:00 to 22:00. WhatsApp: [number]. " />
                      {driversEmail ? (
                        <a href={`mailto:${driversEmail}`} className="font-semibold text-green-600 underline underline-offset-2">
                          {driversEmail}
                        </a>
                      ) : (
                        <Bracketed text="[Drivers email]" />
                      )}
                    </>
                  ),
                },
              ]}
            />
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
