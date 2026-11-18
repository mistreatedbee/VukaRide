import { Wallet } from 'lucide-react'

import { usePortal } from '../auth'
import { formatRand, tripNetCents, weeklyTotals, weekStart, type Trip } from '../types'
import { Card, Loaded, PageTitle, Pill, useLoad } from '../ui'

const WEEKS_BACK = 8
const day = (iso: string) => new Intl.DateTimeFormat('en-ZA', { day: 'numeric', month: 'short' }).format(new Date(iso))
const time = (iso: string) => new Intl.DateTimeFormat('en-ZA', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso))

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card>
      <p className="text-sm font-semibold text-slate">{label}</p>
      <p className="mt-2 text-3xl font-bold tracking-tight text-deep">{value}</p>
      {hint && <p className="mt-1 text-sm text-slate">{hint}</p>}
    </Card>
  )
}

export default function Earnings() {
  const { api } = usePortal()
  const result = useLoad(() => api.listMyTrips(new Date(weekStart(new Date()).getTime() - (WEEKS_BACK - 1) * 7 * 86_400_000)), [api])

  return (
    <>
      <PageTitle
        title="Earnings"
        intro="Your completed trips and what you earned, week by week. You keep the fare minus the Vuka Ride fee, plus any tips."
      />
      <Loaded result={result}>
        {(trips: Trip[]) => {
          const weeks = weeklyTotals(trips)
          const thisWeekStart = weekStart(new Date()).getTime()
          const thisWeek = weeks.find((w) => w.weekStart.getTime() === thisWeekStart)
          const total = weeks.reduce((n, w) => n + w.netCents, 0)

          if (trips.length === 0) {
            return (
              <Card className="mt-8 max-w-2xl">
                <div className="flex items-start gap-4">
                  <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-deep text-white">
                    <Wallet className="size-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h2 className="text-lg font-semibold text-deep">No trips yet</h2>
                    <p className="mt-2 leading-[1.7] text-slate">
                      Once you are approved and complete trips in the Vuka Ride driver app, they will show up here.
                    </p>
                  </div>
                </div>
              </Card>
            )
          }

          return (
            <>
              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <Stat label="This week" value={formatRand(thisWeek?.netCents ?? 0)} hint={`${thisWeek?.trips ?? 0} trips`} />
                <Stat label="Tips this week" value={formatRand(thisWeek?.tipCents ?? 0)} />
                <Stat
                  label={`Last ${WEEKS_BACK} weeks`}
                  value={formatRand(total)}
                  hint={`${weeks.reduce((n, w) => n + w.trips, 0)} trips`}
                />
              </div>

              <h2 className="mt-10 text-xl font-semibold text-deep">Weekly statements</h2>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-green-300/60 bg-white">
                <table className="w-full min-w-[420px] text-left text-sm">
                  <caption className="sr-only">Earnings by week</caption>
                  <thead className="bg-mist text-slate">
                    <tr>
                      <th scope="col" className="px-4 py-3 font-semibold">
                        Week starting
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        Trips
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        Tips
                      </th>
                      <th scope="col" className="px-4 py-3 text-right font-semibold">
                        Earned
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {weeks.map((w) => (
                      <tr key={w.weekStart.getTime()} className="border-t border-green-300/40">
                        <th scope="row" className="px-4 py-3 font-medium text-ink">
                          {day(w.weekStart.toISOString())}
                        </th>
                        <td className="px-4 py-3 text-right">{w.trips}</td>
                        <td className="px-4 py-3 text-right">{formatRand(w.tipCents)}</td>
                        <td className="px-4 py-3 text-right font-semibold text-deep">{formatRand(w.netCents)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h2 className="mt-10 text-xl font-semibold text-deep">Recent trips</h2>
              <ul className="mt-4 divide-y divide-green-300/40 rounded-2xl border border-green-300/60 bg-white">
                {trips.slice(0, 20).map((t) => (
                  <li key={t.id} className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
                    <div>
                      <p className="font-medium text-ink">
                        {t.pickup || 'Pickup'} → {t.dropoff || 'Drop-off'}
                      </p>
                      <p className="text-sm text-slate">
                        {day(t.startedAt)}, {time(t.startedAt)}
                        {t.distanceKm !== null ? ` · ${t.distanceKm} km` : ''}
                      </p>
                    </div>
                    {t.status === 'completed' ? (
                      <p className="font-semibold text-deep">{formatRand(tripNetCents(t))}</p>
                    ) : (
                      <Pill tone="warn">Cancelled</Pill>
                    )}
                  </li>
                ))}
              </ul>
              <p className="mt-4 text-sm text-slate">Amounts are in rand. Payouts go to the bank account on your Profile page.</p>
            </>
          )
        }}
      </Loaded>
    </>
  )
}
