import { describe, expect, it } from 'vitest'

import { isPortalPath } from '../lib/portal-paths'
import { buildSiteConfig, isPortalConfigured } from '../lib/site-config'
import { createDemoApi } from './demo-api'
import { portalApplicationSchema } from './schemas'
import { isEditable, missingRequiredDocs, validateUpload, EMPTY_APPLICATION, DOC_KINDS, DOC_INFO } from './types'

const complete = {
  ...EMPTY_APPLICATION,
  fullName: 'Test Driver',
  mobile: '082 123 4567',
  email: 'test@example.com',
  city: '[City 1]' as const,
  vehicle: 'Toyota Corolla',
  vehicleYear: '2020',
  plate: 'ABC 123 GP',
  licenceConfirmed: true,
  termsAccepted: true,
}

describe('portal paths and config', () => {
  it('recognises portal paths only', () => {
    for (const p of ['/login', '/driver', '/driver/documents', '/admin', '/admin/applications/1']) expect(isPortalPath(p)).toBe(true)
    for (const p of ['/', '/drive', '/drive/', '/download', '/administrator', '/driverx']) expect(isPortalPath(p)).toBe(false)
  })
  it('needs both Supabase values', () => {
    expect(isPortalConfigured(buildSiteConfig({}))).toBe(false)
    expect(isPortalConfigured(buildSiteConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co' }))).toBe(false)
    expect(
      isPortalConfigured(buildSiteConfig({ NEXT_PUBLIC_SUPABASE_URL: 'https://x.supabase.co', NEXT_PUBLIC_SUPABASE_ANON_KEY: 'k' }))
    ).toBe(true)
  })
})

describe('rules', () => {
  it('only lets drivers edit while draft or needs_info', () => {
    expect(isEditable(undefined)).toBe(true)
    expect(isEditable('draft')).toBe(true)
    expect(isEditable('needs_info')).toBe(true)
    for (const s of ['submitted', 'in_review', 'approved', 'rejected'] as const) expect(isEditable(s)).toBe(false)
  })
  it('checks uploads', () => {
    expect(validateUpload({ type: 'application/pdf', size: 1000 })).toBeNull()
    expect(validateUpload({ type: 'application/zip', size: 1000 })).toMatch(/PDF/)
    expect(validateUpload({ type: 'image/png', size: 11 * 1024 * 1024 })).toMatch(/10 MB/)
    expect(validateUpload({ type: 'image/png', size: 0 })).toMatch(/empty/)
  })
  it('lists required documents still missing, ignoring rejected uploads', () => {
    const required = DOC_KINDS.filter((k) => DOC_INFO[k].required)
    expect(missingRequiredDocs([])).toEqual(required)
    const all = required.map((kind) => ({ kind, status: 'uploaded' as const }))
    expect(missingRequiredDocs(all)).toEqual([])
    expect(missingRequiredDocs([{ kind: 'licence', status: 'rejected' }, ...all.slice(1)])).toEqual(['licence'])
  })
})

describe('application schema', () => {
  it('accepts a complete application and normalises the mobile number', () => {
    const r = portalApplicationSchema.safeParse(complete)
    expect(r.success && r.data.mobile).toBe('+27821234567')
  })
  it('rejects bad details', () => {
    expect(portalApplicationSchema.safeParse({ ...complete, vehicleYear: '19' }).success).toBe(false)
    expect(portalApplicationSchema.safeParse({ ...complete, licenceConfirmed: false }).success).toBe(false)
    expect(portalApplicationSchema.safeParse({ ...complete, city: 'Other (tell us where)', otherCity: '' }).success).toBe(false)
    expect(portalApplicationSchema.safeParse({ ...complete, city: 'Other (tell us where)', otherCity: 'Somewhere' }).success).toBe(true)
  })
})

describe('demo api (development only)', () => {
  const signIn = async (email: string) => {
    const api = createDemoApi()
    await api.verifySignInCode(email, '123456')
    return api
  }

  it('rejects a bad code and gives admin only to admin emails', async () => {
    const api = createDemoApi()
    await expect(api.verifySignInCode('a@b.co', 'abc')).rejects.toThrow()
    await api.verifySignInCode('admin@b.co', '123456')
    expect((await api.getSession())?.role).toBe('admin')
    expect((await (await signIn('driver@b.co')).getSession())?.role).toBe('driver')
  })

  it('drivers cannot use admin functions', async () => {
    const api = await signIn('driver@b.co')
    await expect(api.listApplications()).rejects.toThrow('Not allowed')
    await expect(api.getAdminStats()).rejects.toThrow('Not allowed')
  })

  it('walks an application from draft to approved with notes enforced', async () => {
    const api = await signIn('walk@b.co')
    await api.saveMyApplication({ ...EMPTY_APPLICATION, fullName: 'Walk' })
    await expect(api.submitMyApplication()).rejects.toThrow('complete all required')
    const saved = await api.saveMyApplication({ ...complete, mobile: '+27821234567' })
    expect(saved.status).toBe('draft')
    expect((await api.submitMyApplication()).status).toBe('submitted')
    await expect(api.saveMyApplication(complete)).rejects.toThrow('no longer be edited')

    await api.signOut()
    await api.verifySignInCode('admin@b.co', '123456')
    await expect(api.reviewApplication(saved.id, 'rejected', ' ')).rejects.toThrow('note is required')
    expect((await api.reviewApplication(saved.id, 'needs_info', 'Upload a clearer licence')).status).toBe('needs_info')

    await api.signOut()
    await api.verifySignInCode('walk@b.co', '123456')
    expect((await api.getMyApplication())?.reviewNote).toBe('Upload a clearer licence')
    expect((await api.saveMyApplication({ ...complete, mobile: '+27821234567' })).status).toBe('needs_info')
  })
})
