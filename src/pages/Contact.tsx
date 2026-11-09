import { Clock, Mail, MapPin, MessageCircle, Phone } from 'lucide-react'
import type { ComponentType } from 'react'

import { ContactForm } from '../components/forms/ContactForm'
import { PageHero } from '../components/PageShell'
import { Placeholder } from '../components/ui'
import { emailHref, phoneHref, siteConfig, whatsappHref } from '../lib/site-config'

type Channel = {
  Icon: ComponentType<{ className?: string }>
  label: string
  value: string | null
  href: string | null
  placeholder: string
}

function channels(): Channel[] {
  return [
    { Icon: Mail, label: 'Email', value: siteConfig.supportEmail, href: emailHref(), placeholder: '[Support email]' },
    { Icon: Phone, label: 'Phone', value: siteConfig.supportPhone, href: phoneHref(), placeholder: '[Phone]' },
    { Icon: MessageCircle, label: 'WhatsApp', value: siteConfig.whatsappNumber, href: whatsappHref(), placeholder: '[WhatsApp]' },
    { Icon: MapPin, label: 'Address', value: null, href: null, placeholder: '[Address]' },
    { Icon: Clock, label: 'Hours', value: null, href: null, placeholder: '[Hours]' },
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
              {channels().map(({ Icon, label, value, href, placeholder }) => (
                <li key={label} className="flex items-start gap-4 py-4">
                  <span className="inline-flex size-10 shrink-0 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <Icon className="size-5" aria-hidden="true" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm text-slate">{label}</p>
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
