import { ArrowDownRight, ArrowUpRight, Car, CircleDollarSign, Route, UsersRound, type LucideIcon } from 'lucide-react'
import { Link } from 'react-router-dom'

import { usePortal } from '../auth'
import {
  formatRand,
  STATUS_LABEL,
  type AdminStats,
  type ApplicationStatus,
  type ApplicationSummary,
  type AuditRow,
  type OpsSnapshot,
} from '../types'
import { Card, Loaded, PageTitle, Pill, StatusBadge, useLoad } from '../ui'

const PIPELINE: { status: ApplicationStatus; bar: string }[] = [
  { status: 'submitted', bar: 'bg-sky-500' },
  { status: 'in_review', bar: 'bg-amber-500' },
  { status: 'needs_info', bar: 'bg-orange-500' },
  { status: 'approved', bar: 'bg-green-600' },
  { status: 'rejected', bar: 'bg-red-500' },
]

const today = () => new Intl.DateTimeFormat('en-ZA', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date())
const shortDay = (iso: string) => new Intl.DateTimeFormat('en-ZA', { weekday: 'short' }).format(new Date(`${iso}T12:00:00`))
const num = (n: number) => new Intl.NumberFormat('en-ZA').format(n)
const ago = (iso: string) => {
  const mins = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60_000))
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.round(mins / 60)
  if (hrs < 24) return `${hrs} h ago`
  const days = Math.round(hrs / 24)
  return `${days} d ago`
}
const describe = (action: string) => {
  const [area, what] = action.split('.')
  return `${(area ?? '').replace(/_/g, ' ').replace(/^./, (c) => c.toUpperCase())}: ${(what ?? '').replace(/_/g, ' ')}`
}

function Delta({ now, before }: { now: number; before: number }) {
  if (before <= 0) return null
  const pct = ((now - before) / before) * 100
  const up = pct >= 0
  const Icon = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${up ? 'bg-leaf text-deep' : 'bg-red-100 text-red-900'}`}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {Math.abs(pct).toFixed(1)}%<span className="sr-only"> {up ? 'up' : 'down'} on the week before</span>
    </span>
  )
}

function Kpi({ icon: Icon, label, value, children }: { icon: LucideIcon; label: string; value: string; children?: React.ReactNode }) {
  return (
    <Card as="div" className="!p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-slate">{label}</p>
        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-leaf text-deep">
          <Icon className="size-[18px]" aria-hidden="true" />
        </span>
      </div>
      <p className="mt-3 text-3xl font-bold tracking-tight text-ink">{value}</p>
      <div className="mt-2 flex min-h-6 items-center gap-2 text-sm text-slate">{children}</div>
    </Card>
  )
}

/** Bars for trips per day. Drawn in SVG; the same numbers are in a hidden table for screen readers. */
function TripsChart({ daily }: { daily: OpsSnapshot['daily'] }) {
  const max = Math.max(...daily.map((d) => d.trips), 1)
  const top = Math.ceil(max / 50) * 50
  const W = 640
  const H = 220
  const pad = { l: 36, r: 8, t: 12, b: 28 }
  const iw = W - pad.l - pad.r
  const ih = H - pad.t - pad.b
  const slot = iw / daily.length
  const ticks = [0, top / 2, top]
  return (
    <>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        role="img"
        aria-label={`Trips per day for the last ${daily.length} days, from ${daily[0]?.trips} to ${daily.at(-1)?.trips}`}
        className="h-auto w-full"
      >
        {ticks.map((t) => {
          const y = pad.t + ih - (t / top) * ih
          return (
            <g key={t}>
              <line x1={pad.l} x2={W - pad.r} y1={y} y2={y} stroke="#d3ebdc" strokeWidth="1" />
              <text x={pad.l - 8} y={y + 4} textAnchor="end" fontSize="11" fill="#4b5563">
                {t}
              </text>
            </g>
          )
        })}
        {daily.map((d, i) => {
          const h = (d.trips / top) * ih
          const x = pad.l + i * slot + slot * 0.18
          const last = i === daily.length - 1
          return (
            <g key={d.date}>
              <rect x={x} y={pad.t + ih - h} width={slot * 0.64} height={h} rx="4" fill={last ? '#ffb300' : '#097235'} />
              <text x={x + slot * 0.32} y={H - 8} textAnchor="middle" fontSize="11" fill="#4b5563">
                {shortDay(d.date)}
              </text>
            </g>
          )
        })}
      </svg>
      <table className="sr-only">
        <caption>Trips per day</caption>
        <thead>
          <tr>
            <th scope="col">Day</th>
            <th scope="col">Trips</th>
          </tr>
        </thead>
        <tbody>
          {daily.map((d) => (
            <tr key={d.date}>
              <th scope="row">{d.date}</th>
              <td>{d.trips}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  )
}

function Pipeline({ stats }: { stats: AdminStats }) {
  const total = PIPELINE.reduce((n, p) => n + stats.applicationsByStatus[p.status], 0)
  return (
    <Card aria-labelledby="pipe-h">
      <div className="flex items-baseline justify-between gap-3">
        <h2 id="pipe-h" className="text-lg font-semibold text-deep">
          Driver pipeline
        </h2>
        <span className="text-sm text-slate">{total} sent in total</span>
      </div>
      <div className="mt-4 flex h-3 overflow-hidden rounded-full bg-mist" aria-hidden="true">
        {PIPELINE.map((p) => {
          const n = stats.applicationsByStatus[p.status]
          return n ? <div key={p.status} className={p.bar} style={{ width: `${(n / Math.max(total, 1)) * 100}%` }} /> : null
        })}
      </div>
      <ul className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {PIPELINE.map((p) => (
          <li key={p.status}>
            <Link
              to={`/admin/applications?status=${p.status}`}
              className="block rounded-2xl border border-green-100 p-3 hover:border-green-300 hover:bg-green-50"
            >
              <span className="flex items-center gap-2 text-xs font-semibold text-slate">
                <span className={`size-2.5 rounded-full ${p.bar}`} aria-hidden="true" />
                {STATUS_LABEL[p.status]}
              </span>
              <span className="mt-1 block text-2xl font-bold text-ink">{stats.applicationsByStatus[p.status]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </Card>
  )
}

export default function Overview() {
  const { api, session } = usePortal()
  const result = useLoad(async () => {
    const [stats, ops, apps, audit] = await Promise.all([
      api.getAdminStats(),
      api.getOpsSnapshot(),
      api.listApplications(),
      api.listAudit({ offset: 0, limit: 6 }),
    ])
    return { stats, ops, apps, audit: audit.items }
  }, [api])
  const first = (session.fullName || '').split(' ')[0]

  return (
    <>
      <PageTitle title="Overview" intro={`${today()}${first ? ` · Good to see you, ${first}.` : ''}`} />
      <Loaded result={result}>
        {({ stats, ops, apps, audit }: { stats: AdminStats; ops: OpsSnapshot | null; apps: ApplicationSummary[]; audit: AuditRow[] }) => {
          const waiting = apps.filter((a) => a.status === 'submitted' || a.status === 'in_review').slice(0, 5)
          const attention = stats.applicationsByStatus.submitted + stats.newDeletionRequests + stats.newSubmissions
          return (
            <div className="mt-8 space-y-6">
              {attention > 0 && (
                <Card as="div" className="flex flex-wrap items-center justify-between gap-4 !border-sun/40 !bg-sun/10 !p-4 sm:!px-6">
                  <p className="font-semibold text-ink">
                    {stats.applicationsByStatus.submitted > 0 &&
                      `${stats.applicationsByStatus.submitted} new application${stats.applicationsByStatus.submitted === 1 ? '' : 's'} to review`}
                    {stats.applicationsByStatus.submitted > 0 && stats.newSubmissions > 0 && ' · '}
                    {stats.newSubmissions > 0 && `${stats.newSubmissions} new message${stats.newSubmissions === 1 ? '' : 's'}`}
                    {stats.newDeletionRequests > 0 &&
                      ` · ${stats.newDeletionRequests} deletion request${stats.newDeletionRequests === 1 ? '' : 's'} (deal with these first)`}
                  </p>
                  <Link
                    to={stats.applicationsByStatus.submitted > 0 ? '/admin/applications?status=submitted' : '/admin/inbox?status=new'}
                    className="inline-flex min-h-11 items-center rounded-full bg-deep px-5 text-sm font-semibold text-white hover:bg-green-800"
                  >
                    Start now
                  </Link>
                </Card>
              )}

              {ops ? (
                <>
                  <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <Kpi icon={Route} label="Trips, last 7 days" value={num(ops.trips7d)}>
                      <Delta now={ops.trips7d} before={ops.tripsPrev7d} />
                      <span>vs the week before</span>
                    </Kpi>
                    <Kpi icon={CircleDollarSign} label="Fares, last 7 days" value={formatRand(ops.revenue7dCents)}>
                      <Delta now={ops.revenue7dCents} before={ops.revenuePrev7dCents} />
                      <span>vs the week before</span>
                    </Kpi>
                    <Kpi icon={Car} label="Drivers online now" value={num(ops.onlineDrivers)}>
                      <span>of {num(ops.activeDrivers)} active drivers</span>
                    </Kpi>
                    <Kpi icon={UsersRound} label="Riders" value={num(ops.riders)}>
                      <span className="font-semibold text-green-600">+{num(ops.newRiders7d)}</span>
                      <span>this week</span>
                    </Kpi>
                  </div>

                  <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)]">
                    <Card aria-labelledby="trips-h">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h2 id="trips-h" className="text-lg font-semibold text-deep">
                          Trips per day
                        </h2>
                        {ops.sample && <Pill tone="warn">Sample figures</Pill>}
                      </div>
                      <p className="mt-1 text-sm text-slate">Last 14 days. Today is in yellow.</p>
                      <div className="mt-4">
                        <TripsChart daily={ops.daily} />
                      </div>
                    </Card>
                    <Card aria-labelledby="cities-h">
                      <h2 id="cities-h" className="text-lg font-semibold text-deep">
                        Busiest cities
                      </h2>
                      <p className="mt-1 text-sm text-slate">Trips in the last 7 days.</p>
                      <ul className="mt-5 space-y-4">
                        {ops.cities.map((c) => (
                          <li key={c.name}>
                            <div className="flex justify-between text-sm font-semibold">
                              <span className="text-ink">{c.name}</span>
                              <span className="text-slate">{num(c.trips)}</span>
                            </div>
                            <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-mist" aria-hidden="true">
                              <div
                                className="h-full rounded-full bg-green-600"
                                style={{ width: `${(c.trips / (ops.cities[0]?.trips || 1)) * 100}%` }}
                              />
                            </div>
                          </li>
                        ))}
                      </ul>
                    </Card>
                  </div>
                </>
              ) : (
                <Card>
                  <h2 className="text-lg font-semibold text-deep">Trips, riders and revenue</h2>
                  <p className="mt-2 max-w-2xl leading-[1.7] text-slate">
                    These figures will appear here once the mobile app’s trip data is connected to this portal.
                  </p>
                </Card>
              )}

              <Pipeline stats={stats} />

              <div className="grid grid-cols-[minmax(0,1fr)] gap-6 lg:grid-cols-2">
                <Card aria-labelledby="wait-h">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 id="wait-h" className="text-lg font-semibold text-deep">
                      Waiting for review
                    </h2>
                    <Link to="/admin/applications" className="text-sm font-semibold text-green-600 underline underline-offset-2">
                      See all<span className="sr-only"> waiting drivers</span>
                    </Link>
                  </div>
                  {waiting.length === 0 ? (
                    <p className="mt-4 text-slate">Nobody is waiting. Nice work.</p>
                  ) : (
                    <ul className="mt-3 divide-y divide-green-100">
                      {waiting.map((a) => (
                        <li key={a.id}>
                          <Link
                            to={`/admin/applications/${a.id}`}
                            className="flex min-h-14 items-center justify-between gap-3 py-2 hover:text-deep"
                          >
                            <span className="min-w-0">
                              <span className="block truncate font-semibold text-ink">{a.fullName || a.email}</span>
                              <span className="block truncate text-sm text-slate">{[a.city, a.vehicle].filter(Boolean).join(' · ')}</span>
                            </span>
                            <span className="flex shrink-0 flex-col items-end gap-1">
                              <StatusBadge status={a.status} />
                              {a.submittedAt && <span className="text-xs text-slate">{ago(a.submittedAt)}</span>}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </Card>

                <Card aria-labelledby="act-h">
                  <div className="flex items-baseline justify-between gap-3">
                    <h2 id="act-h" className="text-lg font-semibold text-deep">
                      Recent activity
                    </h2>
                    <Link to="/admin/audit" className="text-sm font-semibold text-green-600 underline underline-offset-2">
                      See all<span className="sr-only"> activity</span>
                    </Link>
                  </div>
                  {audit.length === 0 ? (
                    <p className="mt-4 text-slate">Nothing has happened yet.</p>
                  ) : (
                    <ol className="mt-4 space-y-4">
                      {audit.map((r) => (
                        <li key={r.id} className="flex gap-3">
                          <span className="mt-1.5 size-2.5 shrink-0 rounded-full bg-green-600" aria-hidden="true" />
                          <div className="min-w-0">
                            <p className="font-semibold text-ink">{describe(r.action)}</p>
                            <p className="truncate text-sm text-slate">
                              {r.actor} · {ago(r.createdAt)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </Card>
              </div>
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
