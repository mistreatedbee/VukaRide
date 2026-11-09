import React, { useId, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AlertCircle, CheckCircle2, ChevronDown, Loader2 } from 'lucide-react'

/**
 * Small form kit: a validation hook plus labelled, accessible fields.
 * Errors show after a field is left or after a submit attempt.
 */
export type FormState = 'default' | 'errors' | 'loading' | 'success'

export function useForm<T extends Record<string, string | boolean>>(
  initial: T,
  validate: (v: T) => Partial<Record<keyof T, string>>,
  onValid?: (v: T) => void,
  start: FormState = 'default'
) {
  const [values, setValues] = useState<T>(initial)
  const [touched, setTouched] = useState<Partial<Record<keyof T, boolean>>>({})
  const [submitted, setSubmitted] = useState(start === 'errors')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>(start === 'loading' || start === 'success' ? start : 'idle')
  const errors = validate(values)

  const field = <K extends keyof T>(name: K) => ({
    name: name as string,
    value: values[name],
    error: touched[name] || submitted ? errors[name] : undefined,
    onChange: (v: T[K]) => setValues((s) => ({ ...s, [name]: v })),
    onBlur: () => setTouched((t) => ({ ...t, [name]: true })),
  })

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitted(true)
    const first = Object.keys(errors)[0]
    if (first) {
      const el = e.currentTarget.querySelector<HTMLElement>(`[name="${first}"]`)
      el?.focus()
      return
    }
    setStatus('loading')
    // TODO: connect to API
    setTimeout(() => {
      console.log('Form submitted', values)
      onValid?.(values)
      setStatus('success')
    }, 900)
  }

  const reset = () => {
    setValues(initial)
    setTouched({})
    setSubmitted(false)
    setStatus('idle')
  }

  return { values, field, handleSubmit, status, reset }
}

export const isEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(s.trim())
export const isPhone = (s: string) => /^\+?[\d\s()-]{9,16}$/.test(s.trim())

type BaseProps = { label: string; name: string; error?: string; hint?: string; optional?: boolean; className?: string }

function FieldWrap({ label, error, hint, optional, id, className = '', children }: BaseProps & { id: string; children: React.ReactNode }) {
  return (
    <div className={className}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
        {optional && <span className="ml-1 font-normal text-slate">(optional)</span>}
      </label>
      {hint && (
        <p id={`${id}-hint`} className="mt-1 text-sm text-slate">
          {hint}
        </p>
      )}
      <div className="mt-2">{children}</div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 flex items-center gap-1.5 text-sm font-medium text-[#B42318]">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

const control = (error?: string) =>
  `block w-full min-h-12 rounded-xl border bg-white px-4 text-base text-ink placeholder:text-slate/70 transition-[border-color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-4 ${
    error ? 'border-[#B42318] focus:ring-[#B42318]/15' : 'border-green-200 focus:border-green-600 focus:ring-green-600/15'
  }`

const describedBy = (id: string, error?: string, hint?: string) => [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined

export function TextField({
  value,
  onChange,
  onBlur,
  type = 'text',
  autoComplete,
  placeholder,
  inputMode,
  ...base
}: BaseProps & {
  value: string | boolean
  onChange: (v: never) => void
  onBlur: () => void
  type?: string
  autoComplete?: string
  placeholder?: string
  inputMode?: React.HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const id = useId()
  return (
    <FieldWrap {...base} id={id}>
      <input
        id={id}
        name={base.name}
        type={type}
        value={String(value)}
        onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
        onBlur={onBlur}
        autoComplete={autoComplete}
        placeholder={placeholder}
        inputMode={inputMode}
        aria-invalid={!!base.error}
        aria-describedby={describedBy(id, base.error, base.hint)}
        className={control(base.error)}
      />
    </FieldWrap>
  )
}

export function TextArea({ value, onChange, onBlur, rows = 5, ...base }: BaseProps & { value: string | boolean; onChange: (v: never) => void; onBlur: () => void; rows?: number }) {
  const id = useId()
  return (
    <FieldWrap {...base} id={id}>
      <textarea
        id={id}
        name={base.name}
        rows={rows}
        value={String(value)}
        onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
        onBlur={onBlur}
        aria-invalid={!!base.error}
        aria-describedby={describedBy(id, base.error, base.hint)}
        className={`${control(base.error)} py-3`}
      />
    </FieldWrap>
  )
}

export function SelectField({
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Choose one',
  ...base
}: BaseProps & { value: string | boolean; onChange: (v: never) => void; onBlur: () => void; options: string[]; placeholder?: string }) {
  const id = useId()
  return (
    <FieldWrap {...base} id={id}>
      <div className="relative">
        <select
          id={id}
          name={base.name}
          value={String(value)}
          onChange={(e) => (onChange as (v: string) => void)(e.target.value)}
          onBlur={onBlur}
          aria-invalid={!!base.error}
          aria-describedby={describedBy(id, base.error, base.hint)}
          className={`${control(base.error)} appearance-none pr-11 ${value ? '' : 'text-slate'}`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o} className="text-ink">
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-slate" aria-hidden="true" />
      </div>
    </FieldWrap>
  )
}

export function CheckboxField({
  value,
  onChange,
  onBlur,
  name,
  error,
  children,
}: {
  value: string | boolean
  onChange: (v: never) => void
  onBlur: () => void
  name: string
  error?: string
  children: React.ReactNode
}) {
  const id = useId()
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          id={id}
          name={name}
          type="checkbox"
          checked={!!value}
          onChange={(e) => (onChange as (v: boolean) => void)(e.target.checked)}
          onBlur={onBlur}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className="mt-0.5 size-6 shrink-0 cursor-pointer rounded-md accent-green-600"
        />
        <label htmlFor={id} className="cursor-pointer pt-0.5 text-[15px] leading-snug text-ink">
          {children}
        </label>
      </div>
      {error && (
        <p id={`${id}-err`} className="mt-1.5 ml-9 flex items-center gap-1.5 text-sm font-medium text-[#B42318]">
          <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  )
}

export function SubmitButton({ loading, children, loadingText = 'Sending…' }: { loading: boolean; children: React.ReactNode; loadingText?: string }) {
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

export function SuccessPanel({ title, children, onReset, resetLabel = 'Send another' }: { title: string; children?: React.ReactNode; onReset?: () => void; resetLabel?: string }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      role="status"
      initial={reduce ? false : { opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.24, ease: [0.23, 1, 0.32, 1] }}
      className="flex flex-col items-center rounded-3xl bg-green-50 px-6 py-12 text-center"
    >
      <span className="inline-flex size-14 items-center justify-center rounded-full bg-green-600 text-white">
        <CheckCircle2 className="size-7" aria-hidden="true" />
      </span>
      <p className="mt-5 text-xl font-semibold text-deep">{title}</p>
      {children && <p className="mt-2 max-w-sm leading-[1.7] text-slate">{children}</p>}
      {onReset && (
        <button type="button" onClick={onReset} className="mt-6 min-h-11 rounded-full px-4 font-semibold text-green-600 underline underline-offset-4">
          {resetLabel}
        </button>
      )}
    </motion.div>
  )
}
