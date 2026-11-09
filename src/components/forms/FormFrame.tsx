import { useEffect, useId, useRef, useState, type FormEventHandler, type ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Loader2, RotateCw } from 'lucide-react'
import type { FieldErrors, FieldValues } from 'react-hook-form'

import { submitForm, type SubmitResult } from '../../lib/submit-form'
import type { FormKind, FormKindMap } from '../../lib/schemas'
import { FormIdContext, fieldId } from './fields'

/** A person cannot fill a real form faster than this. Faster submits are asked to try again. */
export const MIN_FILL_MS = 2500
const TOO_QUICK = 'That was quick. Please check your details and send again.'

export type Status = 'idle' | 'submitting' | 'success' | 'error'

/** Submission state shared by all forms: timing check, mock-mode flag, error message, reset. */
export function useSubmission<K extends FormKind>(kind: K) {
  const shownAt = useRef(0)
  const [status, setStatus] = useState<Status>('idle')
  const [message, setMessage] = useState('')
  const [mock, setMock] = useState(false)

  const idle = status === 'idle'
  useEffect(() => {
    shownAt.current = Date.now()
  }, [idle])

  const send = async (data: FormKindMap[K]) => {
    const elapsedMs = Date.now() - shownAt.current
    if (elapsedMs < MIN_FILL_MS && !data.website) {
      shownAt.current = 0 // the next attempt counts as human-paced
      setMessage(TOO_QUICK)
      setStatus('error')
      return
    }
    setStatus('submitting')
    const result: SubmitResult = await submitForm(kind, data, { elapsedMs })
    if (result.ok) {
      setMock(result.mock)
      setStatus('success')
    } else {
      setMessage(result.message)
      setStatus('error')
    }
  }
  const reset = () => setStatus('idle')
  return { status, message, mock, send, reset }
}

export function SuccessPanel({
  title,
  children,
  mock,
  onReset,
  resetLabel = 'Send another',
}: {
  title: string
  children?: ReactNode
  mock?: boolean
  onReset?: () => void
  resetLabel?: string
}) {
  return (
    <div role="status" className="success-pop flex flex-col items-center rounded-3xl bg-green-50 px-6 py-12 text-center">
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-green-600 text-white">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xl font-semibold text-deep">{title}</p>
      {children && <p className="mt-2 max-w-sm leading-[1.7] text-slate">{children}</p>}
      {mock && (
        <p className="mt-4 max-w-sm rounded-xl bg-sun/25 px-3 py-2 text-sm font-medium text-ink">
          Demo mode: this form is not connected yet, so nothing was sent.
        </p>
      )}
      {onReset && (
        <button
          type="button"
          onClick={onReset}
          className="mt-6 min-h-11 rounded-full px-4 font-semibold text-green-600 underline underline-offset-4"
        >
          {resetLabel}
        </button>
      )}
    </div>
  )
}

export function SubmitButton({
  loading,
  children,
  loadingText = 'Sending...',
}: {
  loading: boolean
  children: ReactNode
  loadingText?: string
}) {
  return (
    <button
      type="submit"
      disabled={loading}
      aria-busy={loading}
      className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-green-600 px-7 text-base font-semibold whitespace-nowrap text-white transition-[filter,transform] duration-150 ease-out hover:brightness-110 active:scale-[0.98] disabled:cursor-wait disabled:opacity-80 sm:w-auto"
    >
      {loading && <Loader2 className="size-5 animate-spin" aria-hidden="true" />}
      {loading ? loadingText : children}
    </button>
  )
}

/**
 * The <form> element plus everything around it: an error summary that is announced and focused after a
 * failed submit, a general error with Retry, and the busy state. The fields go in `children`.
 */
export function FormFrame({
  kind,
  label,
  onSubmit,
  errors,
  submitCount,
  status,
  message,
  onRetry,
  className = '',
  children,
}: {
  kind: FormKind
  label: string
  onSubmit: FormEventHandler<HTMLFormElement>
  errors: FieldErrors<FieldValues>
  submitCount: number
  status: Status
  message: string
  onRetry: () => void
  className?: string
  children: ReactNode
}) {
  const summary = useRef<HTMLDivElement>(null)
  const errorBox = useRef<HTMLDivElement>(null)
  const titleId = useId()
  const problems = Object.entries(errors).flatMap(([name, e]) =>
    e && typeof e.message === 'string' && name !== 'website' ? [{ name, message: e.message }] : []
  )

  useEffect(() => {
    if (submitCount > 0 && problems.length > 0) summary.current?.focus()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only when a submit attempt finishes
  }, [submitCount])
  useEffect(() => {
    if (status === 'error') errorBox.current?.focus()
  }, [status])

  return (
    <FormIdContext.Provider value={kind}>
      <form noValidate onSubmit={onSubmit} aria-label={label} aria-busy={status === 'submitting'} className={className}>
        {submitCount > 0 && problems.length > 0 && (
          <div
            ref={summary}
            tabIndex={-1}
            role="alert"
            aria-labelledby={titleId}
            className="col-span-full rounded-2xl border border-danger bg-danger/5 p-5 outline-none"
          >
            <p id={titleId} className="flex items-center gap-2 font-semibold text-danger">
              <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
              {problems.length === 1 ? 'There is 1 problem with your form' : `There are ${problems.length} problems with your form`}
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-9 text-sm">
              {problems.map((p) => (
                <li key={p.name}>
                  <a
                    href={`#${fieldId(kind, p.name)}`}
                    className="font-medium text-ink underline underline-offset-2"
                    onClick={(e) => {
                      e.preventDefault()
                      document.getElementById(fieldId(kind, p.name))?.focus()
                    }}
                  >
                    {p.message}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
        {children}
        {status === 'error' && (
          <div
            ref={errorBox}
            tabIndex={-1}
            role="alert"
            className="col-span-full flex flex-wrap items-center gap-3 rounded-2xl border border-danger bg-danger/5 p-4 outline-none"
          >
            <p className="flex-1 text-sm font-medium text-danger">{message}</p>
            <button
              type="button"
              onClick={onRetry}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-danger px-4 text-sm font-semibold text-danger"
            >
              <RotateCw className="size-4" aria-hidden="true" />
              Try again
            </button>
          </div>
        )}
      </form>
    </FormIdContext.Provider>
  )
}
