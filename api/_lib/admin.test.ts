// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { handleEraseDriver, handleNotifyDecision } from './admin'
import type { Env } from './forms'

const env: Env = {
  SUPABASE_URL: 'https://db.example.test',
  SUPABASE_SERVICE_ROLE_KEY: 'service',
  RESEND_API_KEY: 'k',
  FORMS_FROM_EMAIL: 'Vuka <no-reply@vukaride.test>',
  NEXT_PUBLIC_SITE_URL: 'https://vukaride.test',
}
const ADMIN = '11111111-1111-4111-8111-111111111111'
const DRIVER = '22222222-2222-4222-8222-222222222222'
const APP = '33333333-3333-4333-8333-333333333333'

const jwt = (aal: string) => `h.${Buffer.from(JSON.stringify({ aal })).toString('base64url')}.s`
const req = (path: string, body: unknown, token: string | null = jwt('aal2'), method = 'POST') =>
  new Request(`https://vukaride.test/api/admin/${path}`, {
    method,
    headers: { 'content-type': 'application/json', ...(token ? { authorization: `Bearer ${token}` } : {}) },
    body: method === 'POST' ? JSON.stringify(body) : undefined,
  })

type Calls = { url: string; method: string; body?: string }[]
function fake(
  opts: {
    whoOk?: boolean
    adminRole?: string
    targetRole?: string | null
    appStatus?: string
    failDelete?: boolean
    resendOk?: boolean
  } = {}
) {
  const calls: Calls = []
  const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    calls.push({ url, method: init?.method ?? 'GET', body: typeof init?.body === 'string' ? init.body : undefined })
    if (url.endsWith('/auth/v1/user'))
      return opts.whoOk === false ? new Response('{}', { status: 401 }) : Response.json({ id: ADMIN, email: 'admin@x.test' })
    if (url.includes(`/rest/v1/profiles?id=eq.${ADMIN}`)) return Response.json([{ role: opts.adminRole ?? 'admin' }])
    if (url.includes(`/rest/v1/profiles?id=eq.${DRIVER}&select=role`))
      return Response.json(opts.targetRole === null ? [] : [{ role: opts.targetRole ?? 'driver' }])
    if (url.includes('/rest/v1/profiles?id=eq.') && url.includes('select=email')) return Response.json([{ email: 'driver@x.test' }])
    if (url.includes('/storage/v1/object/list/')) return Response.json([{ name: 'licence.pdf' }, { name: 'selfie.jpg' }])
    if (url.includes('/storage/v1/object/driver-documents') && init?.method === 'DELETE')
      return new Response('{}', { status: opts.failDelete ? 500 : 200 })
    if (url.includes('/rest/v1/audit_log')) return new Response(null, { status: 201 })
    if (url.includes('/auth/v1/admin/users/')) return new Response('{}', { status: 200 })
    if (url.includes('/rest/v1/driver_applications'))
      return Response.json([
        { status: opts.appStatus ?? 'needs_info', review_note: 'Upload a clearer licence', full_name: 'Thandi Nkosi', user_id: DRIVER },
      ])
    if (url.includes('resend.com')) return new Response('{}', { status: opts.resendOk === false ? 422 : 200 })
    return new Response('{}', { status: 404 })
  })
  return { f: f as unknown as typeof fetch, calls }
}
const deps = (f: typeof fetch) => ({ fetch: f, now: () => 0 })

describe('admin authentication (both actions)', () => {
  it('rejects missing, invalid, non-admin and single-factor sessions', async () => {
    for (const [label, d, token] of [
      ['no token', fake(), null],
      ['invalid token', fake({ whoOk: false }), jwt('aal2')],
      ['not an admin', fake({ adminRole: 'driver' }), jwt('aal2')],
      ['no second factor', fake(), jwt('aal1')],
    ] as const) {
      const res = await handleEraseDriver(req('erase-driver', { userId: DRIVER }, token), env, deps(d.f))
      expect([401, 403], label).toContain(res.status)
      expect(
        d.calls.some((c) => c.url.includes('/auth/v1/admin/users/')),
        label
      ).toBe(false)
    }
  })
  it('rejects other origins, wrong methods and a missing service key', async () => {
    const d = fake()
    const bad = new Request('https://vukaride.test/api/admin/erase-driver', {
      method: 'POST',
      headers: { origin: 'https://evil.test', authorization: `Bearer ${jwt('aal2')}` },
      body: '{}',
    })
    expect((await handleEraseDriver(bad, env, deps(d.f))).status).toBe(403)
    expect((await handleEraseDriver(req('erase-driver', {}, null, 'GET'), env, deps(d.f))).status).toBe(405)
    expect((await handleEraseDriver(req('erase-driver', { userId: DRIVER }), {}, deps(d.f))).status).toBe(503)
  })
})

describe('erase driver', () => {
  it('deletes files, writes the audit row first, then deletes the account', async () => {
    const d = fake()
    const res = await handleEraseDriver(req('erase-driver', { userId: DRIVER }), env, deps(d.f))
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true, files: 2 })
    const order = d.calls
      .map((c) =>
        c.url.includes('/rest/v1/audit_log')
          ? 'audit'
          : c.url.includes('/storage/v1/object/driver-documents')
            ? 'files'
            : c.url.includes('/auth/v1/admin/users/')
              ? 'user'
              : ''
      )
      .filter(Boolean)
    expect(order).toEqual(['audit', 'files', 'user'])
    const audit = JSON.parse(d.calls.find((c) => c.url.includes('audit_log'))?.body ?? '{}')
    expect(audit).toMatchObject({ actor_id: ADMIN, action: 'driver.erased', target_id: DRIVER })
    expect(JSON.stringify(audit)).not.toContain('driver@x.test')
    expect(
      JSON.parse(d.calls.find((c) => c.method === 'DELETE' && c.url.includes('/object/driver-documents'))?.body ?? '{}').prefixes
    ).toEqual([`${DRIVER}/licence.pdf`, `${DRIVER}/selfie.jpg`])
  })
  it('refuses invalid ids, itself, admins and unknown users', async () => {
    expect((await handleEraseDriver(req('erase-driver', { userId: 'x' }), env, deps(fake().f))).status).toBe(400)
    expect((await handleEraseDriver(req('erase-driver', { userId: ADMIN }), env, deps(fake().f))).status).toBe(400)
    expect((await handleEraseDriver(req('erase-driver', { userId: DRIVER }), env, deps(fake({ targetRole: 'admin' }).f))).status).toBe(400)
    expect((await handleEraseDriver(req('erase-driver', { userId: DRIVER }), env, deps(fake({ targetRole: null }).f))).status).toBe(404)
  })
  it('does not delete the account if deleting files fails', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const d = fake({ failDelete: true })
    const res = await handleEraseDriver(req('erase-driver', { userId: DRIVER }), env, deps(d.f))
    expect(res.status).toBe(500)
    expect(d.calls.some((c) => c.url.includes('/auth/v1/admin/users/'))).toBe(false)
  })
})

describe('notify decision', () => {
  it('emails the driver with the note', async () => {
    const d = fake()
    const res = await handleNotifyDecision(req('notify-decision', { applicationId: APP }), env, deps(d.f))
    expect(await res.json()).toMatchObject({ ok: true, sent: true })
    const mail = JSON.parse(d.calls.find((c) => c.url.includes('resend.com'))?.body ?? '{}')
    expect(mail.to).toEqual(['driver@x.test'])
    expect(mail.text).toContain('Hi Thandi,')
    expect(mail.text).toContain('Upload a clearer licence')
    expect(mail.text).toContain('https://vukaride.test/login')
  })
  it('says so (and sends nothing) when email is not configured or the status has nothing to send', async () => {
    const d = fake()
    const off = await handleNotifyDecision(req('notify-decision', { applicationId: APP }), { ...env, RESEND_API_KEY: undefined }, deps(d.f))
    expect(await off.json()).toMatchObject({ sent: false })
    expect(d.calls.some((c) => c.url.includes('resend.com'))).toBe(false)
    const d2 = fake({ appStatus: 'in_review' })
    expect(await (await handleNotifyDecision(req('notify-decision', { applicationId: APP }), env, deps(d2.f))).json()).toMatchObject({
      sent: false,
    })
  })
  it('reports a refused email without failing', async () => {
    const res = await handleNotifyDecision(req('notify-decision', { applicationId: APP }), env, deps(fake({ resendOk: false }).f))
    expect(res.status).toBe(200)
    expect(await res.json()).toMatchObject({ sent: false })
  })
})
