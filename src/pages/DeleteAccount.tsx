import { Bracketed } from '../components/Bracketed'
import { DataTable } from '../components/DataTable'
import { DeleteAccountForm } from '../components/forms/DeleteAccountForm'
import { PageHero } from '../components/PageShell'
import { RETENTION_ROWS } from '../content/legal'
import { mailto, siteConfig } from '../lib/site-config'

const IN_APP_STEPS = [
  'Open the Vuka Ride app and sign in.',
  'Go to Profile, then Settings, then Account, then Delete account. Confirm with a code or password. [Confirm this is the real path in the app.]',
]

const DELETED = [
  'Name, profile photo, email and phone number',
  'Saved places (home, work)',
  'Saved payment methods (tokens held with the payment provider are removed)',
  'Device identifiers and notification tokens',
  'Marketing preferences',
]

export default function DeleteAccount() {
  const privacy = siteConfig.privacyEmail
  return (
    <>
      <PageHero
        eyebrow="Your account"
        title="Delete your Vuka Ride account"
        intro="You can ask us to delete your Vuka Ride account and the data linked to it at any time. You do not need to sign in to use this page."
      />

      <section aria-label="How to delete your account" className="py-12 lg:py-20">
        <div className="container-vuka grid gap-12 lg:grid-cols-2 lg:gap-20">
          <div>
            <p className="leading-[1.7] text-slate">
              <Bracketed text="Vuka Ride is run by [Registered company name]." />
            </p>

            <h2 className="mt-10 text-2xl font-bold text-deep sm:text-[28px]">In the app</h2>
            <ol className="mt-6 space-y-4">
              {IN_APP_STEPS.map((s, i) => (
                <li key={s} className="flex gap-4">
                  <span
                    className="inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-sun text-sm font-bold text-ink"
                    aria-hidden="true"
                  >
                    {i + 1}
                  </span>
                  <span className="pt-1 leading-[1.6] text-ink">
                    <span className="sr-only">Step {i + 1}: </span>
                    <Bracketed text={s} />
                  </span>
                </li>
              ))}
            </ol>

            <h2 className="mt-12 text-2xl font-bold text-deep sm:text-[28px]">What gets deleted</h2>
            <p className="mt-4 leading-[1.7] text-slate">Within 30 days of a verified request, we delete:</p>
            <ul className="mt-3 list-disc space-y-2 pl-6 leading-[1.6] text-ink">
              {DELETED.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>

            <h2 className="mt-10 text-2xl font-bold text-deep sm:text-[28px]">What we keep, and why</h2>
            <p className="mt-4 mb-4 leading-[1.7] text-slate">
              <Bracketed text="Some records are kept for a limited time for legal or safety reasons. [Confirm every period with an attorney and an accountant.]" />
            </p>
            <DataTable
              caption="Data we keep after account deletion"
              head={['Data', 'Kept for', 'Why']}
              rows={RETENTION_ROWS.map((r) => r.map((c) => <Bracketed key={c} text={c} />))}
            />
            <p className="mt-4 leading-[1.7] text-slate">
              Driver accounts: we keep the compliance records the regulator requires until the period above ends.
            </p>

            <h2 className="mt-10 text-2xl font-bold text-deep sm:text-[28px]">How long it takes</h2>
            <p className="mt-4 leading-[1.7] text-slate">
              We confirm your request within 3 working days, and complete deletion within 30 days. If you have an unfinished trip, an unpaid
              balance or an open dispute, we will tell you what needs sorting first. We confirm by email once it is done.{' '}
              <Bracketed text="[Confirm these times.]" />
            </p>
          </div>

          <div className="h-fit rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10">
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Cannot use the app?</h2>
            <p className="mt-2 leading-[1.7] text-slate">
              Send us a request below, or email{' '}
              {privacy ? (
                <a href={mailto(privacy) ?? undefined} className="font-semibold text-green-600 underline underline-offset-2">
                  {privacy}
                </a>
              ) : (
                <Bracketed text="[privacy email]" />
              )}{' '}
              from the address on your account. We check that the account is yours first, with a confirmation email or an SMS code.
            </p>
            <div className="mt-8">
              <DeleteAccountForm />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
