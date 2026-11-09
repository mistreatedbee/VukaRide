import { Facebook, Instagram, Mail, MessageCircle, Phone, Twitter, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { emailHref, phoneHref, siteConfig, whatsappHref } from '../lib/site-config'
import { VukaLogo } from './brand/VukaMark'
import { Placeholder } from './ui'

const COLUMNS: { title: string; links: { label: string; to: string }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'How it works', to: '/#how' },
      { label: 'Safety', to: '/safety' },
      { label: 'Drive with us', to: '/drive' },
      { label: 'FAQ', to: '/#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/contact' },
      { label: 'Get the app', to: '/download' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms of Service', to: '/terms' },
      { label: 'Delete account', to: '/delete-account' },
    ],
  },
]

/** Social links only appear once their profile URL is set in the environment. */
function socialLinks(): { label: string; href: string; Icon: LucideIcon }[] {
  const { social } = siteConfig
  const wa = whatsappHref()
  return [
    social.facebook && { label: 'Vuka Ride on Facebook', href: social.facebook, Icon: Facebook },
    social.instagram && { label: 'Vuka Ride on Instagram', href: social.instagram, Icon: Instagram },
    social.x && { label: 'Vuka Ride on X', href: social.x, Icon: Twitter },
    wa && { label: 'Chat with Vuka Ride on WhatsApp', href: wa, Icon: MessageCircle },
  ].filter((x): x is { label: string; href: string; Icon: LucideIcon } => Boolean(x))
}

export function Footer() {
  const email = emailHref()
  const phone = phoneHref()
  const social = socialLinks()
  return (
    <footer className="bg-night text-leaf">
      <div className="container-vuka pt-16 pb-8 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr] lg:gap-16">
          <div>
            <Link to="/" aria-label="Vuka Ride home" className="inline-flex min-h-11 items-center rounded-md">
              <VukaLogo theme="dark" size={38} />
            </Link>
            <p className="mt-4 text-lg font-medium text-white">Moving Africa Forward.</p>
            {social.length > 0 && (
              <ul className="mt-6 flex gap-2">
                {social.map(({ label, href, Icon }) => (
                  <li key={label}>
                    <a
                      href={href}
                      aria-label={label}
                      rel="noopener noreferrer"
                      className="inline-flex size-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors duration-150 ease-out hover:bg-white/20"
                    >
                      <Icon className="size-5" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-6">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-sm font-semibold text-sun">{col.title}</h2>
                <ul className="mt-4 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="inline-flex min-h-11 min-w-11 items-center text-[15px] hover:text-white sm:min-h-9">
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
            <div className="col-span-2 sm:col-span-1">
              <h2 className="text-sm font-semibold text-sun">Contact</h2>
              <ul className="mt-4 space-y-3 text-[15px]">
                <li className="flex items-center gap-2 break-all">
                  <Mail className="size-4 shrink-0" aria-hidden="true" />
                  {email ? (
                    <a href={email} className="hover:text-white">
                      {siteConfig.supportEmail}
                    </a>
                  ) : (
                    <Placeholder>[Support email]</Placeholder>
                  )}
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  {phone ? (
                    <a href={phone} className="whitespace-nowrap hover:text-white">
                      {siteConfig.supportPhone}
                    </a>
                  ) : (
                    <Placeholder>[Phone]</Placeholder>
                  )}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-leaf/20 pt-6 text-sm">© {new Date().getFullYear()} Vuka Ride. All rights reserved.</div>
      </div>
    </footer>
  )
}
