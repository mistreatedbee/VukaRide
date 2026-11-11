import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'

import { usePortal } from '../auth'
import { INBOX_PAGE, SUBMISSION_KIND_LABEL, SUBMISSION_STATUS_LABEL, type Submission } from '../types'
import { Card, formatDate, Loaded, Pill, PageTitle, useLoad } from '../ui'

const KINDS = Object.keys(SUBMISSION_KIND_LABEL) as Submission['kind'][]
const STATUSES = Object.keys(SUBMISSION_STATUS_LABEL) as Submission['status'][]

function Item({ s, onChanged }: { s: Submission; onChanged: () => void }) {
  const { api } = usePortal()
  const sid = `status-${s.id}`
  return (
    <li className="border-t border-green-100 py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="font-semibold text-deep">
          {SUBMISSION_KIND_LABEL[s.kind]} <span className="ml-2 text-sm font-normal text-slate">{formatDate(s.createdAt)}</span>
        </p>
        <div className="flex items-center gap-2">
          <Pill tone={s.status === 'new' ? 'warn' : s.status === 'done' ? 'good' : 'neutral'}>{SUBMISSION_STATUS_LABEL[s.status]}</Pill>
          <label htmlFor={sid} className="sr-only">
            Change status
          </label>
          <select
            id={sid}
            value={s.status}
            onChange={(e) => void api.setSubmissionStatus(s.id, e.target.value as Submission['status']).then(onChanged)}
            className="min-h-11 rounded-xl border border-green-300 bg-white px-3 text-[15px]"
          >
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {SUBMISSION_STATUS_LABEL[st]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <dl className="mt-3 grid gap-x-6 gap-y-2 text-[15px] sm:grid-cols-2">
        {Object.entries(s.payload)
          .filter(([, v]) => v !== '' && v !== null && v !== undefined)
          .map(([k, v]) => (
            <div key={k} className={k === 'message' || k === 'reason' ? 'sm:col-span-2' : ''}>
              <dt className="text-sm text-slate">{k}</dt>
              <dd className="font-medium break-words whitespace-pre-wrap text-ink">{String(v)}</dd>
            </div>
          ))}
      </dl>
    </li>
  )
}

export default function Inbox() {
  const { api } = usePortal()
  const [params, setParams] = useSearchParams()
  const kind = params.get('kind') as Submission['kind'] | null
  const status = params.get('status') as Submission['status'] | null
  const [pages, setPages] = useState(1)
  const result = useLoad(
    () => api.listSubmissions({ kind: kind ?? undefined, status: status ?? undefined, offset: 0, limit: INBOX_PAGE * pages }),
    [api, kind, status, pages]
  )
  const set = (key: string, value: string) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    setParams(next)
    setPages(1)
  }
  const selectCls = 'mt-1 block min-h-11 rounded-xl border border-green-300 bg-white px-3 text-[15px]'

  return (
    <>
      <PageTitle
        title="Website inbox"
        intro="Everything sent through the website forms. Personal information: handle it as described in the Privacy Policy."
      />
      <div className="mt-6 flex flex-wrap gap-4">
        <div>
          <label htmlFor="f-kind" className="text-sm font-semibold">
            Type
          </label>
          <select id="f-kind" value={kind ?? ''} onChange={(e) => set('kind', e.target.value)} className={selectCls}>
            <option value="">All types</option>
            {KINDS.map((k) => (
              <option key={k} value={k}>
                {SUBMISSION_KIND_LABEL[k]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="f-status" className="text-sm font-semibold">
            Status
          </label>
          <select id="f-status" value={status ?? ''} onChange={(e) => set('status', e.target.value)} className={selectCls}>
            <option value="">All statuses</option>
            {STATUSES.map((st) => (
              <option key={st} value={st}>
                {SUBMISSION_STATUS_LABEL[st]}
              </option>
            ))}
          </select>
        </div>
      </div>
      <Loaded result={result}>
        {({ items, hasMore }) => (
          <Card className="mt-6">
            {items.length === 0 ? (
              <p className="text-slate">Nothing here.</p>
            ) : (
              <ul>
                {items.map((s) => (
                  <Item key={s.id} s={s} onChanged={result.reload} />
                ))}
              </ul>
            )}
            {hasMore && (
              <div className="mt-5 border-t border-green-100 pt-5">
                <button
                  type="button"
                  onClick={() => setPages((p) => p + 1)}
                  className="min-h-11 rounded-full border border-green-600 px-5 text-[15px] font-semibold text-green-700 hover:bg-green-50"
                >
                  Show more
                </button>
              </div>
            )}
          </Card>
        )}
      </Loaded>
    </>
  )
}
