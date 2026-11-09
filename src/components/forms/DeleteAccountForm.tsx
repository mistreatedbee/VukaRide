import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { deleteAccountSchema, type DeleteAccountData, type DeleteAccountInput } from '../../lib/schemas'
import { CheckboxField, Honeypot, TextArea, TextField } from './fields'
import { FormFrame, SubmitButton, SuccessPanel, useSubmission } from './FormFrame'

export function DeleteAccountForm() {
  const { register, handleSubmit, formState } = useForm<DeleteAccountInput, unknown, DeleteAccountData>({
    resolver: zodResolver(deleteAccountSchema),
    defaultValues: { contact: '', reason: '', confirm: false, website: '' },
  })
  const sub = useSubmission('delete-account')
  const { errors } = formState
  const submit = handleSubmit(sub.send)

  if (sub.status === 'success') {
    return (
      <SuccessPanel title="We have received your request." mock={sub.mock}>
        We will check that the account is yours with a confirmation email or SMS code. We confirm your request within 3 working days and
        finish deletion within 30 days.
      </SuccessPanel>
    )
  }

  return (
    <FormFrame
      kind="delete-account"
      label="Request account deletion"
      onSubmit={submit}
      errors={errors}
      submitCount={formState.submitCount}
      status={sub.status}
      message={sub.message}
      onRetry={() => void submit()}
      className="space-y-6"
    >
      <TextField
        label="Email or mobile number"
        hint="The one you use to sign in to Vuka Ride."
        autoComplete="email"
        error={errors.contact?.message}
        {...register('contact')}
      />
      <TextArea label="Reason for leaving" optional rows={4} error={errors.reason?.message} {...register('reason')} />
      <CheckboxField error={errors.confirm?.message} {...register('confirm')}>
        I understand this will permanently delete my Vuka Ride account.
      </CheckboxField>
      <Honeypot {...register('website')} />
      <SubmitButton loading={sub.status === 'submitting'} loadingText="Sending request...">
        Request deletion
      </SubmitButton>
    </FormFrame>
  )
}
