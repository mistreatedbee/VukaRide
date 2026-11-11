import { Link } from 'react-router-dom'

import { usePortal } from '../auth'
import { Card, formatDate, Loaded, PageTitle, Pill, useLoad } from '../ui'

export default function Drivers() {
  const { api } = usePortal()
  const result = useLoad(() => api.listDrivers(), [api])
  return (
    <>
      <PageTitle title="Drivers" intro="Approved drivers, and anyone who has been suspended. Open a driver to suspend or reinstate them." />
      <Loaded result={result}>
        {(rows) =>
          rows.length === 0 ? (
            <Card className="mt-6">
              <p className="text-slate">No approved drivers yet.</p>
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
                        <Link
                          to={`/admin/applications/${d.applicationId}`}
                          className="inline-flex min-h-11 items-center text-deep underline underline-offset-2"
                        >
                          {d.fullName || d.email || 'Unnamed'}
                        </Link>
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
        }
      </Loaded>
    </>
  )
}
