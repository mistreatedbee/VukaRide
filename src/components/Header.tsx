import { useEffect, useRef, useState } from 'react'
import { Menu, X } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import { getAppHref } from '../lib/site-config'
import { VukaLogo } from './brand/VukaMark'
import { StoreButtons } from './StoreButtons'

const LINKS = [
  { label: 'How it works', to: '/#how' },
  { label: 'Safety', to: '/safety' },
  { label: 'Drive with us', to: '/drive' },
  { label: 'FAQ', to: '/#faq' },
]

const FOCUSABLE = 'a[href], button:not([disabled])'

/**
 * Sticky header. Sits transparent over each page's dark hero (heroes pull up under it with
 * -mt-[72px]) and turns solid deep green after 24px of scroll. Below lg the menu is a dialog
 * sheet with a focus trap, Escape to close and focus returned to the menu button.
 */
export function Header() {
  const { pathname } = useLocation()
  const [solid, setSolid] = useState(false)
  // The menu is open only for the page it was opened on, so navigating closes it without an effect.
  const [openAt, setOpenAt] = useState<string | null>(null)
  const open = openAt === pathname
  const setOpen = (v: boolean) => setOpenAt(v ? pathname : null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)
  const sheetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setOpenAt(null)
        menuRef.current?.focus()
        return
      }
      if (e.key !== 'Tab') return
      const items = Array.from(sheetRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])
      const first = items[0]
      const last = items[items.length - 1]
      if (!first || !last) return
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault()
        last.focus()
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previous
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const close = () => {
    setOpen(false)
    menuRef.current?.focus()
  }

  return (
    <header
      className={`sticky top-0 z-40 h-[72px] transition-[background-color,box-shadow] duration-200 ease-out ${
        solid ? 'bg-deep shadow-[0_4px_20px_rgba(4,55,31,0.25)]' : 'bg-transparent'
      }`}
    >
      <div className="container-vuka flex h-full items-center justify-between gap-6">
        <Link to="/" aria-label="Vuka Ride home" className="inline-flex min-h-11 items-center rounded-md">
          <VukaLogo theme="dark" size={34} />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  aria-current={pathname === l.to ? 'page' : undefined}
                  className={`rounded-full px-4 py-2.5 text-[15px] font-medium whitespace-nowrap transition-colors duration-150 ease-out hover:text-white ${
                    pathname === l.to ? 'text-white' : 'text-leaf'
                  }`}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <Link
            to={getAppHref()}
            className="hidden min-h-11 items-center rounded-full bg-sun px-5 text-[15px] font-semibold whitespace-nowrap text-ink transition-[filter] duration-150 ease-out hover:brightness-105 sm:inline-flex"
          >
            Get the app
          </Link>
          <button
            ref={menuRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-menu"
            className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-white/10 lg:hidden"
          >
            <Menu className="size-6" aria-hidden="true" />
          </button>
        </div>
      </div>

      {open && (
        <>
          <div className="fade-in fixed inset-0 z-40 bg-night/60" onClick={close} aria-hidden="true" />
          <div
            ref={sheetRef}
            id="mobile-menu"
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
            className="bg-brand sheet-in fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto px-6 pt-4 pb-8"
          >
            <div className="flex h-14 items-center justify-between">
              <VukaLogo theme="dark" size={30} />
              <button
                ref={closeRef}
                type="button"
                onClick={close}
                aria-label="Close menu"
                className="inline-flex size-11 items-center justify-center rounded-full text-white hover:bg-white/10"
              >
                <X className="size-6" aria-hidden="true" />
              </button>
            </div>
            <nav aria-label="Mobile" className="mt-8">
              <ul className="flex flex-col">
                {LINKS.map((l) => (
                  <li key={l.label} className="border-b border-leaf/15">
                    <Link to={l.to} onClick={() => setOpen(false)} className="flex min-h-14 items-center text-2xl font-semibold text-white">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </nav>
            <div className="mt-auto pt-10">
              <p className="mb-3 text-sm text-leaf">Get the app</p>
              <StoreButtons />
            </div>
          </div>
        </>
      )}
    </header>
  )
}
