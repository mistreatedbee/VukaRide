import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { notifySchema, type NotifyData, type NotifyInput } from '../../lib/schemas'
import { CheckboxField, Honeypot, TextField } from './fields'
import { FormFrame, SubmitButton, SuccessPanel, useSubmission } from './FormFrame'

/** Launch-news sign-up shown on /download while the store URLs are not set. */
export function NotifyForm() {
  const { register, handleSubmit, formState } = useForm<NotifyInput, unknown, NotifyData>({
    resolver: zodResolver(notifySchema),
    defaultValues: { email: '', mobile: '', consent: false, website: '' },
  })
  const sub = useSubmission('notify')
  const { errors } = formState
  const submit = handleSubmit(sub.send)

  if (sub.status === 'success') {
    return (
      <SuccessPanel title="You are on the list." mock={sub.mock}>
        We will let you know when Vuka Ride is ready to download.
      </SuccessPanel>
    )
  }

  return (
    <FormFrame
      kind="notify"
      label="Get launch news"
      onSubmit={submit}
      errors={errors}
      submitCount={formState.submitCount}
      status={sub.status}
      message={sub.message}
      onRetry={() => void submit()}
      className="space-y-5 text-left"
    >
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <TextField
        label="WhatsApp number"
        optional
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="082 123 4567"
        hint="Email, WhatsApp, or both."
        error={errors.mobile?.message}
        {...register('mobile')}
      />
      <CheckboxField error={errors.consent?.message} {...register('consent')}>
        Send me news about the Vuka Ride launch. See the{' '}
        <Link to="/privacy" className="font-semibold text-green-600 underline underline-offset-2">
          Privacy Policy
        </Link>
        .
      </CheckboxField>
      <Honeypot {...register('website')} />
      <SubmitButton loading={sub.status === 'submitting'}>Notify me</SubmitButton>
    </FormFrame>
  )
}
