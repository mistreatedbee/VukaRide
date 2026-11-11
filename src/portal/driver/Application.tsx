import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { FormProvider, useForm, useWatch } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { CheckboxField, FormIdContext, SelectField, TextField } from '../../components/forms/fields'
import { Button } from '../../components/ui'
import { CITIES } from '../../lib/schemas'
import { normaliseSaMobile } from '../../lib/phone'
import { usePortal } from '../auth'
import { portalApplicationSchema, type PortalApplicationData, type PortalApplicationInput } from '../schemas'
import { EMPTY_APPLICATION, isEditable, missingRequiredDocs, STATUS_HELP, type Application, type ApplicationInput } from '../types'
import { Card, Loaded, Notice, PageTitle, StatusBadge, useLoad } from '../ui'

const toInput = (a: Application | null, email: string): ApplicationInput => ({ ...EMPTY_APPLICATION, email, ...(a ?? {}) })

function Form({ app, email, missingDocs, onSaved }: { app: Application | null; email: string; missingDocs: number; onSaved: () => void }) {
  const { api } = usePortal()
  const navigate = useNavigate()
  const editable = isEditable(app?.status)
  const defaults = toInput(app, email)
  const methods = useForm<PortalApplicationInput, unknown, PortalApplicationData>({
    resolver: zodResolver(portalApplicationSchema),
    defaultValues: { ...defaults, city: (defaults.city || undefined) as PortalApplicationInput['city'] },
  })
  const { register, handleSubmit, getValues, control, formState } = methods
  const { errors } = formState
  const [busy, setBusy] = useState<'draft' | 'submit' | null>(null)
  const [message, setMessage] = useState<{ tone: 'good' | 'bad'; text: string } | null>(null)
  const city = useWatch({ control, name: 'city' })

  const draftInput = (): ApplicationInput => {
    const v = getValues()
    return {
      fullName: v.fullName ?? '',
      mobile: normaliseSaMobile(v.mobile ?? '') ?? v.mobile ?? '',
      email: v.email ?? '',
      city: v.city ?? '',
      otherCity: v.otherCity ?? '',
      vehicle: v.vehicle ?? '',
      vehicleYear: v.vehicleYear ?? '',
      plate: v.plate ?? '',
      licenceConfirmed: Boolean(v.licenceConfirmed),
      termsAccepted: Boolean(v.termsAccepted),
    }
  }

  const saveDraft = async () => {
    setBusy('draft')
    setMessage(null)
    try {
      await api.saveMyApplication(draftInput())
      onSaved()
      setMessage({ tone: 'good', text: 'Draft saved.' })
    } catch (e) {
      setMessage({ tone: 'bad', text: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setBusy(null)
    }
  }

  const submit = handleSubmit(async (data) => {
    if (missingDocs > 0) {
      setMessage({ tone: 'bad', text: `Upload your required documents first (${missingDocs} still to add).` })
      return
    }
    setBusy('submit')
    setMessage(null)
    try {
      await api.saveMyApplication({ ...draftInput(), mobile: data.mobile })
      await api.submitMyApplication()
      navigate('/driver')
    } catch (e) {
      setMessage({ tone: 'bad', text: e instanceof Error ? e.message : 'Something went wrong.' })
      setBusy(null)
    }
  })

  const lock = !editable || busy !== null
  return (
    <FormProvider {...methods}>
      <FormIdContext.Provider value="app">
        <form onSubmit={submit} noValidate aria-label="Driver application" className="space-y-6">
          <fieldset disabled={!editable} className="space-y-5">
            <legend className="text-lg font-semibold text-deep">About you</legend>
            <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Mobile number"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                hint="South African number, for example 082 123 4567."
                error={errors.mobile?.message}
                {...register('mobile')}
              />
              <TextField label="Email address" type="email" autoComplete="email" error={errors.email?.message} {...register('email')} />
            </div>
            <SelectField label="City" options={CITIES} error={errors.city?.message} {...register('city')} />
            {city === 'Other (tell us where)' && (
              <TextField label="Which city or town?" error={errors.otherCity?.message} {...register('otherCity')} />
            )}
          </fieldset>

          <fieldset disabled={!editable} className="space-y-5">
            <legend className="text-lg font-semibold text-deep">Your car</legend>
            <TextField label="Make and model" hint="For example Toyota Corolla." error={errors.vehicle?.message} {...register('vehicle')} />
            <div className="grid gap-5 sm:grid-cols-2">
              <TextField label="Year" inputMode="numeric" maxLength={4} error={errors.vehicleYear?.message} {...register('vehicleYear')} />
              <TextField label="Licence plate" autoCapitalize="characters" error={errors.plate?.message} {...register('plate')} />
            </div>
          </fieldset>

          <fieldset disabled={!editable} className="space-y-4">
            <legend className="sr-only">Confirmations</legend>
            <CheckboxField error={errors.licenceConfirmed?.message} {...register('licenceConfirmed')}>
              I have a valid South African driver’s licence.
            </CheckboxField>
            <CheckboxField error={errors.termsAccepted?.message} {...register('termsAccepted')}>
              I accept the{' '}
              <a
                href="/terms"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 underline underline-offset-2"
              >
                Terms
              </a>{' '}
              and{' '}
              <a
                href="/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-semibold text-green-600 underline underline-offset-2"
              >
                Privacy Policy
              </a>
              .
            </CheckboxField>
          </fieldset>

          {message && <Notice tone={message.tone}>{message.text}</Notice>}
          {editable ? (
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline-light"
                onClick={() => void saveDraft()}
                disabled={lock}
                className="border-green-600 text-green-700 hover:bg-green-50"
              >
                {busy === 'draft' ? 'Saving…' : 'Save draft'}
              </Button>
              <Button type="submit" disabled={lock}>
                {busy === 'submit' ? 'Sending…' : 'Send for review'}
              </Button>
            </div>
          ) : (
            <Notice tone="info">
              Your application is with our team, so it is read only for now. If we need more from you, it will open again.
            </Notice>
          )}
        </form>
      </FormIdContext.Provider>
    </FormProvider>
  )
}

export default function Application() {
  const { api, session } = usePortal()
  const result = useLoad(async () => ({ app: await api.getMyApplication(), docs: await api.listMyDocuments() }), [api])

  return (
    <>
      <PageTitle
        title="Your application"
        intro="Tell us about you and your car. You can save a draft and come back any time before you send it."
      />
      <Loaded result={result}>
        {({ app, docs }) => {
          const current = app
          return (
            <div className="mt-8 max-w-2xl">
              {current && (
                <div className="mb-6 flex flex-wrap items-center gap-3">
                  <StatusBadge status={current.status} />
                  <span className="text-sm text-slate">{STATUS_HELP[current.status]}</span>
                </div>
              )}
              {current?.reviewNote && (
                <div className="mb-6">
                  <Notice tone={current.status === 'rejected' ? 'bad' : 'warn'} title="Note from the Vuka Ride team">
                    {current.reviewNote}
                  </Notice>
                </div>
              )}
              <Card>
                <Form
                  key={current?.updatedAt ?? 'new'}
                  app={current}
                  email={session.email}
                  missingDocs={missingRequiredDocs(docs).length}
                  onSaved={result.reload}
                />
              </Card>
            </div>
          )
        }}
      </Loaded>
    </>
  )
}
