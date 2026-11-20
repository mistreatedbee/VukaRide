import { useEffect } from 'react'
import { LockKeyhole, Mail, Phone } from 'lucide-react'

import { VukaLogo } from '../components/brand/VukaMark'
import { mailto, siteConfig } from '../lib/site-config'

export default function WebsiteLocked() {
  useEffect(() => {
    document.title = 'Website Temporarily Locked | Vuka Ride'
  }, [])

  const supportEmail = siteConfig.supportEmail ?? 'ashleymashigo013@gmail.com'
  const supportPhone = siteConfig.supportPhone ?? '073 153 1188'

  return (
    <main className="relative min-h-screen overflow-hidden bg-brand text-white">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.08]"
        aria-hidden="true"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='72' height='72' viewBox='0 0 72 72' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23fff' stroke-width='1'%3E%3Cpath d='M36 72L72 36M72 72L72 36M36 36L72 72M36 0L72 36M0 36L36 72M0 72L36 36M0 0L36 36M36 36L72 0M36 36L72 72M36 36L0 72M36 36L0 0M36 36L36 72M36 36L36 0'/%3E%3C/g%3E%3C/svg%3E\")",
        }}
      />

      <div className="relative mx-auto flex min-h-screen w-full max-w-[1328px] flex-col px-5 py-6 sm:px-8 lg:px-16 lg:py-8">
        <header className="flex h-14 items-center" aria-label="Vuka Ride">
          <VukaLogo theme="dark" size={34} />
        </header>

        <section className="flex flex-1 items-center justify-center py-10 sm:py-16" aria-labelledby="locked-title">
          <div className="w-full max-w-2xl rounded-[28px] border border-white/15 bg-night/95 px-6 py-9 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.55)] sm:px-12 sm:py-12">
            <div className="mx-auto flex items-center justify-center gap-5">
              <VukaLogo theme="dark" size={30} />
              <span className="h-12 w-px bg-white/20" aria-hidden="true" />
              <img
                src="/images/nextwave-digital-logo.jpeg"
                width={48}
                height={48}
                alt="NextWave Digital Solutions"
                className="size-12 rounded-full object-cover"
              />
            </div>

            <div className="mx-auto mt-7 flex size-16 items-center justify-center rounded-2xl bg-sun text-night shadow-lg">
              <LockKeyhole className="size-8" aria-hidden="true" />
            </div>

            <p className="eyebrow mt-7 text-sun">VukaRide</p>
            <h1 id="locked-title" className="mt-3 text-[34px] leading-[1.1] font-bold tracking-[-0.02em] sm:text-[48px]">
              Website Temporarily Locked
            </h1>

            <div className="mx-auto mt-6 max-w-xl space-y-4 text-base leading-[1.75] text-leaf sm:text-lg">
              <p>This website is temporarily unavailable due to an outstanding payment.</p>
              <p>Access to the website will be restored once the outstanding payment has been received and confirmed.</p>
              <p>If you have already made the payment, please allow some time for your payment to be confirmed.</p>
            </div>

            {supportEmail ? (
              <a
                href={mailto(supportEmail) ?? '#'}
                className="mx-auto mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sun px-6 font-semibold text-ink transition-[filter] hover:brightness-105"
              >
                <Mail className="size-5" aria-hidden="true" />
                Contact Support
              </a>
            ) : (
              <button
                type="button"
                disabled
                className="mx-auto mt-8 inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-sun/70 px-6 font-semibold text-ink"
              >
                <Mail className="size-5" aria-hidden="true" />
                Contact Support
              </button>
            )}

            <p className="mt-5 text-sm text-leaf">
              Support:{' '}
              {supportEmail ? (
                <a
                  className="font-semibold text-white underline decoration-white/40 underline-offset-4 hover:decoration-white"
                  href={mailto(supportEmail) ?? '#'}
                >
                  {supportEmail}
                </a>
              ) : (
                <span>[Support email]</span>
              )}
            </p>

            <div className="mt-4 flex justify-center gap-4">
              <a
                href="tel:+27731531188"
                className="inline-flex items-center gap-2 rounded-full bg-sun px-4 py-2 text-ink transition-all hover:brightness-105"
              >
                <Phone className="size-5" aria-hidden="true" />
                {supportPhone}
              </a>
            </div>

            <p className="mt-7 border-t border-white/10 pt-6 text-sm font-medium leading-6 text-white/75">
              If payment is not received by 30 November 2026, the Website and App will be sold.
            </p>
          </div>
        </section>
      </div>
    </main>
  )
}
