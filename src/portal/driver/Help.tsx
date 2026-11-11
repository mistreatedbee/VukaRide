import { Mail, MessageCircle, Phone } from 'lucide-react'

import { emailHref, phoneHref, siteConfig, whatsappHref } from '../../lib/site-config'
import { Card, PageTitle } from '../ui'

export default function Help() {
  const email = siteConfig.driversEmail
  const wa = whatsappHref()
  const tel = phoneHref()
  return (
    <>
      <PageTitle title="Help for drivers" intro="Questions about your application or documents? Reach the driver team here." />
      <div className="mt-8 grid max-w-3xl gap-5 sm:grid-cols-2">
        <Card>
          <Mail className="size-6 text-green-600" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-deep">Email</h2>
          <p className="mt-2 leading-[1.7] text-slate">
            {email ? (
              <a href={`mailto:${email}`} className="font-semibold text-green-600 underline underline-offset-2">
                {email}
              </a>
            ) : (
              <span className="rounded bg-sun/30 px-1">[Drivers email]</span>
            )}
          </p>
        </Card>
        <Card>
          <MessageCircle className="size-6 text-green-600" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-deep">WhatsApp</h2>
          <p className="mt-2 leading-[1.7] text-slate">
            {wa ? (
              <a href={wa} className="font-semibold text-green-600 underline underline-offset-2" rel="noopener noreferrer">
                Message the driver line
              </a>
            ) : (
              <span className="rounded bg-sun/30 px-1">[Driver WhatsApp number]</span>
            )}
          </p>
        </Card>
        <Card className="sm:col-span-2">
          <Phone className="size-6 text-green-600" aria-hidden="true" />
          <h2 className="mt-3 text-lg font-semibold text-deep">Phone and hours</h2>
          <p className="mt-2 leading-[1.7] text-slate">
            {tel ? (
              <a href={tel} className="font-semibold text-green-600 underline underline-offset-2">
                {siteConfig.supportPhone}
              </a>
            ) : (
              <span className="rounded bg-sun/30 px-1">[Phone number]</span>
            )}
            {' · '}Every day 06:00 to 22:00. [Confirm.]
          </p>
          <p className="mt-3 text-sm text-slate">
            Email us at {emailHref() ? 'the address above' : 'the driver address'} and mention the email you signed in with. Never send your
            password or one-time code to anyone.
          </p>
        </Card>
      </div>
    </>
  )
}
