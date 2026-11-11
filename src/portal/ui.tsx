import { AlertCircle, CheckCircle2, Info, Loader2 } from 'lucide-react'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { STATUS_LABEL, type ApplicationStatus } from './types'

export function PageTitle({ title, intro, actions }: { title: string; intro?: ReactNode; actions?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        <h1 className="text-2xl font-bold tracking-tight text-deep sm:text-3xl">{title}</h1>
        {intro && <p className="mt-2 max-w-2xl leading-[1.7] text-slate">{intro}</p>}
      </div>
      {actions}
    </div>
  )
}

export function Card({
  children,
  className = '',
  as: Tag = 'section',
  ...rest
}: {
  children: ReactNode
  className?: string
  as?: 'section' | 'div' | 'li'
  'aria-labelledby'?: string
}) {
  return (
    <Tag
      className={`rounded-[24px] border border-green-100 bg-white p-5 shadow-[0_12px_40px_-28px_rgba(4,55,31,0.4)] sm:p-6 ${className}`}
      {...rest}
    >
      {children}
    </Tag>
  )
}

const BADGE: Record<ApplicationStatus, string> = {
  draft: 'bg-mist text-ink ring-1 ring-ink/10',
  submitted: 'bg-sky-100 text-sky-900',
  in_review: 'bg-amber-100 text-amber-900',
  needs_info: 'bg-orange-100 text-orange-950',
  approved: 'bg-leaf text-deep',
  rejected: 'bg-red-100 text-red-900',
}

export function StatusBadge({ status }: { status: ApplicationStatus }) {
  return (
    <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-sm font-semibold ${BADGE[status]}`}>
      {STATUS_LABEL[status]}
    </span>
  )
}

export function Pill({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'good' | 'warn' | 'bad' }) {
  const t = {
    neutral: 'bg-mist text-ink ring-1 ring-ink/10',
    good: 'bg-leaf text-deep',
    warn: 'bg-amber-100 text-amber-900',
    bad: 'bg-red-100 text-red-900',
  }[tone]
  return <span className={`inline-flex min-h-7 items-center rounded-full px-3 text-sm font-semibold ${t}`}>{children}</span>
}

export function Notice({
  tone = 'info',
  title,
  children,
}: {
  tone?: 'info' | 'good' | 'warn' | 'bad'
  title?: string
  children?: ReactNode
}) {
  const styles = {
    info: 'border-sky-200 bg-sky-50 text-sky-950',
    good: 'border-green-200 bg-green-50 text-deep',
    warn: 'border-amber-300 bg-amber-50 text-amber-950',
    bad: 'border-red-200 bg-red-50 text-red-950',
  }[tone]
  const Icon = tone === 'good' ? CheckCircle2 : tone === 'info' ? Info : AlertCircle
  return (
    <div role={tone === 'bad' ? 'alert' : 'status'} className={`flex items-start gap-3 rounded-2xl border p-4 ${styles}`}>
      <Icon className="mt-0.5 size-5 shrink-0" aria-hidden="true" />
      <div className="min-w-0 leading-[1.6]">
        {title && <p className="font-semibold">{title}</p>}
        {children && <div className={title ? 'mt-1 text-[15px]' : ''}>{children}</div>}
      </div>
    </div>
  )
}

export function Spinner({ label = 'Loading' }: { label?: string }) {
  return (
    <div role="status" className="flex items-center gap-3 py-10 text-slate">
      <Loader2 className="size-5 animate-spin motion-reduce:animate-none" aria-hidden="true" />
      <span>{label}…</span>
    </div>
  )
}

/** Runs an async loader and keeps its result. `reload` runs it again. Ignores results that arrive after unmount. */
export function useLoad<T>(loader: () => Promise<T>, deps: readonly unknown[]) {
  const [state, setState] = useState<{ data: T | undefined; error: string | null; loading: boolean }>({
    data: undefined,
    error: null,
    loading: true,
  })
  const run = useRef(loader)
  useEffect(() => {
    run.current = loader
  })
  const [tick, setTick] = useState(0)
  const reload = useCallback(() => setTick((t) => t + 1), [])
  useEffect(() => {
    let alive = true
    run
      .current()
      .then((data) => alive && setState({ data, error: null, loading: false }))
      .catch(
        (e: unknown) =>
          alive && setState({ data: undefined, error: e instanceof Error ? e.message : 'Something went wrong.', loading: false })
      )
    return () => {
      alive = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps])
  return { ...state, reload }
}

export function Loaded<T>({
  result,
  children,
}: {
  result: { data: T | undefined; error: string | null; loading: boolean; reload: () => void }
  children: (data: T) => ReactNode
}) {
  if (result.loading && result.data === undefined) return <Spinner />
  if (result.error) {
    return (
      <div className="mt-6">
        <Notice tone="bad" title="That did not load.">
          {result.error}{' '}
          <button type="button" onClick={result.reload} className="min-h-11 font-semibold underline underline-offset-2">
            Try again
          </button>
        </Notice>
      </div>
    )
  }
  return <>{result.data === undefined ? null : children(result.data)}</>
}

export const formatDate = (iso: string | null) =>
  iso ? new Intl.DateTimeFormat('en-ZA', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso)) : '—'
