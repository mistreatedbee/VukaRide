import { zodResolver } from '@hookform/resolvers/zod'
import { useState } from 'react'
import { useForm, useWatch } from 'react-hook-form'

import { FormIdContext, SelectField, TextField } from '../../components/forms/fields'
import { Button } from '../../components/ui'
import { usePortal } from '../auth'
import { bankSchema, profileSchema, type BankFormData, type BankFormInput, type ProfileFormData, type ProfileFormInput } from '../schemas'
import { ACCOUNT_TYPES, BANKS, type BankDetails } from '../types'
import { Card, formatDate, Loaded, Notice, PageTitle, useLoad } from '../ui'

type Message = { tone: 'good' | 'bad'; text: string } | null

function ProfileForm({ initial, email, onSaved }: { initial: { fullName: string; phone: string }; email: string; onSaved: () => void }) {
  const { api } = usePortal()
  const { register, handleSubmit, formState } = useForm<ProfileFormInput, unknown, ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: initial,
  })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Message>(null)
  const { errors } = formState
  const save = handleSubmit(async (v) => {
    setBusy(true)
    setMsg(null)
    try {
      await api.saveMyProfile(v)
      setMsg({ tone: 'good', text: 'Profile saved.' })
      onSaved()
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setBusy(false)
    }
  })
  return (
    <FormIdContext.Provider value="profile">
      <form onSubmit={save} noValidate aria-label="Your profile" className="space-y-5">
        <TextField label="Full name" autoComplete="name" error={errors.fullName?.message} {...register('fullName')} />
        <TextField
          label="Mobile number"
          type="tel"
          inputMode="tel"
          autoComplete="tel"
          optional
          hint="South African number, for example 082 123 4567."
          error={errors.phone?.message}
          {...register('phone')}
        />
        <div>
          <p className="text-sm font-semibold text-ink">Email address</p>
          <p className="mt-1 text-slate">{email}</p>
          <p className="mt-1 text-sm text-slate">This is how you sign in, so it cannot be changed here.</p>
        </div>
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : 'Save profile'}
        </Button>
      </form>
    </FormIdContext.Provider>
  )
}

function BankForm({ initial, onSaved }: { initial: BankDetails | null; onSaved: () => void }) {
  const { api } = usePortal()
  const known = initial ? BANKS.find((b) => b === initial.bankName) : undefined
  const { register, handleSubmit, control, formState } = useForm<BankFormInput, unknown, BankFormData>({
    resolver: zodResolver(bankSchema),
    defaultValues: {
      accountHolder: initial?.accountHolder ?? '',
      bank: initial ? (known ?? 'Other (type the name)') : '',
      otherBank: initial && !known ? initial.bankName : '',
      accountType: initial?.accountType,
      accountNumber: initial?.accountNumber ?? '',
      branchCode: initial?.branchCode ?? '',
    },
  })
  const bank = useWatch({ control, name: 'bank' })
  const [busy, setBusy] = useState(false)
  const [msg, setMsg] = useState<Message>(null)
  const { errors } = formState
  const save = handleSubmit(async (v) => {
    setBusy(true)
    setMsg(null)
    try {
      await api.saveMyBankDetails({
        accountHolder: v.accountHolder,
        bankName: v.bank.startsWith('Other') ? (v.otherBank ?? '').trim() : v.bank,
        accountType: v.accountType,
        accountNumber: v.accountNumber,
        branchCode: v.branchCode,
      })
      setMsg({ tone: 'good', text: 'Bank details saved.' })
      onSaved()
    } catch (e) {
      setMsg({ tone: 'bad', text: e instanceof Error ? e.message : 'Something went wrong.' })
    } finally {
      setBusy(false)
    }
  })
  return (
    <FormIdContext.Provider value="bank">
      <form onSubmit={save} noValidate aria-label="Bank details" className="space-y-5">
        <TextField
          label="Name on the account"
          hint="It must be your own account."
          error={errors.accountHolder?.message}
          {...register('accountHolder')}
        />
        <SelectField label="Bank" options={BANKS} error={errors.bank?.message} {...register('bank')} />
        {bank?.startsWith('Other') && <TextField label="Bank name" error={errors.otherBank?.message} {...register('otherBank')} />}
        <SelectField
          label="Account type"
          options={Object.values(ACCOUNT_TYPES)}
          error={errors.accountType?.message}
          {...registerType(register)}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Account number"
            inputMode="numeric"
            autoComplete="off"
            error={errors.accountNumber?.message}
            {...register('accountNumber')}
          />
          <TextField
            label="Branch code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={8}
            error={errors.branchCode?.message}
            {...register('branchCode')}
          />
        </div>
        {initial?.updatedAt && <p className="text-sm text-slate">Last changed {formatDate(initial.updatedAt)}.</p>}
        {msg && <Notice tone={msg.tone}>{msg.text}</Notice>}
        <Button type="submit" disabled={busy}>
          {busy ? 'Saving…' : initial ? 'Update bank details' : 'Save bank details'}
        </Button>
      </form>
    </FormIdContext.Provider>
  )
}

/** The select shows readable labels but the form stores the account type key. */
function registerType(register: ReturnType<typeof useForm<BankFormInput, unknown, BankFormData>>['register']) {
  const r = register('accountType', {
    setValueAs: (label: string) =>
      (Object.entries(ACCOUNT_TYPES).find(([, l]) => l === label)?.[0] ?? label) as BankFormInput['accountType'],
  })
  return r
}

export default function Profile() {
  const { api, session } = usePortal()
  const result = useLoad(async () => ({ profile: await api.getMyProfile(), bank: await api.getMyBankDetails() }), [api])
  return (
    <>
      <PageTitle title="Your profile" intro="Keep your details up to date. We only use your bank details to pay you." />
      <Loaded result={result}>
        {({ profile, bank }) => (
          <div className="mt-8 grid max-w-5xl gap-6 lg:grid-cols-2">
            <Card aria-labelledby="profile-h">
              <h2 id="profile-h" className="text-lg font-semibold text-deep">
                About you
              </h2>
              <div className="mt-5">
                <ProfileForm initial={profile} email={session.email} onSaved={result.reload} />
              </div>
            </Card>
            <Card aria-labelledby="bank-h">
              <h2 id="bank-h" className="text-lg font-semibold text-deep">
                Bank details for payouts
              </h2>
              <p className="mt-2 text-sm leading-[1.7] text-slate">
                Only you and the Vuka Ride team can see these, and each time the team opens them it is logged. Changes are logged too. Never
                send your bank details by email or WhatsApp. We will not ask for your PIN or password.
              </p>
              <div className="mt-5">
                <BankForm initial={bank} onSaved={result.reload} />
              </div>
            </Card>
          </div>
        )}
      </Loaded>
    </>
  )
}
