import { useState } from 'react'
import { Link } from 'react-router-dom'

import { usePortal } from '../auth'
import { Avatar, Card, formatDate, Loaded, PageTitle, Pill, SearchBox, useLoad } from '../ui'

export default function Drivers() {
  const { api } = usePortal()
  const [q, setQ] = useState('')
  const result = useLoad(() => api.listDrivers(), [api])
  return (
    <>
      <PageTitle title="Drivers" intro="Approved drivers, and anyone who has been suspended. Open a driver to suspend or reinstate them." />
      <div className="mt-6">
        <SearchBox value={q} onChange={setQ} label="Search drivers" placeholder="Search name, city or vehicle" />
      </div>
      <Loaded result={result}>
        {(all) => {
          const needle = q.trim().toLowerCase()
          const rows = needle
            ? all.filter((d) => [d.fullName, d.email, d.city, d.vehicle].some((v) => v.toLowerCase().includes(needle)))
            : all
          return rows.length === 0 ? (
            <Card className="mt-6">
              <p className="text-slate">{all.length === 0 ? 'No approved drivers yet.' : 'No drivers match.'}</p>
            </Card>
          ) : (
            <Card className="mt-6 overflow-x-auto !p-0">
              <table className="w-full min-w-[40rem] text-left text-[15px]">
                <caption className="sr-only">Approved drivers</caption>
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
                      Approved
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Account
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((d) => (
                    <tr key={d.userId} className="border-t border-green-100">
                      <th scope="row" className="px-5 py-3 font-semibold">
                        <div className="flex items-center gap-3">
                          <Avatar name={d.fullName || d.email} />
                          <div className="min-w-0">
                            <Link
                              to={`/admin/applications/${d.applicationId}`}
                              className="inline-flex min-h-6 items-center text-deep underline underline-offset-2"
                            >
                              {d.fullName || d.email || 'Unnamed'}
                            </Link>
                            <p className="truncate text-sm font-normal text-slate">{d.email}</p>
                          </div>
                        </div>
                      </th>
                      <td className="px-5 py-3">{d.city}</td>
                      <td className="px-5 py-3">{d.vehicle}</td>
                      <td className="px-5 py-3 whitespace-nowrap text-slate">{formatDate(d.approvedAt)}</td>
                      <td className="px-5 py-3">
                        {d.suspended ? <Pill tone="bad">Suspended</Pill> : <Pill tone="good">Active</Pill>}
                        {d.suspended && <span className="sr-only"> since {formatDate(d.suspended.suspendedAt)}</span>}
                      </td>
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
