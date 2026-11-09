import { useEffect, useState, useSyncExternalStore } from 'react'
import { Download as DownloadIcon, QrCode, Smartphone } from 'lucide-react'

import { PatternBackground } from '../components/brand/PatternBackground'
import { NotifyForm } from '../components/forms/NotifyForm'
import { PageHero } from '../components/PageShell'
import { detectPlatform, type Platform } from '../lib/os'
import { hasAnyStoreUrl, siteConfig } from '../lib/site-config'

const STORES = [
  { platform: 'android', small: 'Get it on', big: 'Google Play', url: () => siteConfig.googlePlayUrl },
  { platform: 'ios', small: 'Download on the', big: 'App Store', url: () => siteConfig.appStoreUrl },
] as const

const BTN = 'inline-flex min-h-[52px] items-center gap-3 rounded-[14px] bg-white px-4 py-2 text-ink shadow-sm hover:brightness-95'

function StoreButton({ s }: { s: (typeof STORES)[number] }) {
  const url = s.url()
  const inner = (
    <>
      <DownloadIcon className="size-5 text-green-600" aria-hidden="true" />
      <span className="flex flex-col text-left leading-tight">
        <span className="text-[11px] font-medium text-slate">{url ? s.small : 'Coming soon on'}</span>
        <span className="text-[15px] font-semibold whitespace-nowrap">{s.big}</span>
      </span>
    </>
  )
  return url ? (
    <a href={url} className={BTN} rel="noopener noreferrer" aria-label={`${s.small} ${s.big}`}>
      {inner}
    </a>
  ) : (
    <span className={`${BTN} cursor-default opacity-80 hover:brightness-100`}>{inner}</span>
  )
}

/** QR code for the /download page itself, so a phone scan lands on the right store. Only built when a store URL exists. */
function DownloadQr() {
  const [src, setSrc] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    const target = `${siteConfig.siteUrl ?? window.location.origin}/download`
    // Loaded on demand: the library is only needed on this page.
    void import('qrcode')
      .then(({ toDataURL }) => toDataURL(target, { margin: 1, width: 220, color: { dark: '#064E2B', light: '#FFFFFF' } }))
      .then((u) => !cancelled && setSrc(u))
    return () => {
      cancelled = true
    }
  }, [])
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex size-[220px] items-center justify-center rounded-2xl bg-white p-2">
        {src ? (
          <img src={src} width={204} height={204} alt="QR code that opens the Vuka Ride download page on your phone" />
        ) : (
          <QrCode className="size-16 text-green-300" aria-hidden="true" />
        )}
      </div>
      <p className="text-sm text-leaf">Scan with your phone camera</p>
    </div>
  )
}

export default function Download() {
  // null on the server and during hydration, the real platform afterwards.
  const platform = useSyncExternalStore<Platform | null>(
    () => () => {},
    () => detectPlatform(navigator.userAgent, navigator.maxTouchPoints),
    () => null
  )
  const live = hasAnyStoreUrl()

  useEffect(() => {
    // Phones go straight to their store when its URL is set.
    const target = platform === 'android' ? siteConfig.googlePlayUrl : platform === 'ios' ? siteConfig.appStoreUrl : null
    // TODO: link to the finished app (set the store URLs in the environment).
    if (target) window.location.replace(target)
  }, [platform])

  return (
    <>
      <PageHero
        eyebrow="Get the app"
        title={live ? 'Download Vuka Ride' : 'Vuka Ride is coming soon.'}
        intro={
          live
            ? 'Get the app on your phone and rise to your next trip.'
            : 'The app is not in the stores just yet. Leave your details and we will tell you the moment it is ready.'
        }
      />

      <section className="relative overflow-hidden bg-brand py-14 lg:py-20" aria-label="Download options">
        <PatternBackground pattern="road" tone="dark" />
        <div className="container-vuka relative mx-auto grid max-w-4xl items-center gap-12 lg:grid-cols-2">
          <div className="flex flex-col items-start gap-5">
            <div className="flex flex-wrap gap-3">
              {STORES.map((s) => (
                <StoreButton key={s.platform} s={s} />
              ))}
            </div>
            {live && platform && platform !== 'desktop' && (
              <p className="text-leaf" aria-live="polite">
                Taking you to {platform === 'android' ? 'Google Play' : 'the App Store'}. If nothing happens, tap the button above.
              </p>
            )}
            {siteConfig.appDeepLink && (
              <a
                href={siteConfig.appDeepLink}
                className="inline-flex min-h-11 items-center gap-2 font-semibold text-sun underline underline-offset-4"
              >
                <Smartphone className="size-5" aria-hidden="true" />
                Already have the app? Open Vuka Ride
              </a>
            )}
          </div>

          {live ? (
            platform === 'desktop' && <DownloadQr />
          ) : (
            <div className="rounded-[28px] bg-white p-6 sm:p-8">
              <h2 className="text-2xl font-bold text-deep">Get launch news</h2>
              <p className="mt-2 mb-6 leading-[1.7] text-slate">Add your email, your WhatsApp number, or both.</p>
              <NotifyForm />
            </div>
          )}
        </div>
      </section>
    </>
  )
}
