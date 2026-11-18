import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'

import { usePortal } from '../auth'
import { APPLICATION_STATUSES, STATUS_LABEL, type ApplicationStatus } from '../types'
import { Avatar, Card, formatDate, Loaded, PageTitle, SearchBox, StatusBadge, useLoad } from '../ui'

const FILTERS: ('all' | ApplicationStatus)[] = ['all', ...APPLICATION_STATUSES.filter((s) => s !== 'draft')]

export default function Applications() {
  const { api } = usePortal()
  const [params, setParams] = useSearchParams()
  const filter = (params.get('status') as ApplicationStatus | null) ?? 'all'
  const [q, setQ] = useState('')
  const result = useLoad(() => api.listApplications(), [api])

  return (
    <>
      <PageTitle title="Driver applications" intro="Applications that drivers have sent for review. Drafts are not shown." />
      <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
        <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
          {FILTERS.map((f) => (
            <button
              key={f}
              type="button"
              aria-pressed={filter === f}
              onClick={() => setParams(f === 'all' ? {} : { status: f })}
              className={`min-h-11 rounded-full px-4 text-sm font-semibold ${filter === f ? 'bg-deep text-white' : 'bg-white text-deep ring-1 ring-green-300 hover:bg-green-50'}`}
            >
              {f === 'all' ? 'All' : STATUS_LABEL[f]}
            </button>
          ))}
        </div>
        <SearchBox value={q} onChange={setQ} label="Search applications" placeholder="Search name, city or plate" />
      </div>
      <Loaded result={result}>
        {(all) => {
          const needle = q.trim().toLowerCase()
          const rows = all.filter(
            (a) =>
              (filter === 'all' || a.status === filter) &&
              (!needle || [a.fullName, a.email, a.city, a.vehicle, a.plate].some((v) => v.toLowerCase().includes(needle)))
          )
          if (rows.length === 0) {
            return (
              <Card className="mt-6">
                <p className="text-slate">No applications match.</p>
              </Card>
            )
          }
          return (
            <Card className="mt-6 overflow-x-auto !p-0">
              <table className="w-full min-w-[40rem] text-left text-[15px]">
                <caption className="sr-only">Driver applications</caption>
                <thead className="bg-mist text-sm text-slate">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Driver
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      City
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Vehicle
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Documents
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Status
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Sent
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((a) => (
                    <tr key={a.id} className="border-t border-green-100">
                      <th scope="row" className="px-5 py-3 font-semibold">
                        <div className="flex items-center gap-3">
                          <Avatar name={a.fullName || a.email} />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/applications/${a.id}`}
                              className="inline-flex min-h-6 items-center text-deep underline underline-offset-2"
                            >
                              {a.fullName || a.email || 'Unnamed'}
                            </Link>
                            <p className="truncate text-sm font-normal text-slate">{a.email}</p>
                          </div>
                        </div>
                      </th>
                      <td className="px-5 py-3">{a.city === 'Other (tell us where)' ? a.otherCity : a.city}</td>
                      <td className="px-5 py-3">{[a.vehicle, a.vehicleYear].filter(Boolean).join(', ')}</td>
                      <td className="px-5 py-3">{a.documentCount}</td>
                      <td className="px-5 py-3">
                        <StatusBadge status={a.status} />
                      </td>
                      <td className="px-5 py-3 whitespace-nowrap text-slate">{formatDate(a.submittedAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          )
        }}
      </Loaded>
    </>
  )
}
