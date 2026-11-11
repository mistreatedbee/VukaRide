import { corsHeaders, json, originAllowed, type Deps, type Env } from './forms.js'

/**
 * Admin-only server actions that need the service-role key (so they cannot run in the browser):
 *   erase-driver     POPIA erasure: files, documents, application and the sign-in account, with an audit row.
 *   notify-decision  email the driver about a decision, when email sending is configured.
 *
 * The caller must send their own Supabase access token. We check with Supabase that it is valid, that it is an
 * admin, and that the session passed the second factor (aal2). The browser is never trusted to say who it is.
 */

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const BUCKET = 'driver-documents'
const defaultDeps = (): Deps => ({ fetch: globalThis.fetch.bind(globalThis), now: () => Date.now() })

const service = (env: Env) => ({
  apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '',
  Authorization: `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY ?? ''}`,
  'Content-Type': 'application/json',
})

function aalOf(token: string): string | null {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1] ?? '', 'base64url').toString('utf8')) as { aal?: string }
    return payload.aal ?? null
  } catch {
    return null
  }
}

type Admin = { userId: string; email: string }

async function requireAdmin(request: Request, env: Env, deps: Deps): Promise<Admin | Response> {
  const cors = corsHeaders(request, env)
  const token = /^Bearer (.+)$/.exec(request.headers.get('authorization') ?? '')?.[1]
  if (!token) return json(401, { ok: false, message: 'Please sign in again.' }, cors)

  const who = await deps.fetch(`${env.SUPABASE_URL}/auth/v1/user`, {
    headers: { apikey: env.SUPABASE_SERVICE_ROLE_KEY ?? '', Authorization: `Bearer ${token}` },
  })
  if (!who.ok) return json(401, { ok: false, message: 'Please sign in again.' }, cors)
  const user = (await who.json()) as { id?: string; email?: string }
  if (!user.id) return json(401, { ok: false, message: 'Please sign in again.' }, cors)

  const prof = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${user.id}&select=role`, { headers: service(env) })
  const role = prof.ok ? ((await prof.json()) as { role?: string }[])[0]?.role : undefined
  if (role !== 'admin' || aalOf(token) !== 'aal2') return json(403, { ok: false, message: 'Not allowed.' }, cors)
  return { userId: user.id, email: user.email ?? '' }
}

type Guarded = { early: Response } | { early?: undefined; admin: Admin; body: Record<string, unknown>; cors: Record<string, string> }

async function guard(request: Request, env: Env, deps: Deps): Promise<Guarded> {
  const cors = corsHeaders(request, env)
  if (request.method === 'OPTIONS') return { early: new Response(null, { status: 204, headers: cors }) }
  if (request.method !== 'POST')
    return { early: json(405, { ok: false, message: 'Method not allowed.' }, { ...cors, Allow: 'POST, OPTIONS' }) }
  if (!originAllowed(request, env)) return { early: json(403, { ok: false, message: 'Not allowed.' }) }
  if (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY) {
    console.error('[admin] not configured: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required')
    return { early: json(503, { ok: false, message: 'This is not available right now.' }, cors) }
  }
  const admin = await requireAdmin(request, env, deps)
  if (admin instanceof Response) return { early: admin }
  let body: Record<string, unknown> = {}
  try {
    const raw = await request.text()
    if (raw.length > 2000) return { early: json(413, { ok: false, message: 'That is too large.' }, cors) }
    body = JSON.parse(raw || '{}') as Record<string, unknown>
  } catch {
    return { early: json(400, { ok: false, message: 'Invalid request.' }, cors) }
  }
  return { admin, body, cors }
}

async function audit(
  env: Env,
  deps: Deps,
  actor: string,
  action: string,
  targetType: string,
  targetId: string,
  detail: Record<string, unknown>
) {
  const res = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/audit_log`, {
    method: 'POST',
    headers: { ...service(env), Prefer: 'return=minimal' },
    body: JSON.stringify({ actor_id: actor, action, target_type: targetType, target_id: targetId, detail }),
  })
  if (!res.ok) throw new Error(`audit insert failed (${res.status})`)
}

export async function handleEraseDriver(request: Request, env: Env, deps: Deps = defaultDeps()): Promise<Response> {
  const g = await guard(request, env, deps)
  if (g.early) return g.early
  const { admin, body, cors } = g
  const userId = typeof body.userId === 'string' ? body.userId : ''
  if (!UUID.test(userId)) return json(400, { ok: false, message: 'Invalid request.' }, cors)
  if (userId === admin.userId) return json(400, { ok: false, message: 'You cannot erase your own account here.' }, cors)

  try {
    const prof = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${userId}&select=role`, { headers: service(env) })
    const target = prof.ok ? ((await prof.json()) as { role?: string }[])[0] : undefined
    if (!target) return json(404, { ok: false, message: 'That driver was not found.' }, cors)
    if (target.role !== 'driver') return json(400, { ok: false, message: 'Only driver accounts can be erased here.' }, cors)

    // 1. Files first. If this fails we stop, and nothing else has been deleted, so it can be retried.
    const list = await deps.fetch(`${env.SUPABASE_URL}/storage/v1/object/list/${BUCKET}`, {
      method: 'POST',
      headers: service(env),
      body: JSON.stringify({ prefix: userId, limit: 1000 }),
    })
    if (!list.ok) throw new Error(`storage list failed (${list.status})`)
    const names = ((await list.json()) as { name: string }[]).map((o) => `${userId}/${o.name}`)
    // 2. Audit before the account disappears (the row keeps the id, never the person's details).
    await audit(env, deps, admin.userId, 'driver.erased', 'user', userId, { files: names.length })
    if (names.length > 0) {
      const del = await deps.fetch(`${env.SUPABASE_URL}/storage/v1/object/${BUCKET}`, {
        method: 'DELETE',
        headers: service(env),
        body: JSON.stringify({ prefixes: names }),
      })
      if (!del.ok) throw new Error(`storage delete failed (${del.status})`)
    }
    // 3. The account. Foreign keys cascade to the profile, application, documents and (set null) the audit actor.
    const gone = await deps.fetch(`${env.SUPABASE_URL}/auth/v1/admin/users/${userId}`, { method: 'DELETE', headers: service(env) })
    if (!gone.ok) throw new Error(`user delete failed (${gone.status})`)
    return json(200, { ok: true, files: names.length }, cors)
  } catch (err) {
    console.error('[admin] erase failed', err instanceof Error ? err.message : 'unknown error')
    return json(500, { ok: false, message: 'We could not finish the erasure. Nothing was lost. Please try again.' }, cors)
  }
}

const TEXT: Record<string, { subject: string; lead: string }> = {
  approved: { subject: 'You are approved to drive with Vuka Ride', lead: 'Good news: your application has been approved.' },
  needs_info: {
    subject: 'Vuka Ride needs a little more from you',
    lead: 'We looked at your application and need something more before we can go on.',
  },
  rejected: {
    subject: 'About your Vuka Ride application',
    lead: 'Thank you for applying. We could not approve your application this time.',
  },
}

export async function handleNotifyDecision(request: Request, env: Env, deps: Deps = defaultDeps()): Promise<Response> {
  const g = await guard(request, env, deps)
  if (g.early) return g.early
  const { body, cors } = g
  const id = typeof body.applicationId === 'string' ? body.applicationId : ''
  if (!UUID.test(id)) return json(400, { ok: false, message: 'Invalid request.' }, cors)

  if (!env.RESEND_API_KEY || !env.FORMS_FROM_EMAIL) {
    return json(200, { ok: true, sent: false, reason: 'Email sending is not set up yet, so tell the driver yourself.' }, cors)
  }
  try {
    const res = await deps.fetch(
      `${env.SUPABASE_URL}/rest/v1/driver_applications?id=eq.${id}&select=status,review_note,full_name,user_id`,
      { headers: service(env) }
    )
    const app = res.ok
      ? ((await res.json()) as { status: string; review_note: string | null; full_name: string | null; user_id: string }[])[0]
      : undefined
    const tpl = app && TEXT[app.status]
    if (!app || !tpl) return json(200, { ok: true, sent: false, reason: 'There is nothing to email for this status.' }, cors)

    const p = await deps.fetch(`${env.SUPABASE_URL}/rest/v1/profiles?id=eq.${app.user_id}&select=email`, { headers: service(env) })
    const to = p.ok ? ((await p.json()) as { email: string | null }[])[0]?.email : null
    if (!to) return json(200, { ok: true, sent: false, reason: 'We have no email address for this driver.' }, cors)

    const site = env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, '')
    const text = [
      `Hi ${app.full_name?.split(' ')[0] || 'there'},`,
      '',
      tpl.lead,
      app.review_note ? `\nNote from the team:\n${app.review_note}` : '',
      site ? `\nSign in to see your application: ${site}/login` : '',
      '',
      'Vuka Ride. Moving Africa Forward.',
    ]
      .filter((l) => l !== '')
      .join('\n')
    const send = await deps.fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: env.FORMS_FROM_EMAIL, to: [to], subject: tpl.subject, text }),
      signal: AbortSignal.timeout(5000),
    })
    return json(200, { ok: true, sent: send.ok, reason: send.ok ? undefined : 'The email service refused the message.' }, cors)
  } catch {
    console.error('[admin] decision email failed')
    return json(200, { ok: true, sent: false, reason: 'We could not reach the email service.' }, cors)
  }
}
