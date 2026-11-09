import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'

import { CONTACT_TOPICS, contactSchema, type ContactData, type ContactInput } from '../../lib/schemas'
import { Honeypot, SelectField, TextArea, TextField } from './fields'
import { FormFrame, SubmitButton, SuccessPanel, useSubmission } from './FormFrame'
import { Placeholder } from '../ui'

export function ContactForm() {
  const { register, handleSubmit, reset, formState } = useForm<ContactInput, unknown, ContactData>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', email: '', topic: undefined, message: '', website: '' },
  })
  const sub = useSubmission('contact')
  const { errors } = formState
  const submit = handleSubmit(sub.send)

  if (sub.status === 'success') {
    return (
      <SuccessPanel
        title="Thanks, your message is on its way."
        mock={sub.mock}
        onReset={() => {
          reset()
          sub.reset()
        }}
      >
        We will reply as soon as we can. <Placeholder>[Add expected response time]</Placeholder>
      </SuccessPanel>
    )
  }

  return (
    <FormFrame
      kind="contact"
      label="Contact Vuka Ride"
      onSubmit={submit}
      errors={errors}
      submitCount={formState.submitCount}
      status={sub.status}
      message={sub.message}
      onRetry={() => void submit()}
      className="grid gap-6 sm:grid-cols-2"
    >
      <TextField label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <SelectField
        label="Topic"
        options={CONTACT_TOPICS}
        placeholder="What is this about?"
        className="sm:col-span-2"
        error={errors.topic?.message}
        {...register('topic')}
      />
      <TextArea label="Message" className="sm:col-span-2" error={errors.message?.message} {...register('message')} />
      <Honeypot {...register('website')} />
      <div className="sm:col-span-2">
        <SubmitButton loading={sub.status === 'submitting'}>Send message</SubmitButton>
      </div>
    </FormFrame>
  )
}
