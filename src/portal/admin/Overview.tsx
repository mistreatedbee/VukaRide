import { Link } from 'react-router-dom'

import { usePortal } from '../auth'
import { STATUS_LABEL, type ApplicationStatus } from '../types'
import { Card, Loaded, PageTitle, useLoad } from '../ui'

const ORDER: ApplicationStatus[] = ['submitted', 'in_review', 'needs_info', 'approved', 'rejected']

function Stat({ to, label, value, urgent }: { to: string; label: string; value: number; urgent?: boolean }) {
  return (
    <Link
      to={to}
      className="block rounded-[24px] border border-green-100 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(4,55,31,0.4)] hover:border-green-300"
    >
      <p className="text-sm font-semibold text-slate">{label}</p>
      <p className={`mt-2 text-4xl font-bold tracking-tight ${urgent && value > 0 ? 'text-deep' : 'text-ink'}`}>{value}</p>
    </Link>
  )
}

export default function Overview() {
  const { api } = usePortal()
  const result = useLoad(() => api.getAdminStats(), [api])
  return (
    <>
      <PageTitle title="Overview" intro="What needs attention today." />
      <Loaded result={result}>
        {(s) => (
          <div className="mt-8 space-y-8">
            <section aria-labelledby="apps-h">
              <h2 id="apps-h" className="text-lg font-semibold text-deep">
                Driver applications
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
                {ORDER.map((st) => (
                  <Stat
                    key={st}
                    to={`/admin/applications?status=${st}`}
                    label={STATUS_LABEL[st]}
                    value={s.applicationsByStatus[st]}
                    urgent={st === 'submitted'}
                  />
                ))}
              </div>
            </section>
            <section aria-labelledby="inbox-h">
              <h2 id="inbox-h" className="text-lg font-semibold text-deep">
                Website inbox
              </h2>
              <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-5">
                <Stat to="/admin/inbox?status=new" label="New messages" value={s.newSubmissions} urgent />
                <Stat to="/admin/inbox?kind=delete-account&status=new" label="Deletion requests" value={s.newDeletionRequests} urgent />
              </div>
              {s.newDeletionRequests > 0 && (
                <p className="mt-4 max-w-2xl text-sm leading-[1.7] text-slate">
                  Account deletion requests have a deadline in the Privacy Policy ([confirm the days]). Deal with them first.
                </p>
              )}
            </section>
            <Card>
              <h2 className="text-lg font-semibold text-deep">Coming with the app</h2>
              <p className="mt-2 max-w-2xl leading-[1.7] text-slate">
                Trips, riders, fares, payouts and support tickets will be added here once the mobile app’s code and data model are in the
                project.
              </p>
            </Card>
          </div>
        )}
      </Loaded>
    </>
  )
}
