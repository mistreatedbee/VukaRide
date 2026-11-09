import React from 'react'
import { BadgeCheck, Check, Clock, Headset, Wallet } from 'lucide-react'

import { Route } from '../shared/nav'
import { PageShell, PageHero } from '../shared/components/PageShell'
import { FaqAccordion } from '../shared/components/FaqAccordion'
import { CtaBanner } from '../shared/components/CtaBanner'
import { ButtonLink, FeatureCard, Placeholder, Reveal, SectionHeading } from '../shared/components/ui'
import { ApplyForm } from '../shared/forms/ApplyForm'
import { PatternBackground } from '../shared/brand/PatternBackground'

export const args = {
  formState: 'default',
}

export const argTypes = {
  formState: { control: 'select', options: ['default', 'errors', 'loading', 'success'] },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

export default function DriveWithUs(props: Props) {
  const { formState, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="drive" onNavigate={onNavigate}>
      <PageHero
        eyebrow="Drive with us"
        title={
          <>
            Drive. Earn. <span className="text-sun">Move Africa forward.</span>
          </>
        }
        intro="Use your car to earn on your own schedule, with riders who are verified too and support a tap away."
      >
        <ButtonLink to="drive#apply" variant="sun" className="mt-9">
          Apply now
        </ButtonLink>
      </PageHero>

      {/* Benefits */}
      <section aria-labelledby="benefits-title" className="py-12 lg:py-24">
        <div className="container-vuka">
          <Reveal>
            <SectionHeading id="benefits-title" eyebrow="Why drive with Vuka Ride" title="Work that fits your life" />
          </Reveal>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard icon={Clock} title="Flexible hours">
              Go online when it suits you and log off when you are done. No shifts to book.
            </FeatureCard>
            <FeatureCard icon={Wallet} title="Clear earnings">
              See what each trip pays. <Placeholder>[Add earnings details]</Placeholder>
            </FeatureCard>
            <FeatureCard icon={BadgeCheck} title="Verified and respected">
              You get a driver ID and a Vuka Ride sticker, so riders know your car on sight.
            </FeatureCard>
            <FeatureCard icon={Headset} title="Support when you need it">
              Reach our driver team from the app if anything goes wrong on a trip.
            </FeatureCard>
          </div>
        </div>
      </section>

      {/* Requirements + how to start */}
      <section aria-labelledby="req-title" className="relative bg-mist py-12 lg:py-24">
        <PatternBackground pattern="dots" tone="light" />
        <div className="container-vuka relative grid gap-14 lg:grid-cols-2 lg:gap-20">
          <Reveal>
            <SectionHeading align="left" id="req-title" eyebrow="Requirements" title="What you will need" intro={<Placeholder>[Confirm requirements]</Placeholder>} />
            <ul className="mt-8 space-y-4">
              {[
                'A valid driver’s licence, and a PrDP where required',
                'Your vehicle details and registration',
                'An identity document',
                'Proof of address',
                'A clean vehicle in good condition',
              ].map((r) => (
                <li key={r} className="flex items-start gap-3">
                  <span className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-green-600 text-white">
                    <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="leading-[1.6] text-ink">{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>

          <Reveal delay={0.06}>
            <SectionHeading align="left" eyebrow="How to start" title="On the road in three steps" />
            <ol className="relative mt-8 space-y-8 border-l-2 border-dashed border-green-300 pl-8">
              {[
                { t: 'Apply', d: 'Fill in the form below or sign up in the Vuka Ride app.' },
                { t: 'Upload your documents', d: 'Send your licence, ID, proof of address and vehicle papers from the app.' },
                { t: 'Get verified and start driving', d: 'Once you are approved, collect your sticker and go online. [Add verification time]' },
              ].map((s, i) => (
                <li key={s.t} className="relative">
                  <span className="absolute top-0 -left-[49px] inline-flex size-8 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink" aria-hidden="true">
                    {i + 1}
                  </span>
                  <h3 className="text-xl font-semibold text-deep">{s.t}</h3>
                  <p className="mt-1 leading-[1.7] text-slate">{s.d}</p>
                </li>
              ))}
            </ol>
          </Reveal>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" aria-labelledby="apply-title" className="scroll-mt-[72px] py-12 lg:py-24">
        <div className="container-vuka">
          <div className="mx-auto max-w-3xl rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10 lg:p-12">
            <h2 id="apply-title" className="h2-display text-deep">
              Apply to drive
            </h2>
            <p className="mt-3 leading-[1.7] text-slate">It takes about five minutes. We will contact you about next steps.</p>
            <div className="mt-8" key={formState}>
              <ApplyForm state={formState as 'default'} />
            </div>
          </div>
        </div>
      </section>

      {/* Driver FAQ */}
      <section aria-labelledby="dfaq-title" className="pb-12 lg:pb-24">
        <div className="mx-auto w-full max-w-[860px] px-5">
          <SectionHeading id="dfaq-title" eyebrow="Driver FAQ" title="Before you apply" />
          <div className="mt-10">
            <FaqAccordion
              items={[
                { q: 'How long does verification take?', a: <Placeholder>[Add verification time]</Placeholder> },
                { q: 'How and when do I get paid?', a: <Placeholder>[Add payout method and schedule]</Placeholder> },
                { q: 'Can I drive part time?', a: 'Yes. You choose when to go online, so you can drive around work, study or family.' },
              ]}
            />
          </div>
        </div>
      </section>

      <CtaBanner />
    </PageShell>
  )
}
