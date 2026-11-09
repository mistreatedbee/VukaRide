import React from 'react'
import { Facebook, Instagram, Mail, MessageCircle, Phone, Twitter } from 'lucide-react'

import { Link, Route } from '../nav'
import { VukaLogo } from '../brand/VukaMark'

const COLUMNS: { title: string; links: { label: string; to: Route }[] }[] = [
  {
    title: 'Explore',
    links: [
      { label: 'How it works', to: 'home#how' },
      { label: 'Safety', to: 'safety' },
      { label: 'Drive with us', to: 'drive' },
      { label: 'FAQ', to: 'home#faq' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: 'about' },
      { label: 'Contact', to: 'contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: 'privacy' },
      { label: 'Terms of Service', to: 'terms' },
      { label: 'Delete account', to: 'delete-account' },
    ],
  },
]

const SOCIAL = [
  { label: 'Vuka Ride on Facebook', Icon: Facebook },
  { label: 'Vuka Ride on Instagram', Icon: Instagram },
  { label: 'Vuka Ride on X', Icon: Twitter },
  { label: 'Chat with Vuka Ride on WhatsApp', Icon: MessageCircle },
]

export function Footer() {
  return (
    <footer className="bg-night text-leaf">
      <div className="container-vuka pt-16 pb-8 lg:pt-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_2fr] lg:gap-16">
          <div>
            <Link to="home" aria-label="Vuka Ride home" className="inline-block rounded-md">
              <VukaLogo theme="dark" size={38} />
            </Link>
            <p className="mt-4 text-lg font-medium text-white">Moving Africa Forward.</p>
            <ul className="mt-6 flex gap-2">
              {SOCIAL.map(({ label, Icon }) => (
                <li key={label}>
                  <a
                    href="#"
                    aria-label={label}
                    className="inline-flex size-11 items-center justify-center rounded-full bg-white/8 text-white transition-colors duration-150 ease-out hover:bg-white/15"
                  >
                    <Icon className="size-5" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-4 sm:gap-6">
            {COLUMNS.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-sm font-semibold text-sun">{col.title}</h2>
                <ul className="mt-4 space-y-1">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link to={l.to} className="inline-flex min-h-11 items-center text-[15px] hover:text-white sm:min-h-9">
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
                  <a href="mailto:support@yourdomain" className="hover:text-white">[support@yourdomain]</a>
                </li>
                <li className="flex items-center gap-2">
                  <Phone className="size-4 shrink-0" aria-hidden="true" />
                  <a href="tel:+27000000000" className="whitespace-nowrap hover:text-white">[+27 00 000 0000]</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-14 border-t border-leaf/20 pt-6 text-sm">© 2026 Vuka Ride. All rights reserved.</div>
      </div>
    </footer>
  )
}
