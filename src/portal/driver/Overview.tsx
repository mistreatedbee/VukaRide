import { Check, Circle } from 'lucide-react'
import { Link } from 'react-router-dom'

import { ButtonLink } from '../../components/ui'
import { usePortal } from '../auth'
import { DOC_INFO, DOC_KINDS, isEditable, missingRequiredDocs, STATUS_HELP, type Application } from '../types'
import { Card, formatDate, Loaded, Notice, PageTitle, StatusBadge, useLoad } from '../ui'

function detailsComplete(a: Application | null) {
  return Boolean(
    a && a.fullName && a.mobile && a.email && a.city && a.vehicle && a.vehicleYear && a.plate && a.licenceConfirmed && a.termsAccepted
  )
}

export default function Overview() {
  const { api, session } = usePortal()
  const result = useLoad(async () => ({ app: await api.getMyApplication(), docs: await api.listMyDocuments() }), [api])

  return (
    <>
      <PageTitle
        title={`Welcome${session.fullName ? `, ${session.fullName}` : ''}`}
        intro="Here is where your application to drive with Vuka Ride stands."
      />
      <Loaded result={result}>
        {({ app, docs }) => {
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
                {app?.status === 'approved' && (
                  <p className="mt-6 leading-[1.7] text-slate">
                    Next steps for getting on the road will appear here once the driver app is linked. [Add the onboarding steps when the
                    app is ready.]
                  </p>
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
