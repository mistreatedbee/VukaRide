import React from 'react'

import { CheckboxField, FormState, SubmitButton, SuccessPanel, TextArea, TextField, isEmail, isPhone, useForm } from './fields'

const EMPTY = { contact: '', reason: '', confirm: false }

export function DeleteAccountForm({ state = 'default' }: { state?: FormState }) {
  const { field, handleSubmit, status } = useForm(
    EMPTY,
    (v) => {
      const e: Partial<Record<keyof typeof EMPTY, string>> = {}
      if (!isEmail(v.contact) && !isPhone(v.contact)) e.contact = 'Enter the email or phone number on your account.'
      if (!v.confirm) e.confirm = 'Please confirm you want your account deleted.'
      return e
    },
    undefined,
    state
  )

  if (status === 'success') {
    return (
      <SuccessPanel title="Request received.">
        We will verify that the account is yours, then delete it and contact you when it is done. <span className="font-medium">[Add processing time]</span>
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Request account deletion" className="space-y-6">
      <TextField label="Email or phone number" hint="The one you use to sign in to Vuka Ride." autoComplete="email" {...field('contact')} />
      <TextArea label="Reason for leaving" optional rows={4} {...field('reason')} />
      <CheckboxField {...field('confirm')}>I understand this will permanently delete my Vuka Ride account and trip history.</CheckboxField>
      <SubmitButton loading={status === 'loading'} loadingText="Sending request…">
        Request deletion
      </SubmitButton>
    </form>
  )
}
