import { Check, CheckCircle2, Circle, Landmark, ShieldCheck, Star } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ButtonLink } from '../../components/ui'
import { usePortal } from '../auth'
import {
  DOC_INFO,
  DOC_KINDS,
  formatRand,
  isEditable,
  maskAccount,
  missingRequiredDocs,
  STATUS_HELP,
  tripNetCents,
  weeklyTotals,
  weekStart,
  type Application,
  type BankDetails,
  type DocumentRow,
  type Trip,
} from '../types'
import { Card, formatDate, Loaded, Notice, PageTitle, StatusBadge, useLoad } from '../ui'

function detailsComplete(a: Application | null) {
  return Boolean(
    a && a.fullName && a.mobile && a.email && a.city && a.vehicle && a.vehicleYear && a.plate && a.licenceConfirmed && a.termsAccepted
  )
}

const time = (iso: string) =>
  new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

/** What an approved driver sees: this week at a glance, latest trips and the state of their account. */
function ActiveDashboard({ app, docs, trips, bank }: { app: Application; docs: DocumentRow[]; trips: Trip[]; bank: BankDetails | null }) {
  const weeks = weeklyTotals(trips)
  const thisWeek = weeks.find((w) => w.weekStart.getTime() === weekStart(new Date()).getTime())
  const completed = trips.filter((t) => t.status === 'completed')
  const km = completed.reduce((n, t) => n + (t.distanceKm ?? 0), 0)
  const accepted = docs.filter((d) => d.status === 'accepted').length
  return (
    <div className="mt-8 space-y-6">
      <section aria-labelledby="hero-h" className="bg-brand relative overflow-hidden rounded-[28px] p-6 text-white sm:p-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-leaf uppercase">
              <ShieldCheck className="size-4" aria-hidden="true" />
              Verified driver
            </p>
            <h2 id="hero-h" className="mt-4 text-sm font-semibold text-leaf">
              Earned this week
            </h2>
            <p className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">{formatRand(thisWeek?.netCents ?? 0)}</p>
            <p className="mt-2 text-leaf">
              {thisWeek?.trips ?? 0} trips · {formatRand(thisWeek?.tipCents ?? 0)} in tips
            </p>
          </div>
          <div className="rounded-2xl bg-white/10 p-4 text-sm">
            <p className="font-semibold">{app.vehicle}</p>
            <p className="mt-0.5 text-leaf">
              {app.vehicleYear} · {app.plate}
            </p>
            <p className="mt-2 inline-flex items-center gap-1 text-leaf">
              <Star className="size-4 fill-sun text-sun" aria-hidden="true" />
              4.9 rider rating
            </p>
          </div>
        </div>
        <ButtonLink to="/driver/earnings" variant="sun" className="mt-6">
          See all earnings
        </ButtonLink>
      </section>

      <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <Card aria-labelledby="recent-h">
          <h2 id="recent-h" className="text-lg font-semibold text-deep">
            Latest trips
          </h2>
          {trips.length === 0 ? (
            <p className="mt-4 text-slate">Your trips will appear here as soon as you complete one in the driver app.</p>
          ) : (
            <ul className="mt-3 divide-y divide-green-100">
              {trips.slice(0, 5).map((t) => (
                <li key={t.id} className="flex items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">
                      {t.pickup} → {t.dropoff}
                    </p>
                    <p className="text-sm text-slate">
                      {time(t.startedAt)}
                      {t.distanceKm !== null ? ` · ${t.distanceKm} km` : ''}
                    </p>
                  </div>
                  {t.status === 'completed' ? (
                    <span className="shrink-0 font-semibold text-deep">{formatRand(tripNetCents(t))}</span>
                  ) : (
                    <span className="shrink-0 rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold text-amber-900">Cancelled</span>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-sm text-slate">
            {completed.length} completed trips · {Math.round(km)} km in the last 8 weeks
          </p>
        </Card>

        <Card aria-labelledby="health-h">
          <h2 id="health-h" className="text-lg font-semibold text-deep">
            Your account
          </h2>
          <ul className="mt-4 space-y-4">
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
              <span className="leading-[1.5]">
                <Link to="/driver/documents" className="font-semibold text-deep hover:underline">
                  Documents
                </Link>
                <span className="block text-sm text-slate">{accepted} accepted, none missing</span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              {bank ? (
                <Landmark className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
              ) : (
                <Circle className="mt-0.5 size-5 shrink-0 text-amber-500" aria-hidden="true" />
              )}
              <span className="leading-[1.5]">
                <Link to="/driver/profile" className="font-semibold text-deep hover:underline">
                  Payout account
                </Link>
                <span className="block text-sm text-slate">
                  {bank ? `${bank.bankName} ${maskAccount(bank.accountNumber)}` : 'Add your bank details to get paid'}
                </span>
              </span>
            </li>
            <li className="flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 size-5 shrink-0 text-green-600" aria-hidden="true" />
              <span className="leading-[1.5]">
                <span className="font-semibold text-deep">Approved to drive</span>
                <span className="block text-sm text-slate">
                  Since {new Intl.DateTimeFormat('en-ZA', { dateStyle: 'long' }).format(new Date(app.reviewedAt ?? app.updatedAt))}
                </span>
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  )
}

export default function Overview() {
  const { api, session } = usePortal()
  const result = useLoad(async () => {
    const [app, docs] = await Promise.all([api.getMyApplication(), api.listMyDocuments()])
    const active = app?.status === 'approved'
    const [trips, bank] = active
      ? await Promise.all([api.listMyTrips(new Date(weekStart(new Date()).getTime() - 7 * 7 * 86_400_000)), api.getMyBankDetails()])
      : [[] as Trip[], null as BankDetails | null]
    return { app, docs, trips, bank }
  }, [api])

  return (
    <>
      <PageTitle
        title={`Welcome${session.fullName ? `, ${session.fullName}` : ''}`}
        intro="Your week at a glance, and where your account with Vuka Ride stands."
      />
      {session.suspendedReason !== null && session.suspendedReason !== undefined && (
        <div className="mt-6 max-w-3xl">
          <Notice tone="bad" title="Your driver account is suspended">
            {session.suspendedReason ? `Reason: ${session.suspendedReason}. ` : ''}Contact the driver team from the Help page if you think
            this is a mistake.
          </Notice>
        </div>
      )}
      <Loaded result={result}>
        {({ app, docs, trips, bank }) => {
          if (app?.status === 'approved') return <ActiveDashboard app={app} docs={docs} trips={trips} bank={bank} />
          const missing = missingRequiredDocs(docs)
          const steps = [
            { done: detailsComplete(app), label: 'Your details and vehicle', to: '/driver/application' },
            {
              done: missing.length === 0,
              label: `Required documents (${DOC_KINDS.filter((k) => DOC_INFO[k].required).length - missing.length} of ${DOC_KINDS.filter((k) => DOC_INFO[k].required).length})`,
              to: '/driver/documents',
            },
            {
              done: Boolean(app && app.status !== 'draft' && app.status !== 'needs_info'),
              label: 'Send for review',
              to: '/driver/application',
            },
          ]
          return (
            <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_1fr]">
              <Card aria-labelledby="status-title">
                <h2 id="status-title" className="text-lg font-semibold text-deep">
                  Application status
                </h2>
                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <StatusBadge status={app?.status ?? 'draft'} />
                  {app?.submittedAt && <span className="text-sm text-slate">Sent {formatDate(app.submittedAt)}</span>}
                </div>
                <p className="mt-4 leading-[1.7] text-slate">
                  {app ? STATUS_HELP[app.status] : 'Start by adding your details and uploading your documents.'}
                </p>
                {app?.reviewNote && (
                  <div className="mt-4">
                    <Notice tone={app.status === 'rejected' ? 'bad' : 'warn'} title="Note from the Vuka Ride team">
                      {app.reviewNote}
                    </Notice>
                  </div>
                )}
                {isEditable(app?.status) && (
                  <ButtonLink to="/driver/application" variant="green" className="mt-6">
                    {app ? 'Continue your application' : 'Start your application'}
                  </ButtonLink>
                )}
              </Card>

              <Card aria-labelledby="steps-title">
                <h2 id="steps-title" className="text-lg font-semibold text-deep">
                  Your checklist
                </h2>
                <ol className="mt-4 space-y-3">
                  {steps.map((s) => (
                    <li key={s.label} className="flex items-start gap-3">
                      <span
                        className={`mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full ${s.done ? 'bg-green-600 text-white' : 'border-2 border-green-300 text-green-300'}`}
                      >
                        {s.done ? (
                          <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                        ) : (
                          <Circle className="size-3" aria-hidden="true" />
                        )}
                      </span>
                      <span className="leading-[1.6]">
                        <Link to={s.to} className="font-semibold text-deep underline-offset-2 hover:underline">
                          {s.label}
                        </Link>
                        <span className="sr-only">{s.done ? ' (done)' : ' (to do)'}</span>
                      </span>
                    </li>
                  ))}
                </ol>
              </Card>
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
