import { ArrowLeft, ExternalLink } from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'

import { Button } from '../../components/ui'
import { usePortal } from '../auth'
import {
  ACCOUNT_TYPES,
  DOC_INFO,
  DOC_KINDS,
  DOC_STATUS_LABEL,
  missingRequiredDocs,
  type Application,
  type BankDetails,
  type DocumentRow,
  type Suspension,
} from '../types'
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
  const [info, setInfo] = useState<string | null>(null)
  const decide = async (status: 'in_review' | 'needs_info' | 'approved' | 'rejected') => {
    setBusy(true)
    setError(null)
    setInfo(null)
    try {
      await api.reviewApplication(app.id, status, note)
      setNote('')
      onChanged()
      if (status !== 'in_review') {
        const r = await api.notifyDecision(app.id)
        setInfo(r.sent ? 'Decision saved and the driver was emailed.' : `Decision saved. ${r.reason ?? 'The driver was not emailed.'}`)
      } else setInfo('Review started.')
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
      {info && (
        <div className="mt-3">
          <Notice tone="good">{info}</Notice>
        </div>
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

function BankPanel({ app }: { app: Application }) {
  const { api } = usePortal()
  const [state, setState] = useState<'hidden' | 'loading' | 'shown'>('hidden')
  const [details, setDetails] = useState<BankDetails | null>(null)
  const [error, setError] = useState<string | null>(null)
  const reveal = async () => {
    setState('loading')
    setError(null)
    try {
      setDetails(await api.revealBankDetails(app.userId))
      setState('shown')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setState('hidden')
    }
  }
  return (
    <Card className="mt-6" aria-labelledby="bank-h">
      <h2 id="bank-h" className="text-lg font-semibold text-deep">
        Bank details
      </h2>
      {state !== 'shown' ? (
        <>
          <p className="mt-2 max-w-2xl text-sm leading-[1.7] text-slate">
            Hidden by default. Opening them is written to the audit log with your name.
          </p>
          {error && (
            <p role="alert" className="mt-2 text-sm font-medium text-danger">
              {error}
            </p>
          )}
          <Button variant="deep" disabled={state === 'loading'} onClick={() => void reveal()} className="mt-4">
            {state === 'loading' ? 'Opening…' : 'Show bank details'}
          </Button>
        </>
      ) : details ? (
        <dl className="mt-4 grid gap-4 sm:grid-cols-2">
          <Field label="Name on account" value={details.accountHolder} />
          <Field label="Bank" value={details.bankName} />
          <Field label="Account type" value={ACCOUNT_TYPES[details.accountType]} />
          <Field label="Account number" value={details.accountNumber} />
          <Field label="Branch code" value={details.branchCode} />
          <Field label="Last changed" value={formatDate(details.updatedAt)} />
        </dl>
      ) : (
        <p className="mt-3 text-slate">This driver has not added bank details yet.</p>
      )}
    </Card>
  )
}

function SuspensionPanel({ app, suspension, onChanged }: { app: Application; suspension: Suspension | null; onChanged: () => void }) {
  const { api } = usePortal()
  const [reason, setReason] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const act = async (suspend: boolean) => {
    setBusy(true)
    setError(null)
    try {
      await api.setSuspension(app.userId, suspend, reason)
      setReason('')
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Card className="mt-6" aria-labelledby="susp-h">
      <h2 id="susp-h" className="text-lg font-semibold text-deep">
        Account status
      </h2>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        {suspension ? <Pill tone="bad">Suspended</Pill> : <Pill tone="good">Active</Pill>}
        {suspension && (
          <span className="text-sm text-slate">
            Since {formatDate(suspension.suspendedAt)}: “{suspension.reason}”
          </span>
        )}
      </div>
      <p className="mt-3 max-w-2xl text-sm leading-[1.7] text-slate">
        Suspending keeps all records and shows the driver a notice. It is logged. The driver app will use this flag once it is connected.
      </p>
      <label htmlFor="susp-reason" className="mt-4 block text-sm font-semibold">
        {suspension ? 'Note (optional)' : 'Reason (required, shown to the driver)'}
      </label>
      <input
        id="susp-reason"
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        className="mt-2 block min-h-12 w-full max-w-xl rounded-xl border border-green-300 px-4 focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
      <div className="mt-4">
        {suspension ? (
          <Button disabled={busy} onClick={() => void act(false)}>
            Reinstate driver
          </Button>
        ) : (
          <Button disabled={busy} variant="deep" className="!bg-danger" onClick={() => void act(true)}>
            Suspend driver
          </Button>
        )}
      </div>
    </Card>
  )
}

function EraseDriver({ app }: { app: Application }) {
  const { api } = usePortal()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [typed, setTyped] = useState('')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const go = async () => {
    setBusy(true)
    setError(null)
    try {
      await api.eraseDriver(app.userId)
      navigate('/admin/applications')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
      setBusy(false)
    }
  }
  return (
    <Card className="mt-6" aria-labelledby="erase-h">
      <h2 id="erase-h" className="text-lg font-semibold text-deep">
        Erase this driver’s data
      </h2>
      <p className="mt-2 max-w-2xl leading-[1.7] text-slate">
        For account deletion requests. This permanently deletes the driver’s sign-in account, application, document records and uploaded
        files. It cannot be undone, and the action is written to the audit log. Check the Privacy Policy for anything we must keep by law
        first. [Confirm the records we must retain.]
      </p>
      {!open ? (
        <Button variant="deep" onClick={() => setOpen(true)} className="mt-4 !bg-danger">
          Erase data…
        </Button>
      ) : (
        <div className="mt-4 max-w-md">
          <label htmlFor="erase-confirm" className="block text-sm font-semibold">
            Type ERASE to confirm
          </label>
          <input
            id="erase-confirm"
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoComplete="off"
            className="mt-2 block min-h-12 w-full rounded-xl border border-green-300 px-4 focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15"
          />
          {error && (
            <div className="mt-3">
              <Notice tone="bad">{error}</Notice>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Button variant="deep" disabled={busy || typed !== 'ERASE'} onClick={() => void go()} className="!bg-danger">
              {busy ? 'Erasing…' : 'Erase permanently'}
            </Button>
            <Button
              variant="outline-light"
              onClick={() => {
                setOpen(false)
                setTyped('')
                setError(null)
              }}
              className="border-green-600 text-green-700 hover:bg-green-50"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
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
          const { application: a, documents, suspension } = detail
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
              {a.status === 'approved' && <BankPanel app={a} />}
              {(a.status === 'approved' || suspension) && <SuspensionPanel app={a} suspension={suspension} onChanged={result.reload} />}
              <EraseDriver app={a} />
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
