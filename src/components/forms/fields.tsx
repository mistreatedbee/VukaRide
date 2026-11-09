import {
  createContext,
  forwardRef,
  useContext,
  useId,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { AlertCircle, ChevronDown } from 'lucide-react'

/** Prefix that keeps field ids unique per form, so the error summary can link to them. */
export const FormIdContext = createContext('form')
export const fieldId = (form: string, name: string) => `${form}-${name}`
const useFieldId = (name: string) => fieldId(useContext(FormIdContext), name)

type BaseProps = { label: string; name: string; error?: string; hint?: string; optional?: boolean; className?: string }

const control = (error?: string) =>
  `block w-full min-h-12 rounded-xl border bg-white px-4 text-base text-ink placeholder:text-slate transition-[border-color,box-shadow] duration-150 ease-out focus:outline-none focus:ring-4 ${
    error ? 'border-danger focus:ring-danger/15' : 'border-green-300 focus:border-green-600 focus:ring-green-600/15'
  }`

const describedBy = (id: string, error?: string, hint?: string) =>
  [hint && `${id}-hint`, error && `${id}-err`].filter(Boolean).join(' ') || undefined

function FieldError({ id, error, className = '' }: { id: string; error?: string; className?: string }) {
  if (!error) return null
  return (
    <p id={`${id}-err`} className={`mt-1.5 flex items-center gap-1.5 text-sm font-medium text-danger ${className}`}>
      <AlertCircle className="size-4 shrink-0" aria-hidden="true" />
      {error}
    </p>
  )
}

function FieldWrap({
  label,
  error,
  hint,
  optional,
  id,
  className = '',
  children,
}: Omit<BaseProps, 'name'> & { id: string; children: ReactNode }) {
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
      <FieldError id={id} error={error} />
    </div>
  )
}

type InputProps = BaseProps & Omit<InputHTMLAttributes<HTMLInputElement>, 'className'>
export const TextField = forwardRef<HTMLInputElement, InputProps>(function TextField(
  { label, error, hint, optional, className, ...input },
  ref
) {
  const id = useFieldId(input.name)
  return (
    <FieldWrap label={label} error={error} hint={hint} optional={optional} id={id} className={className}>
      <input
        ref={ref}
        id={id}
        {...input}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={control(error)}
      />
    </FieldWrap>
  )
})

type AreaProps = BaseProps & Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'className'>
export const TextArea = forwardRef<HTMLTextAreaElement, AreaProps>(function TextArea(
  { label, error, hint, optional, className, rows = 5, ...area },
  ref
) {
  const id = useFieldId(area.name)
  return (
    <FieldWrap label={label} error={error} hint={hint} optional={optional} id={id} className={className}>
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        {...area}
        aria-invalid={!!error}
        aria-describedby={describedBy(id, error, hint)}
        className={`${control(error)} py-3`}
      />
    </FieldWrap>
  )
})

type SelectProps = BaseProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className'> & { options: readonly string[]; placeholder?: string }
export const SelectField = forwardRef<HTMLSelectElement, SelectProps>(function SelectField(
  { label, error, hint, optional, className, options, placeholder = 'Choose one', ...select },
  ref
) {
  const id = useFieldId(select.name)
  return (
    <FieldWrap label={label} error={error} hint={hint} optional={optional} id={id} className={className}>
      <div className="relative">
        <select
          ref={ref}
          id={id}
          defaultValue=""
          {...select}
          aria-invalid={!!error}
          aria-describedby={describedBy(id, error, hint)}
          className={`${control(error)} appearance-none pr-11`}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {options.map((o) => (
            <option key={o} value={o}>
              {o}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-slate" aria-hidden="true" />
      </div>
    </FieldWrap>
  )
})

type CheckProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'className'> & { name: string; error?: string; children: ReactNode }
export const CheckboxField = forwardRef<HTMLInputElement, CheckProps>(function CheckboxField({ error, children, ...input }, ref) {
  const id = useFieldId(input.name)
  return (
    <div>
      <div className="flex items-start gap-3">
        <input
          ref={ref}
          id={id}
          type="checkbox"
          {...input}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-err` : undefined}
          className="mt-0.5 size-6 shrink-0 cursor-pointer rounded-md accent-green-600"
        />
        <label htmlFor={id} className="cursor-pointer pt-0.5 text-[15px] leading-snug text-ink">
          {children}
        </label>
      </div>
      <FieldError id={id} error={error} className="ml-9" />
    </div>
  )
})

/** Hidden trap for bots. Real visitors never see it or tab to it. */
export const Honeypot = forwardRef<HTMLInputElement, Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { name: string }>(
  function Honeypot(props, ref) {
    const id = useId()
    return (
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={id}>Leave this field empty</label>
        <input ref={ref} id={id} type="text" tabIndex={-1} autoComplete="off" {...props} />
      </div>
    )
  }
)
