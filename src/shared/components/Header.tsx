import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'

import { Link, Route } from '../nav'
import { VukaLogo } from '../brand/VukaMark'
import { StoreButtons } from './StoreButtons'

const LINKS: { label: string; to: Route }[] = [
  { label: 'How it works', to: 'home#how' },
  { label: 'Safety', to: 'safety' },
  { label: 'Drive with us', to: 'drive' },
  { label: 'FAQ', to: 'home#faq' },
]

/**
 * Sticky header. Sits transparent over each page's dark hero (heroes pull up
 * under it with -mt-[72px]) and turns solid deep green after 24px of scroll.
 */
export function Header({ current }: { current?: Route }) {
  const [solid, setSolid] = useState(false)
  const [open, setOpen] = useState(false)
  const reduce = useReducedMotion()
  const closeRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const onScroll = () => setSolid(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (!open) return
    closeRef.current?.focus()
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
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
        <Link to="home" aria-label="Vuka Ride home" className="rounded-md">
          <VukaLogo theme="dark" size={34} />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {LINKS.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  aria-current={current === l.to ? 'page' : undefined}
                  className={`rounded-full px-4 py-2.5 text-[15px] font-medium whitespace-nowrap transition-colors duration-150 ease-out hover:text-white ${
                    current === l.to ? 'text-white' : 'text-leaf'
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
            to="home#download"
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

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              className="fixed inset-0 z-40 bg-night/60"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
              onClick={close}
            />
            <motion.div
              key="sheet"
              id="mobile-menu"
              role="dialog"
              aria-modal="true"
              aria-label="Menu"
              className="bg-brand fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col overflow-y-auto px-6 pt-4 pb-8"
              initial={reduce ? { opacity: 0 } : { x: '100%' }}
              animate={reduce ? { opacity: 1 } : { x: 0 }}
              exit={reduce ? { opacity: 0 } : { x: '100%' }}
              transition={{ duration: 0.26, ease: [0.23, 1, 0.32, 1] }}
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
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </header>
  )
}
