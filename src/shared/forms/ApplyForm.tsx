import React from 'react'

import { Link } from '../nav'
import { CheckboxField, FormState, SelectField, SubmitButton, SuccessPanel, TextField, isEmail, isPhone, useForm } from './fields'

// [Add your launch cities]
const CITIES = ['[City one]', '[City two]', '[City three]', 'Other']

const EMPTY = {
  fullName: '',
  mobile: '',
  email: '',
  city: '',
  vehicle: '',
  year: '',
  plate: '',
  licence: false,
  terms: false,
}

export function ApplyForm({ state = 'default' }: { state?: FormState }) {
  const thisYear = new Date().getFullYear()
  const { field, handleSubmit, status, reset } = useForm(
    EMPTY,
    (v) => {
      const e: Partial<Record<keyof typeof EMPTY, string>> = {}
      if (v.fullName.trim().length < 2) e.fullName = 'Enter your full name.'
      if (!isPhone(v.mobile)) e.mobile = 'Enter a valid mobile number.'
      if (!isEmail(v.email)) e.email = 'Enter a valid email address.'
      if (!v.city) e.city = 'Choose your city.'
      if (v.vehicle.trim().length < 2) e.vehicle = 'Enter your vehicle make and model.'
      const y = Number(v.year)
      if (!/^\d{4}$/.test(v.year) || y < 1990 || y > thisYear + 1) e.year = `Enter a year between 1990 and ${thisYear + 1}.`
      if (v.plate.trim().length < 3) e.plate = 'Enter your licence plate.'
      if (!v.licence) e.licence = 'You need a valid driver’s licence to apply.'
      if (!v.terms) e.terms = 'Please accept the Terms and Privacy Policy.'
      return e
    },
    undefined,
    state
  )

  if (status === 'success') {
    return (
      <SuccessPanel title="Thanks, we have your details." onReset={reset} resetLabel="Submit another application">
        We will be in touch.
      </SuccessPanel>
    )
  }

  return (
    <form noValidate onSubmit={handleSubmit} aria-label="Driver application" className="grid gap-6 md:grid-cols-2">
      <TextField label="Full name" autoComplete="name" {...field('fullName')} className="md:col-span-2" />
      <TextField label="Mobile number" type="tel" inputMode="tel" autoComplete="tel" placeholder="+27 00 000 0000" {...field('mobile')} />
      <TextField label="Email" type="email" autoComplete="email" {...field('email')} />
      <SelectField label="City" options={CITIES} placeholder="Choose your city" {...field('city')} />
      <TextField label="Vehicle make and model" placeholder="e.g. Toyota Corolla" {...field('vehicle')} />
      <TextField label="Vehicle year" inputMode="numeric" placeholder="e.g. 2019" {...field('year')} />
      <TextField label="Licence plate" autoComplete="off" {...field('plate')} />
      <div className="space-y-4 md:col-span-2">
        <CheckboxField {...field('licence')}>I have a valid driver’s licence</CheckboxField>
        <CheckboxField {...field('terms')}>
          I agree to the{' '}
          <Link to="terms" className="font-semibold text-green-600 underline underline-offset-2">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="privacy" className="font-semibold text-green-600 underline underline-offset-2">
            Privacy Policy
          </Link>
        </CheckboxField>
      </div>
      <div className="md:col-span-2">
        <SubmitButton loading={status === 'loading'} loadingText="Sending application…">
          Send application
        </SubmitButton>
      </div>
    </form>
  )
}
