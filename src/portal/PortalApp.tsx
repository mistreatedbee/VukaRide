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
} from 'lucide-react'
import { lazy, Suspense, useEffect, type ReactNode } from 'react'
import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom'

import { VukaLogo } from '../components/brand/VukaMark'
import { PortalProvider, usePortal, usePortalState } from './auth'
import { MfaGate } from './MfaGate'
import { Notice, Spinner } from './ui'
import type { Role } from './types'

const Login = lazy(() => import('./Login'))
const DriverOverview = lazy(() => import('./driver/Overview'))
const DriverApplication = lazy(() => import('./driver/Application'))
const DriverDocuments = lazy(() => import('./driver/Documents'))
const DriverEarnings = lazy(() => import('./driver/Earnings'))
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

function Shell({ role, children }: { role: Role; children: ReactNode }) {
  const { api, session } = usePortal()
  return (
    <div className="min-h-screen bg-mist">
      <a
        href="#portal-main"
        className="sr-only z-50 rounded-full bg-sun px-4 py-2 font-semibold text-ink focus:not-sr-only focus:fixed focus:top-3 focus:left-3"
      >
        Skip to content
      </a>
      <header className="border-b border-green-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-5 py-3">
          <div className="flex items-center gap-4">
            <Link to="/" aria-label="Vuka Ride website" className="block">
              <VukaLogo size={32} />
            </Link>
            <span className="rounded-full bg-leaf px-3 py-1 text-sm font-semibold text-deep">{role === 'admin' ? 'Admin' : 'Driver'}</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden max-w-[16rem] truncate text-slate sm:inline" title={session.email}>
              {session.email}
            </span>
            <button
              type="button"
              onClick={() => void api.signOut()}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-green-300 px-4 font-semibold text-deep hover:bg-green-50"
            >
              <LogOut className="size-4" aria-hidden="true" />
              Sign out
            </button>
          </div>
        </div>
        <nav aria-label={`${role === 'admin' ? 'Admin' : 'Driver'} sections`} className="mx-auto w-full max-w-6xl overflow-x-auto px-3">
          <ul className="flex min-w-max gap-1">
            {NAV[role].map(({ to, label, icon: Icon, end }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `inline-flex min-h-12 items-center gap-2 border-b-[3px] px-3 text-[15px] font-semibold ${
                      isActive ? 'border-green-600 text-deep' : 'border-transparent text-slate hover:text-deep'
                    }`
                  }
                >
                  <Icon className="size-4" aria-hidden="true" />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
      </header>
      {api.mode === 'demo' && (
        <div className="mx-auto w-full max-w-6xl px-5 pt-5">
          <Notice tone="warn" title="Demo data (development only)">
            Nothing here is saved to a database. Set the Supabase variables to use real data.
          </Notice>
        </div>
      )}
      <main id="portal-main" tabIndex={-1} className="mx-auto w-full max-w-6xl px-5 py-8 outline-none">
        <Suspense fallback={<Spinner />}>{children}</Suspense>
      </main>
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
