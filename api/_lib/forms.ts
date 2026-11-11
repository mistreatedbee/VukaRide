import { normaliseSaMobile } from '../../src/lib/phone.js'
import { contactSchema, deleteAccountSchema, driverApplicationSchema, notifySchema } from '../../src/lib/schemas.js'

/**
 * Forms backend (Vercel function logic). Kept free of Vercel types so it can be unit tested.
 *
 * Contract (same as src/lib/submit-form.ts): POST /api/forms/{kind} with the validated fields plus
 * `_meta: { elapsedMs, captchaToken? }`. Any 2xx is success.
 *
 * Storage: Supabase Postgres through PostgREST with the service-role key (server only; the table has
 * row level security on and no policies, so the public key can read and write nothing).
 */

export const FORM_KINDS = ['driver-application', 'contact', 'delete-account', 'notify'] as const
export type FormKind = (typeof FORM_KINDS)[number]

const SCHEMAS = {
  'driver-application': driverApplicationSchema,
  contact: contactSchema,
  'delete-account': deleteAccountSchema,
  notify: notifySchema,
} as const

export const MIN_FILL_MS = 2500
export const MAX_BODY_BYTES = 20_000
/** Many people share one IP on mobile networks, so this is generous. A person fills in a form once or twice. */
export const RATE_LIMIT_PER_HOUR = 20
/** Requests with no IP header all share one bucket, so it must be far higher or one bot could block everyone. */
export const RATE_LIMIT_UNKNOWN_IP_PER_HOUR = 200

export type Env = Record<string, string | undefined>
export type Deps = { fetch: typeof fetch; now: () => number }

const defaultDeps = (): Deps => ({ fetch: globalThis.fetch.bind(globalThis), now: () => Date.now() })

export const json = (status: number, body: Record<string, unknown>, extra: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...extra },
  })

const allowedOrigins = (env: Env) =>
  (env.ALLOWED_ORIGINS ?? '')
    .split(',')
    .map((s) => s.trim().replace(/\/+$/, ''))
    .filter(Boolean)

/** CORS headers only for configured origins. Same-origin requests need none. */
export function corsHeaders(request: Request, env: Env): Record<string, string> {
  const origin = request.headers.get('origin')
  if (origin && allowedOrigins(env).includes(origin)) {
    return {
      'Access-Control-Allow-Origin': origin,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Accept',
      'Access-Control-Max-Age': '86400',
      Vary: 'Origin',
    }
  }
  return {}
}

export function originAllowed(request: Request, env: Env): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // non-browser clients; the other checks still apply
  const list = allowedOrigins(env)
  if (list.length === 0) return origin === new URL(request.url).origin
  return list.includes(origin)
}

export const kindFromUrl = (url: string): FormKind | null => {
  const last = new URL(url).pathname.replace(/\/+$/, '').split('/').pop() ?? ''
  return (FORM_KINDS as readonly string[]).includes(last) ? (last as FormKind) : null
}

async function sha256Hex(input: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(input))
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, '0')).join('')
}

const clientIp = (request: Request) =>
  request.headers.get('x-real-ip') ?? request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? 'unknown'

const supabaseHeaders = (env: Env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
  'Content-Type': 'application/json',
})

async function verifyCaptcha(token: unknown, ip: string, env: Env, deps: Deps): Promise<boolean> {
  if (!env.TURNSTILE_SECRET_KEY) return true // not enabled
  if (typeof token !== 'string' || !token) return false
  const res = await deps.fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ secret: env.TURNSTILE_SECRET_KEY, response: token, remoteip: ip }),
  })
  if (!res.ok) return false
  return ((await res.json()) as { success?: boolean }).success === true
}

async function overRateLimit(ipHash: string, limit: number, env: Env, deps: Deps): Promise<boolean> {
  const since = new Date(deps.now() - 60 * 60 * 1000).toISOString()
  const url = `${env.SUPABASE_URL}/rest/v1/form_submissions?select=id&ip_hash=eq.${ipHash}&created_at=gte.${encodeURIComponent(since)}&limit=${limit}`
  const res = await deps.fetch(url, { headers: supabaseHeaders(env) })
  if (!res.ok) throw new Error(`rate-limit lookup failed (${res.status})`)
  return ((await res.json()) as unknown[]).length >= limit
}

async function store(kind: FormKind, payload: unknown, ipHash: string, env: Env, deps: Deps): Promise<void> {
  const res = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/form_submissions`, {
    method: 'POST',
    headers: { ...supabaseHeaders(env), Prefer: 'return=minimal' },
    body: JSON.stringify({ kind, payload, ip_hash: ipHash }),
  })
  if (!res.ok) throw new Error(`insert failed (${res.status})`)
}

const NOTIFY_RECIPIENT: Record<FormKind, string> = {
  'driver-application': 'NEXT_PUBLIC_DRIVERS_EMAIL',
  contact: 'NEXT_PUBLIC_SUPPORT_EMAIL',
  'delete-account': 'NEXT_PUBLIC_PRIVACY_EMAIL',
  notify: 'NEXT_PUBLIC_HELLO_EMAIL',
}

/** Best effort: the submission is already stored, so an email failure must not fail the request. */
async function notify(kind: FormKind, data: Record<string, unknown>, env: Env, deps: Deps): Promise<void> {
  const to = env[NOTIFY_RECIPIENT[kind]]
  if (!env.RESEND_API_KEY || !env.FORMS_FROM_EMAIL || !to) return
  const lines = Object.entries(data).map(([k, v]) => `${k}: ${String(v)}`)
  try {
    await deps.fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: env.FORMS_FROM_EMAIL,
        to: [to],
        subject: `Vuka Ride website: new ${kind.replace('-', ' ')}`,
        text: `${lines.join('\n')}\n\nStored in the form_submissions table.`,
      }),
      signal: AbortSignal.timeout(4000),
    })
  } catch {
    console.error(`[forms] notification email failed for ${kind}`)
  }
}

function fieldErrors(issues: { path: PropertyKey[]; message: string }[]): Record<string, string> {
  const out: Record<string, string> = {}
  for (const i of issues) {
    const key = String(i.path[0] ?? 'form')
    out[key] ??= i.message
  }
  return out
}

export async function handleForm(request: Request, env: Env, deps: Deps = defaultDeps()): Promise<Response> {
  const cors = corsHeaders(request, env)

  if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors })
  if (request.method !== 'POST') return json(405, { ok: false, message: 'Method not allowed.' }, { ...cors, Allow: 'POST, OPTIONS' })
  if (!originAllowed(request, env)) return json(403, { ok: false, message: 'Not allowed.' })

  const kind = kindFromUrl(request.url)
  if (!kind) return json(404, { ok: false, message: 'Unknown form.' }, cors)

  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY || !env.IP_HASH_SALT) {
    console.error('[forms] not configured: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY and IP_HASH_SALT are required')
    return json(503, { ok: false, message: 'Forms are not available right now.' }, cors)
  }

  const raw = await request.text()
  if (raw.length > MAX_BODY_BYTES) return json(413, { ok: false, message: 'That is too large.' }, cors)

  let body: unknown
  try {
    body = JSON.parse(raw)
  } catch {
    return json(400, { ok: false, message: 'Invalid request.' }, cors)
  }
  if (typeof body !== 'object' || body === null || Array.isArray(body)) return json(400, { ok: false, message: 'Invalid request.' }, cors)

  const { _meta, ...fields } = body as Record<string, unknown> & { _meta?: { elapsedMs?: unknown; captchaToken?: unknown } }

  // Bots: a filled honeypot or an impossibly fast submit. Say "ok" and store nothing.
  const elapsed = typeof _meta?.elapsedMs === 'number' ? _meta.elapsedMs : Number.NaN
  if (fields.website || !(elapsed >= MIN_FILL_MS)) return json(200, { ok: true }, cors)

  const parsed = SCHEMAS[kind].safeParse(fields)
  if (!parsed.success)
    return json(400, { ok: false, message: 'Please check your details.', errors: fieldErrors(parsed.error.issues) }, cors)

  const ip = clientIp(request)
  try {
    if (!(await verifyCaptcha(_meta?.captchaToken, ip, env, deps))) {
      return json(400, { ok: false, message: 'We could not verify you are human. Please try again.' }, cors)
    }
    const ipHash = await sha256Hex(`${env.IP_HASH_SALT}:${ip}`)
    if (await overRateLimit(ipHash, ip === 'unknown' ? RATE_LIMIT_UNKNOWN_IP_PER_HOUR : RATE_LIMIT_PER_HOUR, env, deps)) {
      return json(429, { ok: false, message: 'Too many attempts. Please try again later.' }, { ...cors, 'Retry-After': '3600' })
    }
    const { website: _website, ...clean } = parsed.data as Record<string, unknown>
    // The notify schema validates the mobile number but does not rewrite it; store the +27 form.
    if (kind === 'notify' && typeof clean.mobile === 'string' && clean.mobile) clean.mobile = normaliseSaMobile(clean.mobile)
    await store(kind, clean, ipHash, env, deps)
    await notify(kind, clean, env, deps)
  } catch (err) {
    // Never log the submitted data (personal information). Log the failure reason only.
    console.error('[forms] failed', kind, err instanceof Error ? err.message : 'unknown error')
    return json(500, { ok: false, message: 'Something went wrong. Please try again.' }, cors)
  }

  return json(200, { ok: true }, cors)
}
