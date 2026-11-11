import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

import { Button } from '../../components/ui'
import { usePortal } from '../auth'
import { DOC_INFO, DOC_KINDS, DOC_STATUS_LABEL, missingRequiredDocs, type Application, type DocumentRow } from '../types'
import { Card, formatDate, Loaded, Notice, PageTitle, Pill, StatusBadge, useLoad } from '../ui'

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="mt-0.5 font-medium break-words text-ink">{value || '—'}</dd>
    </div>
  )
}

function DocReview({ doc, onChanged }: { doc: DocumentRow; onChanged: () => void }) {
  const { api } = usePortal()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const act = async (status: 'accepted' | 'rejected') => {
    setBusy(true)
    setError(null)
    try {
      await api.reviewDocument(doc.id, status, note)
      setNote('')
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }
  const open = async () => {
    const url = await api.documentUrl(doc)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else setError('We could not open that file.')
  }
  const tone = doc.status === 'accepted' ? 'good' : doc.status === 'rejected' ? 'bad' : 'warn'
  const nid = `note-${doc.id}`
  return (
    <li className="border-t border-green-100 py-4 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="min-w-0 font-semibold text-deep">
          {DOC_INFO[doc.kind].label}
          <span className="ml-2 text-sm font-normal break-all text-slate">{doc.fileName}</span>
        </p>
        <Pill tone={tone}>{DOC_STATUS_LABEL[doc.status]}</Pill>
      </div>
      <div className="mt-3 flex flex-wrap items-end gap-3">
        <button
          type="button"
          onClick={() => void open()}
          className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-green-600 underline underline-offset-2"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Open<span className="sr-only"> {DOC_INFO[doc.kind].label}</span>
        </button>
        <div className="min-w-[12rem] flex-1">
          <label htmlFor={nid} className="sr-only">
            Note for {DOC_INFO[doc.kind].label} (required to reject)
          </label>
          <input
            id={nid}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Note (required to reject)"
            className="block min-h-11 w-full rounded-xl border border-green-300 px-3 text-[15px] focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
          />
        </div>
        <Button disabled={busy || doc.status === 'accepted'} onClick={() => void act('accepted')} className="!min-h-11 !px-4 text-[15px]">
          Accept
        </Button>
        <Button disabled={busy} onClick={() => void act('rejected')} variant="deep" className="!min-h-11 !px-4 text-[15px]">
          Reject
        </Button>
      </div>
      {doc.note && <p className="mt-2 text-sm text-slate">Note: {doc.note}</p>}
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </li>
  )
}

function Decision({ app, onChanged }: { app: Application; onChanged: () => void }) {
  const { api } = usePortal()
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const decide = async (status: 'in_review' | 'needs_info' | 'approved' | 'rejected') => {
    setBusy(true)
    setError(null)
    try {
      await api.reviewApplication(app.id, status, note)
      setNote('')
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card aria-labelledby="decision-h">
      <h2 id="decision-h" className="text-lg font-semibold text-deep">
        Decision
      </h2>
      <p className="mt-1 text-sm text-slate">
        The note is shown to the driver. It is required when asking for more information or rejecting.
      </p>
      <label htmlFor="decision-note" className="mt-4 block text-sm font-semibold">
        Note to the driver
      </label>
      <textarea
        id="decision-note"
        rows={3}
        value={note}
        onChange={(e) => setNote(e.target.value)}
        className="mt-2 block w-full rounded-xl border border-green-300 px-4 py-3 text-base focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="mt-4 flex flex-wrap gap-3">
        <Button disabled={busy || app.status === 'in_review'} onClick={() => void decide('in_review')} variant="deep">
          Start review
        </Button>
        <Button disabled={busy} onClick={() => void decide('needs_info')} variant="sun">
          Ask for more
        </Button>
        <Button disabled={busy || app.status === 'approved'} onClick={() => void decide('approved')}>
          Approve
        </Button>
        <Button disabled={busy} onClick={() => void decide('rejected')} variant="deep" className="!bg-danger">
          Reject
        </Button>
      </div>
    </Card>
  )
}

export default function ApplicationDetail() {
  const { id = '' } = useParams()
  const { api } = usePortal()
  const result = useLoad(() => api.getApplicationDetail(id), [api, id])

  return (
    <>
      <Link
        to="/admin/applications"
        className="inline-flex min-h-11 items-center gap-2 font-semibold text-green-600 underline underline-offset-2"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        All applications
      </Link>
      <Loaded result={result}>
        {(detail) => {
          if (!detail)
            return (
              <div className="mt-6">
                <Notice tone="bad" title="Application not found." />
              </div>
            )
          const { application: a, documents } = detail
          const missing = missingRequiredDocs(documents)
          const sorted = [...documents].sort((x, y) => DOC_KINDS.indexOf(x.kind) - DOC_KINDS.indexOf(y.kind))
          return (
            <div className="mt-4">
              <PageTitle
                title={a.fullName || a.email || 'Unnamed applicant'}
                actions={<StatusBadge status={a.status} />}
                intro={`Sent ${formatDate(a.submittedAt)}`}
              />
              <div className="mt-8 grid gap-6 lg:grid-cols-2">
                <Card aria-labelledby="details-h">
                  <h2 id="details-h" className="text-lg font-semibold text-deep">
                    Details
                  </h2>
                  <dl className="mt-4 grid gap-4 sm:grid-cols-2">
                    <Field label="Full name" value={a.fullName} />
                    <Field label="Mobile" value={a.mobile} />
                    <Field label="Email" value={a.email} />
                    <Field label="City" value={a.city === 'Other (tell us where)' ? a.otherCity : a.city} />
                    <Field label="Vehicle" value={[a.vehicle, a.vehicleYear].filter(Boolean).join(', ')} />
                    <Field label="Licence plate" value={a.plate} />
                    <Field label="Has a valid licence (self declared)" value={a.licenceConfirmed ? 'Yes' : 'No'} />
                    <Field label="Accepted Terms and Privacy" value={a.termsAccepted ? 'Yes' : 'No'} />
                  </dl>
                  {a.reviewNote && <p className="mt-4 text-sm text-slate">Last note: {a.reviewNote}</p>}
                </Card>
                <Decision app={a} onChanged={result.reload} />
              </div>
              <Card className="mt-6" aria-labelledby="docs-h">
                <h2 id="docs-h" className="text-lg font-semibold text-deep">
                  Documents
                </h2>
                {missing.length > 0 && (
                  <div className="mt-3">
                    <Notice tone="warn" title="Required documents missing">
                      {missing.map((k) => DOC_INFO[k].label).join(', ')}
                    </Notice>
                  </div>
                )}
                {sorted.length === 0 ? (
                  <p className="mt-3 text-slate">No documents uploaded.</p>
                ) : (
                  <ul className="mt-4">
                    {sorted.map((d) => (
                      <DocReview key={d.id} doc={d} onChanged={result.reload} />
                    ))}
                  </ul>
                )}
              </Card>
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
