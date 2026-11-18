import {
  ClipboardList,
  FileText,
  HelpCircle,
  Inbox,
  LayoutDashboard,
  LogOut,
  ScrollText,
  UserRound,
  UsersRound,
  Wallet,
  type LucideIcon,
  UserCog,
} from 'lucide-react'
import { lazy, Suspense, useEffect, useRef, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes, useLocation } from 'react-router-dom'

import { VukaLogo } from '../components/brand/VukaMark'
import { PortalProvider, usePortal, usePortalState } from './auth'
import { MfaGate } from './MfaGate'
import { Notice, Spinner } from './ui'
import type { Role } from './types'

const Login = lazy(() => import('./Login'))
const Signup = lazy(() => import('./Signup'))
const DriverOverview = lazy(() => import('./driver/Overview'))
const DriverApplication = lazy(() => import('./driver/Application'))
const DriverDocuments = lazy(() => import('./driver/Documents'))
const DriverEarnings = lazy(() => import('./driver/Earnings'))
const DriverProfile = lazy(() => import('./driver/Profile'))
const DriverHelp = lazy(() => import('./driver/Help'))
const AdminOverview = lazy(() => import('./admin/Overview'))
const AdminApplications = lazy(() => import('./admin/Applications'))
const AdminApplicationDetail = lazy(() => import('./admin/ApplicationDetail'))
const AdminInbox = lazy(() => import('./admin/Inbox'))
const AdminDrivers = lazy(() => import('./admin/Drivers'))
const AdminAudit = lazy(() => import('./admin/AuditLog'))

const NAV: Record<Role, { to: string; label: string; icon: LucideIcon; end?: boolean }[]> = {
  driver: [
    { to: '/driver', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/driver/application', label: 'Application', icon: UserRound },
    { to: '/driver/documents', label: 'Documents', icon: FileText },
    { to: '/driver/profile', label: 'Profile', icon: UserCog },
    { to: '/driver/earnings', label: 'Earnings', icon: Wallet },
    { to: '/driver/help', label: 'Help', icon: HelpCircle },
  ],
  admin: [
    { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
    { to: '/admin/applications', label: 'Applications', icon: ClipboardList },
    { to: '/admin/drivers', label: 'Drivers', icon: UsersRound },
    { to: '/admin/inbox', label: 'Inbox', icon: Inbox },
    { to: '/admin/audit', label: 'Audit log', icon: ScrollText },
  ],
}

/**
 * After moving to another screen: scroll to the top, give the page a title that names it (screen readers announce it),
 * and move focus to the main area so keyboard and screen reader users start at the new content, not on the old link.
 */
function RouteFocus() {
  const { pathname } = useLocation()
  const first = useRef(true)
  useEffect(() => {
    const main = document.getElementById('portal-main')
    const setTitle = () => {
      const h1 = main?.querySelector('h1')?.textContent?.trim()
      if (h1) document.title = `${h1} | Vuka Ride portal`
      return Boolean(h1)
    }
    window.scrollTo({ top: 0 })
    if (!first.current) main?.focus({ preventScroll: true })
    first.current = false
    // The new screen loads lazily, so wait for its heading to appear before naming the page.
    if (setTitle() || !main) return
    document.title = 'Vuka Ride portal'
    const watcher = new MutationObserver(() => setTitle() && watcher.disconnect())
    watcher.observe(main, { childList: true, subtree: true })
    const stop = window.setTimeout(() => watcher.disconnect(), 5000)
    return () => {
      watcher.disconnect()
      window.clearTimeout(stop)
    }
  }, [pathname])
  return null
}

function Shell({ role, children }: { role: Role; children: ReactNode }) {
  const { api, session } = usePortal()
  const label = role === 'admin' ? 'Admin' : 'Driver'
  const name = session.fullName || session.email
  const initials =
    name
      .split(/[\s@.]+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0]!.toUpperCase())
      .join('') || '?'
  return (
    <div className="min-h-screen bg-mist lg:grid lg:grid-cols-[17rem_1fr]">
      <a
        href="#portal-main"
        className="sr-only z-50 rounded-full bg-sun px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      {/* One block: a top bar with scrolling tabs on phones, a fixed dark sidebar from lg up. */}
      <header className="bg-night text-white lg:sticky lg:top-0 lg:flex lg:h-screen lg:flex-col lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-4 px-5 py-3 lg:block lg:px-6 lg:pt-7 lg:pb-2">
          <Link to="/" aria-label="Vuka Ride website" className="block">
            <VukaLogo theme="dark" size={32} />
          </Link>
          <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-leaf uppercase lg:mt-4 lg:inline-block">
            {label} portal
          </span>
        </div>
        <nav aria-label={`${label} sections`} className="overflow-x-auto px-3 lg:mt-6 lg:flex-1 lg:overflow-visible lg:px-4">
          <ul className="flex min-w-max gap-1 pb-2 lg:min-w-0 lg:flex-col lg:pb-0">
            {NAV[role].map(({ to, label: text, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `flex min-h-11 items-center gap-3 rounded-xl px-3.5 text-[15px] font-medium transition-colors ${
                      isActive
                        ? 'bg-white/12 text-white shadow-[inset_3px_0_0_var(--color-sun)]'
                        : 'text-leaf/80 hover:bg-white/8 hover:text-white'
                    }`
                  }
                >
                  <Icon className="size-[18px]" aria-hidden="true" />
                  {text}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden border-t border-white/10 p-4 lg:block">
          <div className="flex items-center gap-3 rounded-2xl bg-white/5 p-3">
            <span
              aria-hidden="true"
              className="inline-flex size-10 shrink-0 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink"
            >
              {initials}
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{session.fullName || label}</p>
              <p className="truncate text-xs text-leaf/70" title={session.email}>
                {session.email}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void api.signOut()}
            className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-white/20 text-sm font-semibold text-white hover:bg-white/10"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
      </header>
      <div className="min-w-0">
        {/* Phones: sign out sits in a slim bar under the tabs, since the sidebar footer is hidden. */}
        <div className="flex items-center justify-between gap-3 border-b border-green-100 bg-white px-5 py-2 lg:hidden">
          <span className="max-w-[60%] truncate text-sm text-slate" title={session.email}>
            {session.email}
          </span>
          <button
            type="button"
            onClick={() => void api.signOut()}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-300 px-4 text-sm font-semibold text-deep hover:bg-green-50"
          >
            <LogOut className="size-4" aria-hidden="true" />
            Sign out
          </button>
        </div>
        {api.mode === 'demo' && (
          <div className="mx-auto w-full max-w-6xl px-5 pt-5 lg:px-10">
            <Notice tone="warn" title="Demo data (development only)">
              Nothing here is saved to a database. Set the Supabase variables to use real data.
            </Notice>
          </div>
        )}
        <RouteFocus />
        <main id="portal-main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-5 py-8 outline-none lg:px-10 lg:py-10">
          <Suspense fallback={<Spinner />}>{children}</Suspense>
        </main>
      </div>
    </div>
  )
}

function Guard({ as: role, children }: { as: Role; children: ReactNode }) {
  const state = usePortalState()
  if (state.status !== 'ready') return <Spinner />
  if (!state.session) return <Navigate to="/login" replace />
  if (state.session.role !== role) return <Navigate to={state.session.role === 'admin' ? '/admin' : '/driver'} replace />
  if (state.session.mfa !== 'ok') return <MfaGate mode={state.session.mfa} factorId={state.session.mfaFactorId} />
  return <Shell role={role}>{children}</Shell>
}

function Unavailable() {
  return (
    <div className="mx-auto w-full max-w-md px-5 py-16">
      <VukaLogo size={40} />
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-deep">The driver portal is not open yet</h1>
      <p className="mt-3 leading-[1.7] text-slate">
        We are still setting it up. You can apply to drive on the website and we will be in touch.
      </p>
      <Link to="/drive#apply" className="mt-6 inline-flex min-h-12 items-center rounded-full bg-sun px-6 font-semibold text-ink">
        Apply to drive
      </Link>
    </div>
  )
}

function Routing() {
  const state = usePortalState()
  useEffect(() => {
    document.title = 'Vuka Ride portal'
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robots) {
      robots = document.createElement('meta')
      robots.name = 'robots'
      document.head.appendChild(robots)
    }
    robots.content = 'noindex, nofollow'
  }, [])
  if (state.status === 'loading') return <Spinner />
  if (state.status === 'unavailable') return <Unavailable />
  return (
    <div className="min-h-screen bg-white font-sans text-ink">
      <Suspense fallback={<Spinner />}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route
            path="/driver"
            element={
              <Guard as="driver">
                <DriverOverview />
              </Guard>
            }
          />
          <Route
            path="/driver/application"
            element={
              <Guard as="driver">
                <DriverApplication />
              </Guard>
            }
          />
          <Route
            path="/driver/documents"
            element={
              <Guard as="driver">
                <DriverDocuments />
              </Guard>
            }
          />
          <Route
            path="/driver/profile"
            element={
              <Guard as="driver">
                <DriverProfile />
              </Guard>
            }
          />
          <Route
            path="/driver/earnings"
            element={
              <Guard as="driver">
                <DriverEarnings />
              </Guard>
            }
          />
          <Route
            path="/driver/help"
            element={
              <Guard as="driver">
                <DriverHelp />
              </Guard>
            }
          />
          <Route
            path="/admin"
            element={
              <Guard as="admin">
                <AdminOverview />
              </Guard>
            }
          />
          <Route
            path="/admin/applications"
            element={
              <Guard as="admin">
                <AdminApplications />
              </Guard>
            }
          />
          <Route
            path="/admin/applications/:id"
            element={
              <Guard as="admin">
                <AdminApplicationDetail />
              </Guard>
            }
          />
          <Route
            path="/admin/drivers"
            element={
              <Guard as="admin">
                <AdminDrivers />
              </Guard>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <Guard as="admin">
                <AdminAudit />
              </Guard>
            }
          />
          <Route
            path="/admin/inbox"
            element={
              <Guard as="admin">
                <AdminInbox />
              </Guard>
            }
          />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </div>
  )
}

export default function PortalApp() {
  return (
    <PortalProvider>
      <Routing />
    </PortalProvider>
  )
}
