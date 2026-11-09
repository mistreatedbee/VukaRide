export const SITE_NAME = 'Vuka Ride'
export const TAGLINE = 'Moving Africa Forward'
export const SITE_DESCRIPTION =
  'Vuka Ride is a ride-hailing app built for Africa. Request a ride in a few taps, meet a verified driver and get where you are going safely.'

export type PageMeta = { path: string; title: string; description: string; ogImage: string; indexable: boolean }

const OG = '/og/og-image.png'

/** Metadata for every page. Used by the client router and by the build-time prerender. Titles follow content/copy-deck.md. */
export const PAGES: PageMeta[] = [
  { path: '/', title: 'Vuka Ride | Moving Africa Forward', description: SITE_DESCRIPTION, ogImage: OG, indexable: true },
  {
    path: '/drive',
    title: 'Drive with Vuka Ride | Apply to drive',
    description: 'Join the drivers moving Africa forward with Vuka Ride. See what you need and apply to drive.',
    ogImage: '/og/og-drive.png',
    indexable: true,
  },
  {
    path: '/safety',
    title: 'Safety | Vuka Ride',
    description:
      'Safety is part of every Vuka Ride trip: verified drivers, trip sharing, in-app help, and simple tips for riders and drivers.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/about',
    title: 'About Vuka Ride',
    description: 'Vuka means to rise, to wake up. Learn why Vuka Ride is called Vuka and what we stand for.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/contact',
    title: 'Contact Vuka Ride',
    description: 'Questions about a trip, driving with us, or working together? Get in touch with the Vuka Ride team.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/privacy',
    title: 'Privacy Policy | Vuka Ride',
    description: 'How Vuka Ride collects, uses and protects your personal information.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/terms',
    title: 'Terms of Service | Vuka Ride',
    description: 'The terms that apply when you use the Vuka Ride app and website.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/delete-account',
    title: 'Delete your account | Vuka Ride',
    description: 'How to delete your Vuka Ride account and data, from the app or with a request form. No sign-in needed.',
    ogImage: OG,
    indexable: true,
  },
  {
    path: '/download',
    title: 'Get the app | Vuka Ride',
    description: 'Download the Vuka Ride app for Android and iOS.',
    ogImage: OG,
    indexable: true,
  },
]

export const NOT_FOUND_META: PageMeta = {
  path: '/404',
  title: 'Page not found | Vuka Ride',
  description: 'The page you are looking for has moved or does not exist.',
  ogImage: OG,
  indexable: false,
}

export const metaFor = (pathname: string): PageMeta => PAGES.find((p) => p.path === pathname) ?? NOT_FOUND_META
