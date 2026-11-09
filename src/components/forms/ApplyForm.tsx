import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link } from 'react-router-dom'

import { CITIES, driverApplicationSchema, type DriverApplicationData, type DriverApplicationInput } from '../../lib/schemas'
import { CheckboxField, Honeypot, SelectField, TextField } from './fields'
import { FormFrame, SubmitButton, SuccessPanel, useSubmission } from './FormFrame'

export function ApplyForm() {
  const { register, handleSubmit, reset, formState } = useForm<DriverApplicationInput, unknown, DriverApplicationData>({
    resolver: zodResolver(driverApplicationSchema),
    defaultValues: {
      fullName: '',
      mobile: '',
      email: '',
      city: undefined,
      otherCity: '',
      vehicle: '',
      year: '',
      plate: '',
      licence: false,
      terms: false,
      website: '',
    },
  })
  const sub = useSubmission('driver-application')
  const { errors } = formState
  const submit = handleSubmit(sub.send)

  if (sub.status === 'success') {
    return (
      <SuccessPanel
        title="Thanks, we have your details."
        mock={sub.mock}
        onReset={() => {
          reset()
          sub.reset()
        }}
        resetLabel="Submit another application"
      >
        We will be in touch.
      </SuccessPanel>
    )
  }

  return (
    <FormFrame
      kind="driver-application"
      label="Driver application"
      onSubmit={submit}
      errors={errors}
      submitCount={formState.submitCount}
      status={sub.status}
      message={sub.message}
      onRetry={() => void submit()}
      className="grid gap-6 md:grid-cols-2"
    >
      <TextField
        label="Full name"
        autoComplete="name"
        className="md:col-span-2"
        error={errors.fullName?.message}
        {...register('fullName')}
      />
      <TextField
        label="Mobile number"
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="082 123 4567"
        hint="South African mobile number, with 0 or +27."
        error={errors.mobile?.message}
        {...register('mobile')}
      />
      <TextField label="Email" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
      <SelectField label="City" options={CITIES} placeholder="Choose your city" error={errors.city?.message} {...register('city')} />
      <TextField
        label="If you chose Other, where are you?"
        optional
        autoComplete="address-level2"
        error={errors.otherCity?.message}
        {...register('otherCity')}
      />
      <TextField
        label="Vehicle make and model"
        placeholder="e.g. Toyota Corolla"
        error={errors.vehicle?.message}
        {...register('vehicle')}
      />
      <TextField label="Vehicle year" inputMode="numeric" placeholder="e.g. 2019" error={errors.year?.message} {...register('year')} />
      <TextField label="Licence plate" autoComplete="off" error={errors.plate?.message} {...register('plate')} />
      <div className="space-y-4 md:col-span-2">
        <CheckboxField error={errors.licence?.message} {...register('licence')}>
          I have a valid driver’s licence
        </CheckboxField>
        <CheckboxField error={errors.terms?.message} {...register('terms')}>
          I agree to the{' '}
          <Link to="/terms" className="font-semibold text-green-600 underline underline-offset-2">
            Terms
          </Link>{' '}
          and{' '}
          <Link to="/privacy" className="font-semibold text-green-600 underline underline-offset-2">
            Privacy Policy
          </Link>
        </CheckboxField>
      </div>
      <Honeypot {...register('website')} />
      <div className="md:col-span-2">
        <SubmitButton loading={sub.status === 'submitting'}>Send application</SubmitButton>
      </div>
    </FormFrame>
  )
}
