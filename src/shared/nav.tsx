import React, { createContext, useContext } from 'react'

/**
 * Routes of the site. A route may carry an anchor, e.g. "home#faq".
 * In the real Next.js build these map to /, /drive, /safety, /about, /contact,
 * /privacy, /terms, /delete-account and the 404 page.
 */
export type Route =
  | 'home'
  | 'home#how'
  | 'home#faq'
  | 'home#download'
  | 'drive'
  | 'drive#apply'
  | 'safety'
  | 'about'
  | 'contact'
  | 'privacy'
  | 'terms'
  | 'delete-account'
  | 'not-found'

type Navigate = (to: Route) => void

const NavContext = createContext<Navigate | undefined>(undefined)

export function NavProvider({ onNavigate, children }: { onNavigate?: Navigate; children: React.ReactNode }) {
  return <NavContext.Provider value={onNavigate}>{children}</NavContext.Provider>
}

export function useNavigate(): Navigate {
  const nav = useContext(NavContext)
  return (to) => {
    if (nav) return nav(to)
    // Opened on its own: only in-page anchors can resolve.
    const [, anchor] = to.split('#')
    if (anchor) document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' })
  }
}

export function hrefFor(to: Route) {
  const [page, anchor] = to.split('#')
  const path = page === 'home' ? '/' : `/${page}`
  return anchor ? `${path}#${anchor}` : path
}

type LinkProps = Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> & { to: Route }

export function Link({ to, onClick, children, ...rest }: LinkProps) {
  const navigate = useNavigate()
  return (
    <a
      href={hrefFor(to)}
      onClick={(e) => {
        e.preventDefault()
        onClick?.(e)
        navigate(to)
      }}
      {...rest}
    >
      {children}
    </a>
  )
}
