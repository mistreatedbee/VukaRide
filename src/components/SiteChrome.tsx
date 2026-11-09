import { useEffect, useRef, type ReactNode } from 'react'
import { useLocation } from 'react-router-dom'

import { headTags } from '../lib/head'
import { metaFor, SITE_NAME, SITE_DESCRIPTION } from '../lib/routes'
import { absoluteUrl, siteConfig } from '../lib/site-config'
import { Footer } from './Footer'
import { Header } from './Header'

/** Header, main and footer around every page, plus the skip link. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col overflow-x-clip bg-white font-sans text-ink">
      <a
        href="#main"
        className="sr-only z-50 rounded-full bg-sun px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <Header />
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        {children}
      </main>
      <Footer />
    </div>
  )
}

/** After a route change: scroll to the #anchor or the top, and move focus to <main> for keyboard and screen reader users. */
export function ScrollManager() {
  const { pathname, hash } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const target = hash ? document.getElementById(decodeURIComponent(hash.slice(1))) : null
      if (target) target.scrollIntoView()
      else window.scrollTo({ top: 0 })
      if (!first.current && !target) document.getElementById('main')?.focus({ preventScroll: true })
      first.current = false
    })
    return () => cancelAnimationFrame(id)
  }, [pathname, hash])
  return null
}

/** Keeps title, description, canonical and social tags in step with the route in the browser. The build writes the same tags into each static page. */
export function RouteMeta() {
  const { pathname } = useLocation()
  useEffect(() => {
    const m = metaFor(pathname)
    document.title = m.title
    for (const t of headTags(m)) {
      let el = document.head.querySelector(`[data-head="${t.key}"]`)
      if (!el) {
        el = document.createElement(t.tag)
        el.setAttribute('data-head', t.key)
        document.head.appendChild(el)
      }
      for (const [k, v] of Object.entries(t.attrs)) el.setAttribute(k, v)
    }
  }, [pathname])
  return null
}

/** JSON-LD for the organisation and the website. */
export function JsonLd() {
  const url = absoluteUrl('/')
  const sameAs = Object.values(siteConfig.social).filter(Boolean)
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Organization',
        name: SITE_NAME,
        url,
        logo: absoluteUrl('/icons/icon-512.png'),
        description: SITE_DESCRIPTION,
        ...(siteConfig.supportEmail ? { email: siteConfig.supportEmail } : {}),
        ...(sameAs.length ? { sameAs } : {}),
      },
      { '@type': 'WebSite', name: SITE_NAME, url },
    ],
  }
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />
}
