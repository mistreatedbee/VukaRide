import { describe, expect, it } from 'vitest'

import { applyToDriveHref, buildSiteConfig, emailHref, hasAnyStoreUrl, isMockMode, phoneHref, storeHref, whatsappHref } from './site-config'

const empty = buildSiteConfig({})

describe('buildSiteConfig', () => {
  it('treats empty values and unfilled [brackets] as not set', () => {
    const c = buildSiteConfig({
      NEXT_PUBLIC_SITE_URL: 'https://[YOUR-DOMAIN]',
      NEXT_PUBLIC_GOOGLE_PLAY_URL: '  ',
      NEXT_PUBLIC_SUPPORT_EMAIL: '[email]',
    })
    expect(c.siteUrl).toBeNull()
    expect(c.googlePlayUrl).toBeNull()
    expect(c.supportEmail).toBeNull()
  })
  it('rejects non-http URLs and strips trailing slashes', () => {
    expect(buildSiteConfig({ NEXT_PUBLIC_APP_STORE_URL: 'javascript:alert(1)' }).appStoreUrl).toBeNull()
    expect(buildSiteConfig({ NEXT_PUBLIC_SITE_URL: 'https://vukaride.co.za/' }).siteUrl).toBe('https://vukaride.co.za')
  })
})

describe('store links', () => {
  it('points to /download while a store URL is empty', () => {
    expect(storeHref('android', empty)).toBe('/download')
    expect(storeHref('ios', empty)).toBe('/download')
    expect(hasAnyStoreUrl(empty)).toBe(false)
  })
  it('goes straight to the store once the URL is set', () => {
    const c = buildSiteConfig({ NEXT_PUBLIC_GOOGLE_PLAY_URL: 'https://play.google.com/store/apps/details?id=x' })
    expect(storeHref('android', c)).toBe('https://play.google.com/store/apps/details?id=x')
    expect(storeHref('ios', c)).toBe('/download')
    expect(hasAnyStoreUrl(c)).toBe(true)
  })
  it('apply-to-drive defaults to the on-site form and can be overridden', () => {
    expect(applyToDriveHref(empty)).toBe('/drive#apply')
    expect(applyToDriveHref(buildSiteConfig({ NEXT_PUBLIC_DRIVER_SIGNUP_URL: 'https://app.example/drive' }))).toBe(
      'https://app.example/drive'
    )
  })
})

describe('mock mode and contact links', () => {
  it('is mock mode until the API base URL is set', () => {
    expect(isMockMode(empty)).toBe(true)
    expect(isMockMode(buildSiteConfig({ NEXT_PUBLIC_API_BASE_URL: 'https://api.example.com' }))).toBe(false)
  })
  it('accepts a same-origin /api base and rejects odd values', () => {
    expect(buildSiteConfig({ NEXT_PUBLIC_API_BASE_URL: '/api' }).apiBaseUrl).toBe('/api')
    expect(buildSiteConfig({ NEXT_PUBLIC_API_BASE_URL: '/api/' }).apiBaseUrl).toBe('/api')
    expect(buildSiteConfig({ NEXT_PUBLIC_API_BASE_URL: '//evil.test' }).apiBaseUrl).toBeNull()
    expect(buildSiteConfig({ NEXT_PUBLIC_API_BASE_URL: 'javascript:alert(1)' }).apiBaseUrl).toBeNull()
  })
  it('builds mailto, tel and WhatsApp links only when set', () => {
    expect(emailHref(empty)).toBeNull()
    const c = buildSiteConfig({
      NEXT_PUBLIC_SUPPORT_EMAIL: 'help@x.co.za',
      NEXT_PUBLIC_SUPPORT_PHONE: '+27 82 123 4567',
      NEXT_PUBLIC_WHATSAPP_NUMBER: '+27 82 123 4567',
    })
    expect(emailHref(c)).toBe('mailto:help@x.co.za')
    expect(phoneHref(c)).toBe('tel:+27821234567')
    expect(whatsappHref(c)).toBe('https://wa.me/27821234567')
  })
})
