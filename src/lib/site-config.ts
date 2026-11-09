/**
 * Single source of truth for everything that links this website to the
 * finished app, plus contact details. Values come from environment variables
 * (see .env.example). No store URL, phone number or email lives anywhere else.
 */

export type RawEnv = Record<string, string | undefined>

export type SiteConfig = {
  siteUrl: string | null
  googlePlayUrl: string | null
  appStoreUrl: string | null
  appDeepLink: string | null
  driverSignupUrl: string | null
  apiBaseUrl: string | null
  supportEmail: string | null
  driversEmail: string | null
  privacyEmail: string | null
  helloEmail: string | null
  supportPhone: string | null
  whatsappNumber: string | null
  social: { facebook: string | null; instagram: string | null; x: string | null }
}

/** Trim, and treat empty strings and unfilled `[brackets]` as "not set". */
const clean = (v: string | undefined): string | null => {
  const t = v?.trim()
  return t && !t.includes('[') ? t : null
}

/** Only accept absolute http(s) URLs. */
const cleanUrl = (v: string | undefined): string | null => {
  const t = clean(v)
  if (!t) return null
  try {
    const u = new URL(t)
    return u.protocol === 'http:' || u.protocol === 'https:' ? t.replace(/\/+$/, '') : null
  } catch {
    return null
  }
}

export function buildSiteConfig(env: RawEnv): SiteConfig {
  return {
    siteUrl: cleanUrl(env.NEXT_PUBLIC_SITE_URL),
    googlePlayUrl: cleanUrl(env.NEXT_PUBLIC_GOOGLE_PLAY_URL),
    appStoreUrl: cleanUrl(env.NEXT_PUBLIC_APP_STORE_URL),
    appDeepLink: cleanUrl(env.NEXT_PUBLIC_APP_DEEP_LINK),
    driverSignupUrl: cleanUrl(env.NEXT_PUBLIC_DRIVER_SIGNUP_URL),
    apiBaseUrl: cleanUrl(env.NEXT_PUBLIC_API_BASE_URL),
    supportEmail: clean(env.NEXT_PUBLIC_SUPPORT_EMAIL),
    driversEmail: clean(env.NEXT_PUBLIC_DRIVERS_EMAIL),
    privacyEmail: clean(env.NEXT_PUBLIC_PRIVACY_EMAIL),
    helloEmail: clean(env.NEXT_PUBLIC_HELLO_EMAIL),
    supportPhone: clean(env.NEXT_PUBLIC_SUPPORT_PHONE),
    whatsappNumber: clean(env.NEXT_PUBLIC_WHATSAPP_NUMBER),
    social: {
      facebook: cleanUrl(env.NEXT_PUBLIC_FACEBOOK_URL),
      instagram: cleanUrl(env.NEXT_PUBLIC_INSTAGRAM_URL),
      x: cleanUrl(env.NEXT_PUBLIC_X_URL),
    },
  }
}

export const siteConfig: SiteConfig = buildSiteConfig(import.meta.env as RawEnv)

export type StorePlatform = 'android' | 'ios'

/** Route of the smart download page. Used whenever a store URL is missing. */
export const DOWNLOAD_PATH = '/download'

/** Where a store button goes: straight to the store when its URL is set, otherwise to /download. */
export function storeHref(platform: StorePlatform, config: SiteConfig = siteConfig): string {
  // TODO: link to the finished app (set NEXT_PUBLIC_GOOGLE_PLAY_URL / NEXT_PUBLIC_APP_STORE_URL).
  const url = platform === 'android' ? config.googlePlayUrl : config.appStoreUrl
  return url ?? DOWNLOAD_PATH
}

/** Generic "Get the app" button: always the smart page, which routes by device. */
export function getAppHref(): string {
  // TODO: link to the finished app (the /download page redirects once store URLs are set).
  return DOWNLOAD_PATH
}

/** "Apply to drive": the app's driver sign-up when configured, otherwise the form on /drive. */
export function applyToDriveHref(config: SiteConfig = siteConfig): string {
  // TODO: link to the finished app (NEXT_PUBLIC_DRIVER_SIGNUP_URL, once the app has driver onboarding).
  return config.driverSignupUrl ?? '/drive#apply'
}

export const hasAnyStoreUrl = (config: SiteConfig = siteConfig) => Boolean(config.googlePlayUrl || config.appStoreUrl)

/** Whether forms run in mock mode (nothing is sent anywhere). */
export const isMockMode = (config: SiteConfig = siteConfig) => !config.apiBaseUrl

/** Absolute site URL for canonical links and the sitemap. Falls back to a loud placeholder host. */
export const FALLBACK_SITE_URL = 'https://example.com'
export const absoluteUrl = (path: string, config: SiteConfig = siteConfig) => `${config.siteUrl ?? FALLBACK_SITE_URL}${path}`

export const whatsappHref = (config: SiteConfig = siteConfig): string | null => {
  const digits = config.whatsappNumber?.replace(/\D/g, '')
  return digits ? `https://wa.me/${digits}` : null
}
export const phoneHref = (config: SiteConfig = siteConfig): string | null => {
  const n = config.supportPhone?.replace(/[^\d+]/g, '')
  return n ? `tel:${n}` : null
}
export const emailHref = (config: SiteConfig = siteConfig): string | null => (config.supportEmail ? `mailto:${config.supportEmail}` : null)

export const mailto = (address: string | null): string | null => (address ? `mailto:${address}` : null)
