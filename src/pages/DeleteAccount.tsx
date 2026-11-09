import { Bracketed } from '../components/Bracketed'
import { DeleteAccountForm } from '../components/forms/DeleteAccountForm'
import { PageHero } from '../components/PageShell'
import { emailHref, siteConfig } from '../lib/site-config'

const IN_APP_STEPS = [
  'Open the Vuka Ride app and sign in.',
  '[Settings > Account > Delete account. Confirm with the real path in your app.]',
]

export default function DeleteAccount() {
  const email = emailHref()
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
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">In the app</h2>
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
            <p className="mt-4 leading-[1.7] text-slate">
              <Bracketed text="[List what is deleted: profile, saved places, ...]" />
            </p>

            <h2 className="mt-10 text-2xl font-bold text-deep sm:text-[28px]">What we keep, and why</h2>
            <p className="mt-4 leading-[1.7] text-slate">
              <Bracketed text="[Trip and payment records kept for X years for legal, tax or fraud reasons.]" />
            </p>

            <h2 className="mt-10 text-2xl font-bold text-deep sm:text-[28px]">How long it takes</h2>
            <p className="mt-4 leading-[1.7] text-slate">
              <Bracketed text="[Number of days.]" />
            </p>
          </div>

          <div className="h-fit rounded-[28px] border border-green-100 bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-10">
            <h2 className="text-2xl font-bold text-deep sm:text-[28px]">Cannot use the app?</h2>
            <p className="mt-2 leading-[1.7] text-slate">
              Send us a request below, or email{' '}
              {email ? (
                <a href={email} className="font-semibold text-green-600 underline underline-offset-2">
                  {siteConfig.supportEmail}
                </a>
              ) : (
                <Bracketed text="[support email]" />
              )}{' '}
              from the address on your account. We may ask you to confirm your identity.
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
