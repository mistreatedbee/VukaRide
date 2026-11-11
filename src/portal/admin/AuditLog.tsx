import { useState } from 'react'

import { usePortal } from '../auth'
import { AUDIT_AREA_LABEL, AUDIT_PAGE, type AuditQuery } from '../types'
import { Card, formatDate, Loaded, PageTitle, useLoad } from '../ui'

const AREAS = Object.keys(AUDIT_AREA_LABEL) as NonNullable<AuditQuery['area']>[]

/** "application.needs_info" -> "Application: needs info" */
const describe = (action: string) => {
  const [area, what] = action.split('.')
  const label = (what ?? '').replace(/_/g, ' ')
  return `${(area ?? '').replace(/^./, (c) => c.toUpperCase())}: ${label}`
}

export default function AuditLog() {
  const { api } = usePortal()
  const [area, setArea] = useState<AuditQuery['area']>(undefined)
  const [pages, setPages] = useState(1)
  const result = useLoad(() => api.listAudit({ offset: 0, limit: AUDIT_PAGE * pages, area }), [api, area, pages])
  return (
    <>
      <PageTitle title="Audit log" intro="Who did what, newest first. Entries cannot be edited or deleted from here." />
      <div className="mt-6">
        <label htmlFor="audit-area" className="text-sm font-semibold">
          Show
        </label>
        <select
          id="audit-area"
          value={area ?? ''}
          onChange={(e) => {
            setArea((e.target.value || undefined) as AuditQuery['area'])
            setPages(1)
          }}
          className="mt-1 block min-h-11 rounded-xl border border-green-300 bg-white px-3 text-[15px]"
        >
          <option value="">Everything</option>
          {AREAS.map((a) => (
            <option key={a} value={a}>
              {AUDIT_AREA_LABEL[a]}
            </option>
          ))}
        </select>
      </div>
      <Loaded result={result}>
        {({ items, hasMore }) => (
          <Card className="mt-6 overflow-x-auto !p-0">
            {items.length === 0 ? (
              <p className="p-6 text-slate">Nothing logged yet.</p>
            ) : (
              <table className="w-full min-w-[40rem] text-left text-[15px]">
                <caption className="sr-only">Audit log</caption>
                <thead className="bg-mist text-sm text-slate">
                  <tr>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      When
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Who
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      What
                    </th>
                    <th scope="col" className="px-5 py-3 font-semibold">
                      Detail
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((r) => {
                    const note = r.detail.note ?? r.detail.reason
                    return (
                      <tr key={r.id} className="border-t border-green-100 align-top">
                        <td className="px-5 py-3 whitespace-nowrap text-slate">{formatDate(r.createdAt)}</td>
                        <td className="px-5 py-3 break-all">{r.actor}</td>
                        <td className="px-5 py-3 font-semibold">{describe(r.action)}</td>
                        <td className="px-5 py-3 text-slate">
                          {typeof note === 'string' && note ? `“${note}”` : ''}
                          {typeof r.detail.kind === 'string' ? ` ${r.detail.kind.replace(/_/g, ' ')}` : ''}
                          <span className="block font-mono text-xs break-all text-slate/80">
                            {r.targetType} {r.targetId}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
            {hasMore && (
              <div className="border-t border-green-100 p-5">
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
