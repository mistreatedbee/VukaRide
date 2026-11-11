import { ExternalLink, FileUp, Trash2 } from 'lucide-react'
import { useRef, useState } from 'react'

import { usePortal } from '../auth'
import {
  ALLOWED_UPLOAD_TYPES,
  DOC_INFO,
  DOC_KINDS,
  DOC_STATUS_LABEL,
  isEditable,
  validateUpload,
  type DocKind,
  type DocumentRow,
} from '../types'
import { Card, Loaded, Notice, PageTitle, Pill, useLoad } from '../ui'

function DocRow({ kind, docs, editable, onChanged }: { kind: DocKind; docs: DocumentRow[]; editable: boolean; onChanged: () => void }) {
  const { api } = usePortal()
  const input = useRef<HTMLInputElement>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const info = DOC_INFO[kind]
  const current = docs.find((d) => d.status !== 'rejected') ?? docs[0]
  const hid = `doc-${kind}`

  const onFile = async (file: File | undefined) => {
    if (!file) return
    const problem = validateUpload(file)
    if (problem) {
      setError(problem)
      return
    }
    setBusy(true)
    setError(null)
    try {
      await api.uploadDocument(kind, file)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
      if (input.current) input.current.value = ''
    }
  }

  const open = async (d: DocumentRow) => {
    const url = await api.documentUrl(d)
    if (url) window.open(url, '_blank', 'noopener,noreferrer')
    else setError('We could not open that file.')
  }

  const remove = async (d: DocumentRow) => {
    setBusy(true)
    setError(null)
    try {
      await api.deleteDocument(d)
      onChanged()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const tone = current ? (current.status === 'accepted' ? 'good' : current.status === 'rejected' ? 'bad' : 'warn') : 'neutral'
  return (
    <li className="border-t border-green-100 py-5 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 id={hid} className="font-semibold text-deep">
            {info.label} {!info.required && <span className="font-normal text-slate">(optional for now)</span>}
          </h3>
          <p className="mt-1 text-sm leading-[1.6] text-slate">{info.hint}</p>
        </div>
        <Pill tone={tone}>{current ? DOC_STATUS_LABEL[current.status] : info.required ? 'Not added' : 'Not added yet'}</Pill>
      </div>

      {docs.map((d) => (
        <div key={d.id} className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 rounded-xl bg-mist px-4 py-2 text-sm">
          <span className="min-w-0 flex-1 truncate font-medium text-ink" title={d.fileName}>
            {d.fileName}
          </span>
          <button
            type="button"
            onClick={() => void open(d)}
            className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-green-600 underline underline-offset-2"
          >
            <ExternalLink className="size-4" aria-hidden="true" />
            View<span className="sr-only"> {d.fileName}</span>
          </button>
          {editable && d.status !== 'accepted' && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void remove(d)}
              className="inline-flex min-h-11 items-center gap-1.5 font-semibold text-danger underline underline-offset-2"
            >
              <Trash2 className="size-4" aria-hidden="true" />
              Remove<span className="sr-only"> {d.fileName}</span>
            </button>
          )}
          {d.note && <p className="basis-full text-danger">Reviewer note: {d.note}</p>}
        </div>
      ))}

      {editable && (
        <div className="mt-3">
          <input
            ref={input}
            id={`${hid}-file`}
            type="file"
            accept={ALLOWED_UPLOAD_TYPES.join(',')}
            className="sr-only"
            aria-describedby={error ? `${hid}-err` : undefined}
            onChange={(e) => void onFile(e.target.files?.[0])}
          />
          <label
            htmlFor={`${hid}-file`}
            className={`inline-flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-green-600 px-5 text-[15px] font-semibold text-green-700 hover:bg-green-50 focus-within:outline-3 ${busy ? 'pointer-events-none opacity-60' : ''}`}
          >
            <FileUp className="size-4" aria-hidden="true" />
            {busy ? 'Working…' : current ? 'Add another file' : 'Choose a file'}
            <span className="sr-only"> for {info.label}</span>
          </label>
        </div>
      )}
      {error && (
        <p id={`${hid}-err`} role="alert" className="mt-2 text-sm font-medium text-danger">
          {error}
        </p>
      )}
    </li>
  )
}

export default function Documents() {
  const { api } = usePortal()
  const result = useLoad(async () => ({ docs: await api.listMyDocuments(), app: await api.getMyApplication() }), [api])

  return (
    <>
      <PageTitle
        title="Your documents"
        intro="Upload clear photos or scans. PDF, JPG, PNG or WebP, up to 10 MB each. Only you and the Vuka Ride review team can open them."
      />
      <Loaded result={result}>
        {({ docs, app }) => {
          const editable = isEditable(app?.status)
          return (
            <div className="mt-8 max-w-3xl space-y-5">
              {!editable && (
                <Notice tone="info">
                  Your application is being reviewed, so uploads are paused. If we need something new, we will tell you.
                </Notice>
              )}
              <Card>
                <ul>
                  {DOC_KINDS.map((k) => (
                    <DocRow key={k} kind={k} docs={docs.filter((d) => d.kind === k)} editable={editable} onChanged={result.reload} />
                  ))}
                </ul>
              </Card>
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
