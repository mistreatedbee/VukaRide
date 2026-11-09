import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ComponentType } from 'react'

import { ContactForm } from '../components/forms/ContactForm'
import { PageHero } from '../components/PageShell'
import { Placeholder } from '../components/ui'
import { mailto, phoneHref, siteConfig, whatsappHref } from '../lib/site-config'

type Channel = {
  Icon: ComponentType<{ className?: string }>
  label: string
  value: string | null
  href: string | null
  placeholder: string
  lines?: string[]
}

const HOURS = [
  'Riders: 24/7 in-app help and safety line',
  'Phone and WhatsApp: Mon to Fri 06:00 to 22:00, Sat and Sun 07:00 to 20:00 (SAST)',
  'Office (walk-in): Mon to Fri 08:00 to 17:00',
]

function channels(): Channel[] {
  const { supportEmail, driversEmail, helloEmail, supportPhone, whatsappNumber } = siteConfig
  return [
    { Icon: Mail, label: 'Rider support', value: supportEmail, href: mailto(supportEmail), placeholder: '[Support email]' },
    { Icon: Mail, label: 'Driver support', value: driversEmail, href: mailto(driversEmail), placeholder: '[Drivers email]' },
    { Icon: Mail, label: 'Press and partnerships', value: helloEmail, href: mailto(helloEmail), placeholder: '[Hello email]' },
    { Icon: Phone, label: 'Phone', value: supportPhone, href: phoneHref(), placeholder: '[Phone]' },
    { Icon: MessageCircle, label: 'WhatsApp', value: whatsappNumber, href: whatsappHref(), placeholder: '[WhatsApp]' },
    { Icon: MapPin, label: 'Address', value: null, href: null, placeholder: '[Street address]' },
    { Icon: Clock, label: 'Support hours', value: null, href: null, placeholder: '', lines: HOURS },
  ]
}

export default function Contact() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="We are here to help."
        intro="Questions about a trip, driving with us, or working together? Get in touch."
      />

      <section aria-label="Contact details and form" className="py-12 lg:py-24">
        <div className="container-vuka grid gap-12 lg:grid-cols-[1fr_1.5fr] lg:gap-20">
          <div>
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Reach us directly</h2>
            <p className="mt-3 leading-[1.7] text-slate">
              For help with a live trip, use the help button inside the app. It is the fastest way to reach us.
            </p>
            <ul className="mt-8 divide-y divide-green-100 border-y border-green-100">
              {channels().map(({ Icon, label, value, href, placeholder, lines }) => (
                <li key={label} className="flex items-start gap-4 py-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate">{label}</p>
                    {lines ? (
                      <ul className="space-y-1 font-medium text-ink">
                        {lines.map((l) => (
                          <li key={l}>{l}</li>
                        ))}
                      </ul>
                    ) : (
                      <p className="font-semibold break-words text-ink">
                        {value ? (
                          href ? (
                            <a
                              href={href}
                              className="hover:text-green-600 hover:underline"
                              {...(href.startsWith('http') ? { rel: 'noopener noreferrer' } : {})}
                            >
                              {value}
                            </a>
                          ) : (
                            value
                          )
                        ) : (
                          <Placeholder>{placeholder}</Placeholder>
                        )}
                      </p>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10">
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Send us a message</h2>
            <div className="mt-8">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
