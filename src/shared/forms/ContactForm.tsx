import React from 'react'

import { FormState, SelectField, SubmitButton, SuccessPanel, TextArea, TextField, isEmail, useForm } from './fields'

const TOPICS = ['Rider support', 'Driver support', 'Partnerships', 'Other']
const EMPTY = { name: '', email: '', topic: '', message: '' }

export function ContactForm({ state = 'default' }: { state?: FormState }) {
  const { field, handleSubmit, status, reset } = useForm(
    EMPTY,
    (v) => {
      const e: Partial<Record<keyof typeof EMPTY, string>> = {}
      if (v.name.trim().length < 2) e.name = 'Enter your name.'
      if (!isEmail(v.email)) e.email = 'Enter a valid email address.'
      if (!v.topic) e.topic = 'Choose a topic.'
      if (v.message.trim().length < 10) e.message = 'Tell us a little more (at least 10 characters).'
      return e
    },
    undefined,
    state
  )

  if (status === 'success') {
    return (
      <SuccessPanel title="Message sent." onReset={reset}>
        Thanks for getting in touch. We will reply by email. <span className="font-medium">[Add expected response time]</span>
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Contact Vuka Ride" className="grid gap-6 sm:grid-cols-2">
      <TextField label="Name" autoComplete="name" {...field('name')} />
      <TextField label="Email" type="email" autoComplete="email" {...field('email')} />
      <SelectField label="Topic" options={TOPICS} placeholder="What is this about?" {...field('topic')} className="sm:col-span-2" />
      <TextArea label="Message" {...field('message')} className="sm:col-span-2" />
      <div className="sm:col-span-2">
        <SubmitButton loading={status === 'loading'}>Send message</SubmitButton>
      </div>
    </form>
  )
}
