import { BadgeCheck, Check, Clock, Headset, Wallet } from 'lucide-react'

import { PatternBackground } from '../components/brand/PatternBackground'
import { Bracketed } from '../components/Bracketed'
import { CtaBanner } from '../components/CtaBanner'
import { FaqAccordion } from '../components/FaqAccordion'
import { ApplyForm } from '../components/forms/ApplyForm'
import { PageHero } from '../components/PageShell'
import { ButtonLink, FeatureCard, Reveal, SectionHeading } from '../components/ui'
import { applyToDriveHref } from '../lib/site-config'

const REQUIREMENTS = [
  'Valid driver’s licence [and PrDP where required]',
  'Identity document',
  'Proof of address',
  'Vehicle details and registration',
  'A clean vehicle in good condition',
]

const STEPS = [
  { t: 'Sign up in the app', d: '' },
  { t: 'Upload your documents', d: '' },
  { t: 'Get verified and start driving', d: '[Add verification time]' },
]

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
              <Bracketed text="[Earnings and payout details.]" />
            </FeatureCard>
            <FeatureCard icon={BadgeCheck} title="Verified and respected">
              Every driver gets a Vuka Ride ID and car sticker, so riders know who to expect.
            </FeatureCard>
            <FeatureCard icon={Headset} title="Support when you need it">
              <Bracketed text="[Driver support channel.]" />
            </FeatureCard>
          </div>
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
              intro={<Bracketed text="[Confirm each item before publishing.]" />}
            />
            <ul className="mt-8 space-y-4">
              {REQUIREMENTS.map((r) => (
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
                { q: 'How long does verification take?', a: <Bracketed text="[Add verification time]" /> },
                { q: 'How and when do I get paid?', a: <Bracketed text="[Add payout method and schedule]" /> },
                { q: 'Can I drive part time?', a: <Bracketed text="You choose when to go online. [Confirm.]" /> },
              ]}
            />
          </div>
        </div>
      </section>

      <CtaBanner />
    </>
  )
}
