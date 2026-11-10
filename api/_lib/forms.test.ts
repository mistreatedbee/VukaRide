// @vitest-environment node
import { describe, expect, it, vi } from 'vitest'

import { handleForm, kindFromUrl, MIN_FILL_MS, RATE_LIMIT_PER_HOUR, type Env } from './forms'

const env: Env = {
  SUPABASE_URL: 'https://db.example.test',
  SUPABASE_SERVICE_ROLE_KEY: 'service-key',
  IP_HASH_SALT: 'salt',
}

const contact = { name: 'Thandi', email: 'thandi@example.com', topic: 'Rider support', message: 'Hello, I have a question.' }

const req = (kind: string, body: unknown, init: RequestInit = {}, url = `https://vukaride.test/api/forms/${kind}`) =>
  new Request(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '203.0.113.9', ...(init.headers ?? {}) },
    body: typeof body === 'string' ? body : JSON.stringify(body),
    ...init,
  })

/** A fake Supabase: rate-limit lookup returns `existing` rows, inserts succeed. */
function fakeFetch(existing = 0, insertStatus = 201) {
  return vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input)
    if (url.includes('/rest/v1/form_submissions') && init?.method === 'POST') return new Response(null, { status: insertStatus })
    if (url.includes('/rest/v1/form_submissions')) return Response.json(Array.from({ length: existing }, (_, i) => ({ id: i })))
    return new Response('{}', { status: 200 })
  })
}

const run = (request: Request, e: Env = env, f = fakeFetch()) =>
  handleForm(request, e, { fetch: f as unknown as typeof fetch, now: () => 1_700_000_000_000 })

describe('kindFromUrl', () => {
  it('accepts only known kinds', () => {
    expect(kindFromUrl('https://x.test/api/forms/contact')).toBe('contact')
    expect(kindFromUrl('https://x.test/api/forms/driver-application/')).toBe('driver-application')
    expect(kindFromUrl('https://x.test/api/forms/admin')).toBeNull()
  })
})

describe('handleForm', () => {
  it('stores a valid submission and returns ok', async () => {
    const f = fakeFetch()
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: MIN_FILL_MS + 1 } }), env, f)
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    const insert = f.mock.calls.find(([, init]) => init?.method === 'POST')
    const sent = JSON.parse(String(insert?.[1]?.body))
    expect(sent.kind).toBe('contact')
    expect(sent.ip_hash).toMatch(/^[0-9a-f]{64}$/)
    expect(JSON.stringify(sent)).not.toContain('203.0.113.9')
  })

  it('normalises the mobile number before storing', async () => {
    const f = fakeFetch()
    const body = { email: '', mobile: '082 123 4567', consent: true, _meta: { elapsedMs: 5000 } }
    const res = await run(req('notify', body), env, f)
    expect(res.status).toBe(200)
    const insert = f.mock.calls.find(([, init]) => init?.method === 'POST')
    expect(JSON.parse(String(insert?.[1]?.body)).payload.mobile).toBe('+27821234567')
  })

  it('rejects invalid data with field errors', async () => {
    const res = await run(req('contact', { ...contact, email: 'nope', _meta: { elapsedMs: 5000 } }))
    expect(res.status).toBe(400)
    expect((await res.json()).errors.email).toBeTruthy()
  })

  it('silently accepts but does not store honeypot hits', async () => {
    const f = fakeFetch()
    const res = await run(req('contact', { ...contact, website: 'http://spam', _meta: { elapsedMs: 9000 } }), env, f)
    expect(res.status).toBe(200)
    expect(f).not.toHaveBeenCalled()
  })

  it('silently accepts but does not store too-fast submissions', async () => {
    const f = fakeFetch()
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: 300 } }), env, f)
    expect(res.status).toBe(200)
    expect(f).not.toHaveBeenCalled()
  })

  it('treats a missing elapsedMs as a bot', async () => {
    const f = fakeFetch()
    await run(req('contact', contact), env, f)
    expect(f).not.toHaveBeenCalled()
  })

  it('rate limits by hashed IP', async () => {
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }), env, fakeFetch(RATE_LIMIT_PER_HOUR))
    expect(res.status).toBe(429)
    expect(res.headers.get('Retry-After')).toBe('3600')
  })

  it('returns 503 when not configured, never pretending success', async () => {
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }), {})
    expect(res.status).toBe(503)
  })

  it('returns 500 when storing fails', async () => {
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }), env, fakeFetch(0, 500))
    expect(res.status).toBe(500)
  })

  it('rejects other origins, allows configured ones with CORS headers', async () => {
    const bad = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }, { headers: { origin: 'https://evil.test' } }))
    expect(bad.status).toBe(403)
    const e = { ...env, ALLOWED_ORIGINS: 'https://vukaride.co.za' }
    const ok = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }, { headers: { origin: 'https://vukaride.co.za' } }), e)
    expect(ok.status).toBe(200)
    expect(ok.headers.get('Access-Control-Allow-Origin')).toBe('https://vukaride.co.za')
  })

  it('handles preflight, wrong methods, unknown kinds, bad JSON and oversized bodies', async () => {
    expect((await run(req('contact', '', { method: 'OPTIONS', body: undefined }))).status).toBe(204)
    expect((await run(req('contact', '', { method: 'GET', body: undefined }))).status).toBe(405)
    expect((await run(req('admin', {}))).status).toBe(404)
    expect((await run(req('contact', '{not json'))).status).toBe(400)
    expect((await run(req('contact', 'x'.repeat(30_000)))).status).toBe(413)
  })

  it('requires a captcha token only when Turnstile is configured', async () => {
    const e = { ...env, TURNSTILE_SECRET_KEY: 'secret' }
    const without = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }), e)
    expect(without.status).toBe(400)
    const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) =>
      String(input).includes('turnstile') ? Response.json({ success: true }) : fakeFetch()(input, init)
    )
    const withToken = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000, captchaToken: 't' } }), e, f as never)
    expect(withToken.status).toBe(200)
  })

  it('emails the right inbox when Resend is configured, and still succeeds if email fails', async () => {
    const e = {
      ...env,
      RESEND_API_KEY: 'k',
      FORMS_FROM_EMAIL: 'Vuka <no-reply@vukaride.test>',
      NEXT_PUBLIC_SUPPORT_EMAIL: 'support@vukaride.test',
    }
    const sent: unknown[] = []
    const f = vi.fn(async (input: RequestInfo | URL, init?: RequestInit) => {
      if (String(input).includes('resend.com')) {
        sent.push(JSON.parse(String(init?.body)))
        throw new Error('network down')
      }
      return fakeFetch()(input, init)
    })
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const res = await run(req('contact', { ...contact, _meta: { elapsedMs: 5000 } }), e, f as never)
    expect(res.status).toBe(200)
    expect((sent[0] as { to: string[] }).to).toEqual(['support@vukaride.test'])
  })
})
