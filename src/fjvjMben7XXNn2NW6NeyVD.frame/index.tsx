import React from 'react'
import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'

import { Route } from '../shared/nav'
import { PageShell, PageHero } from '../shared/components/PageShell'
import { ContactForm } from '../shared/forms/ContactForm'

export const args = {
  formState: 'default',
}

export const argTypes = {
  formState: { control: 'select', options: ['default', 'errors', 'loading', 'success'] },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

const CHANNELS = [
  { Icon: Mail, label: 'Email', value: '[support@yourdomain]', href: 'mailto:support@yourdomain' },
  { Icon: Phone, label: 'Phone', value: '[+27 00 000 0000]', href: 'tel:+27000000000' },
  { Icon: MessageCircle, label: 'WhatsApp', value: '[+27 00 000 0000]', href: '#' },
  { Icon: MapPin, label: 'Address', value: '[Street address, City, Postal code]' },
  { Icon: Clock, label: 'Hours', value: '[Mon–Fri, 08:00–17:00]' },
]

export default function Contact(props: Props) {
  const { formState, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="contact" onNavigate={onNavigate}>
      <PageHero eyebrow="Contact" title="We are here to help." intro="Questions about a trip, driving with us, or working together? Get in touch." />

      <section aria-label="Contact details and form" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Reach us directly</h2>
            <p className="mt-3 leading-[1.7] text-slate">For help with a live trip, use the help button inside the app. It is the fastest way to reach us.</p>
            <dl className="mt-8 divide-y divide-green-100 border-y border-green-100">
              {CHANNELS.map(({ Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4 py-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <dt className="text-sm text-slate">{label}</dt>
                    <dd className="font-semibold break-words text-ink">
                      {href ? (
                        <a href={href} className="hover:text-green-600 hover:underline">
                          {value}
                        </a>
                      ) : (
                        value
                      )}
                    </dd>
                  </div>
                </div>
              ))}
            </dl>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10">
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Send us a message</h2>
            <div className="mt-8" key={formState}>
              <ContactForm state={formState as 'default'} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
