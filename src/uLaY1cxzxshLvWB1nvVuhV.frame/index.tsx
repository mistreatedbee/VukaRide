import React from 'react'

import { Route } from '../shared/nav'
import { PageShell, PageHero } from '../shared/components/PageShell'
import { Placeholder } from '../shared/components/ui'
import { DeleteAccountForm } from '../shared/forms/DeleteAccountForm'

export const args = {
  formState: 'default',
}

export const argTypes = {
  formState: { control: 'select', options: ['default', 'errors', 'loading', 'success'] },
}

type Props = Partial<typeof args> & { onNavigate?: (to: Route) => void }

const IN_APP_STEPS = ['Open the Vuka Ride app and sign in.', 'Go to Profile, then Settings.', 'Tap Delete account.', 'Confirm. [Confirm the exact in-app path]']

export default function DeleteAccount(props: Props) {
  const { formState, onNavigate } = { ...args, ...props }

  return (
    <PageShell current="delete-account" onNavigate={onNavigate}>
      <PageHero eyebrow="Your account" title="Delete your account" intro="You can delete your Vuka Ride account and the data linked to it at any time, from the app or with the form on this page." />

      <section aria-label="How to delete your account" className="py-12 lg:py-20">
        <div className="container-vuka grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">In the app</h2>
            <ol className="mt-6 space-y-4">
              {IN_APP_STEPS.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink" aria-hidden="true">
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-[1.6] text-ink">{s}</span>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 text-2xl font-bold text-deep sm:text-[28px]">What happens to your data</h2>
            <div className="mt-4 space-y-4 leading-[1.7] text-slate">
              <p>When your account is deleted, your profile, saved places and sign-in details are removed.</p>
              <p>
                Some records may be kept for a limited time where the law requires it, such as trip and payment records.{' '}
                <Placeholder>[Add which data is retained, for how long, and why]</Placeholder>
              </p>
            </div>
          </div>

          <div className="rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10">
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Cannot use the app?</h2>
            <p className="mt-2 leading-[1.7] text-slate">Send us a request and we will delete the account for you.</p>
            <div className="mt-8" key={formState}>
              <DeleteAccountForm state={formState as 'default'} />
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  )
}
