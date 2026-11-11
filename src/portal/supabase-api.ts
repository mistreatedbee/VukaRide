import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import { siteConfig } from '../lib/site-config'
import {
  APPLICATION_STATUSES,
  DOC_INFO,
  validateUpload,
  type AdminStats,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type ApplicationSummary,
  type DocKind,
  type AuditRow,
  type DocumentRow,
  type DriverRow,
  type Suspension,
  type MfaState,
  type PortalApi,
  type PortalSession,
  type Role,
  type Submission,
} from './types'

const BUCKET = 'driver-documents'

type Row = Record<string, unknown>
const str = (v: unknown) => (typeof v === 'string' ? v : '')
const strOrNull = (v: unknown) => (typeof v === 'string' ? v : null)

const toApplication = (r: Row): Application => ({
  id: str(r.id),
  userId: str(r.user_id),
  status: r.status as ApplicationStatus,
  fullName: str(r.full_name),
  mobile: str(r.mobile),
  email: str(r.email),
  city: str(r.city),
  otherCity: str(r.other_city),
  vehicle: str(r.vehicle),
  vehicleYear: str(r.vehicle_year),
  plate: str(r.plate),
  licenceConfirmed: r.licence_confirmed === true,
  termsAccepted: r.terms_accepted === true,
  submittedAt: strOrNull(r.submitted_at),
  reviewedAt: strOrNull(r.reviewed_at),
  reviewNote: strOrNull(r.review_note),
  createdAt: str(r.created_at),
  updatedAt: str(r.updated_at),
})

const toDocument = (r: Row): DocumentRow => ({
  id: str(r.id),
  userId: str(r.user_id),
  kind: r.kind as DocKind,
  fileName: str(r.file_name),
  storagePath: str(r.storage_path),
  status: r.status as DocumentRow['status'],
  note: strOrNull(r.note),
  createdAt: str(r.created_at),
})

const toDbInput = (i: ApplicationInput) => ({
  full_name: i.fullName.trim(),
  mobile: i.mobile.trim(),
  email: i.email.trim(),
  city: i.city,
  other_city: i.otherCity.trim(),
  vehicle: i.vehicle.trim(),
  vehicle_year: i.vehicleYear.trim(),
  plate: i.plate.trim(),
  licence_confirmed: i.licenceConfirmed,
  terms_accepted: i.termsAccepted,
})

/** Turns a Supabase/Postgres error into a message that is safe and kind to show. */
function fail(error: { message: string } | null, fallback: string): never {
  const m = error?.message ?? ''
  // Messages raised by our own SQL functions are written for people; anything else gets the generic text.
  const plain = [
    'Please complete all required details first',
    'This application can no longer be edited',
    'A note is required',
    'Not allowed',
    'Reopen the application (Start review) before changing the decision',
  ]
  const hit = plain.find((k) => m.includes(k))
  if (hit) throw new Error(hit)
  const missing = m.match(/Accept all required documents first\. Still missing: (.+)$/)
  if (missing?.[1]) {
    const names = missing[1].split(',').map((k) => DOC_INFO[k.trim() as keyof typeof DOC_INFO]?.label ?? k.trim())
    throw new Error(`Accept all required documents first. Still missing: ${names.join(', ')}.`)
  }
  throw new Error(fallback)
}

const API_BASE = () => siteConfig.apiBaseUrl ?? '/api'

export function createSupabaseApi(url: string, anonKey: string): PortalApi {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })

  const requireUser = async () => {
    const { data } = await sb.auth.getUser()
    if (!data.user) throw new Error('Please sign in again.')
    return data.user
  }

  const getMyApplication = async () => {
    const user = await requireUser()
    const { data, error } = await sb.from('driver_applications').select('*').eq('user_id', user.id).maybeSingle()
    if (error) fail(error, 'We could not load your application.')
    return data ? toApplication(data) : null
  }

  const bearer = async () => {
    const { data } = await sb.auth.getSession()
    if (!data.session) throw new Error('Please sign in again.')
    return { Authorization: `Bearer ${data.session.access_token}`, 'Content-Type': 'application/json' }
  }

  return {
    mode: 'supabase',

    async getSession() {
      const { data } = await sb.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      const { data: profile } = await sb
        .from('profiles')
        .select('role, full_name, email, suspended_at, suspended_reason')
        .eq('id', user.id)
        .maybeSingle()
      const role: Role = profile?.role === 'admin' ? 'admin' : 'driver'
      let mfa: MfaState = 'ok'
      let mfaFactorId: string | undefined
      if (role === 'admin') {
        const { data: aal } = await sb.auth.mfa.getAuthenticatorAssuranceLevel()
        if (aal?.currentLevel !== 'aal2') {
          const { data: factors } = await sb.auth.mfa.listFactors()
          mfaFactorId = factors?.totp?.[0]?.id
          mfa = mfaFactorId ? 'verify' : 'enrol'
        }
      }
      return {
        userId: user.id,
        email: user.email ?? str(profile?.email),
        role,
        fullName: strOrNull(profile?.full_name),
        mfa,
        mfaFactorId,
        // null = not suspended; a string (possibly empty) = suspended, with the reason to show the driver.
        suspendedReason: profile?.suspended_at ? (strOrNull(profile.suspended_reason) ?? '') : null,
      } satisfies PortalSession
    },

    onAuthChange(callback) {
      const { data } = sb.auth.onAuthStateChange(() => callback())
      return () => data.subscription.unsubscribe()
    },

    async sendSignInCode(email) {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/login`, shouldCreateUser: true },
      })
      if (error) throw new Error('We could not send the code. Check the email address and try again.')
    },

    async verifySignInCode(email, code) {
      const { error } = await sb.auth.verifyOtp({ email, token: code.trim(), type: 'email' })
      if (error) throw new Error('That code did not work. Check it and try again, or ask for a new one.')
    },

    async signOut() {
      await sb.auth.signOut()
    },

    getMyApplication,

    async saveMyApplication(input) {
      const user = await requireUser()
      const existing = await getMyApplication()
      const q = existing
        ? sb.from('driver_applications').update(toDbInput(input)).eq('id', existing.id)
        : sb.from('driver_applications').insert({ user_id: user.id, ...toDbInput(input) })
      const { data, error } = await q.select('*').single()
      if (error) fail(error, 'We could not save your application. Please try again.')
      return toApplication(data)
    },

    async submitMyApplication() {
      const { data, error } = await sb.rpc('submit_my_application')
      if (error) fail(error, 'We could not send your application. Please try again.')
      return toApplication(data as Row)
    },

    async listMyDocuments() {
      const user = await requireUser()
      const { data, error } = await sb.from('driver_documents').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      if (error) fail(error, 'We could not load your documents.')
      return (data ?? []).map(toDocument)
    },

    async uploadDocument(kind, file) {
      const problem = validateUpload(file)
      if (problem) throw new Error(problem)
      const user = await requireUser()
      const safe = file.name.replace(/[^A-Za-z0-9._-]/g, '_').slice(-80)
      const path = `${user.id}/${kind}-${Date.now()}-${safe}`
      const up = await sb.storage.from(BUCKET).upload(path, file, { contentType: file.type, upsert: false })
      if (up.error) throw new Error('We could not upload that file. Please try again.')
      const { data, error } = await sb
        .from('driver_documents')
        .insert({ user_id: user.id, kind, storage_path: path, file_name: file.name.slice(0, 200) })
        .select('*')
        .single()
      if (error) {
        await sb.storage.from(BUCKET).remove([path])
        fail(error, 'We could not save that document. Please try again.')
      }
      return toDocument(data)
    },

    async deleteDocument(doc) {
      const { data, error } = await sb.from('driver_documents').delete().eq('id', doc.id).select('id')
      if (error) fail(error, 'We could not remove that document.')
      // Row level security hides rows the driver may not delete (accepted documents, or an application already with the team).
      if (!data || data.length === 0) throw new Error('That document can no longer be removed.')
      await sb.storage.from(BUCKET).remove([doc.storagePath])
    },

    async documentUrl(doc) {
      const { data: u } = await sb.auth.getUser()
      if (u.user && u.user.id !== doc.userId) await sb.rpc('audit_document_view', { doc_id: doc.id }) // admins only; logged
      const { data } = await sb.storage.from(BUCKET).createSignedUrl(doc.storagePath, 300)
      return data?.signedUrl ?? null
    },

    async listApplications() {
      const [apps, counts] = await Promise.all([
        sb.from('driver_applications').select('*').neq('status', 'draft').order('updated_at', { ascending: false }).limit(500),
        sb.rpc('document_counts'),
      ])
      if (apps.error) fail(apps.error, 'We could not load applications.')
      const byUser = new Map<string, number>()
      for (const c of (counts.data ?? []) as { user_id: string; n: number | string }[]) byUser.set(c.user_id, Number(c.n))
      return (apps.data ?? []).map(
        (r) => ({ ...toApplication(r), documentCount: byUser.get(str(r.user_id)) ?? 0 }) satisfies ApplicationSummary
      )
    },

    async getApplicationDetail(id) {
      const { data, error } = await sb.from('driver_applications').select('*').eq('id', id).maybeSingle()
      if (error) fail(error, 'We could not load that application.')
      if (!data) return null
      const application = toApplication(data)
      const [docs, prof] = await Promise.all([
        sb.from('driver_documents').select('*').eq('user_id', application.userId).order('created_at', { ascending: false }),
        sb.from('profiles').select('suspended_at, suspended_reason').eq('id', application.userId).maybeSingle(),
      ])
      const suspension: Suspension | null = prof.data?.suspended_at
        ? { suspendedAt: str(prof.data.suspended_at), reason: str(prof.data.suspended_reason) }
        : null
      return { application, documents: (docs.data ?? []).map(toDocument), suspension }
    },

    async listDrivers() {
      const [apps, susp] = await Promise.all([
        sb.from('driver_applications').select('*').eq('status', 'approved').order('reviewed_at', { ascending: false }).limit(500),
        sb.from('profiles').select('id, suspended_at, suspended_reason').not('suspended_at', 'is', null).limit(500),
      ])
      if (apps.error) fail(apps.error, 'We could not load drivers.')
      const suspended = new Map(
        (susp.data ?? []).map((p) => [
          str(p.id),
          { suspendedAt: str(p.suspended_at), reason: str(p.suspended_reason) } satisfies Suspension,
        ])
      )
      const rows = new Map<string, DriverRow>()
      for (const r of apps.data ?? []) {
        const a = toApplication(r)
        rows.set(a.userId, {
          applicationId: a.id,
          userId: a.userId,
          fullName: a.fullName,
          email: a.email,
          city: a.city === 'Other (tell us where)' ? a.otherCity : a.city,
          vehicle: [a.vehicle, a.vehicleYear].filter(Boolean).join(', '),
          approvedAt: a.reviewedAt,
          applicationStatus: a.status,
          suspended: suspended.get(a.userId) ?? null,
        })
      }
      // A suspended driver whose application was later reopened must still be visible here.
      const missing = [...suspended.keys()].filter((id) => !rows.has(id))
      if (missing.length > 0) {
        const more = await sb.from('driver_applications').select('*').in('user_id', missing)
        for (const r of more.data ?? []) {
          const a = toApplication(r)
          rows.set(a.userId, {
            applicationId: a.id,
            userId: a.userId,
            fullName: a.fullName,
            email: a.email,
            city: a.city === 'Other (tell us where)' ? a.otherCity : a.city,
            vehicle: [a.vehicle, a.vehicleYear].filter(Boolean).join(', '),
            approvedAt: a.reviewedAt,
            applicationStatus: a.status,
            suspended: suspended.get(a.userId) ?? null,
          })
        }
      }
      return [...rows.values()]
    },

    async setSuspension(userId, suspend, reason) {
      const { error } = await sb.rpc('set_driver_suspension', { target: userId, suspend, reason: reason || null })
      if (error) {
        if (error.message.includes('A reason is required')) throw new Error('A reason is required')
        fail(error, 'We could not save that change.')
      }
    },

    async listAudit({ offset, limit, area }) {
      let q = sb
        .from('audit_log')
        .select('id, created_at, actor_id, action, target_type, target_id, detail')
        .order('id', { ascending: false })
      if (area) q = q.like('action', `${area}.%`)
      const { data, error } = await q.range(offset, offset + limit)
      if (error) fail(error, 'We could not load the audit log.')
      const rows = data ?? []
      const actorIds = [...new Set(rows.map((r) => str(r.actor_id)).filter(Boolean))]
      const emails = new Map<string, string>()
      if (actorIds.length > 0) {
        const { data: people } = await sb.from('profiles').select('id, email').in('id', actorIds)
        for (const p of people ?? []) emails.set(str(p.id), str(p.email))
      }
      const items = rows.slice(0, limit).map(
        (r) =>
          ({
            id: Number(r.id),
            createdAt: str(r.created_at),
            actor: emails.get(str(r.actor_id)) ?? (r.actor_id ? 'Removed account' : 'System or SQL editor'),
            action: str(r.action),
            targetType: str(r.target_type),
            targetId: str(r.target_id),
            detail: (r.detail ?? {}) as Record<string, unknown>,
          }) satisfies AuditRow
      )
      return { items, hasMore: rows.length > limit }
    },

    async reviewApplication(id, status, note) {
      const { data, error } = await sb.rpc('review_application', { app_id: id, new_status: status, note: note || null })
      if (error) fail(error, 'We could not save that decision.')
      return toApplication(data as Row)
    },

    async reviewDocument(id, status, note) {
      const { data, error } = await sb.rpc('review_document', { doc_id: id, new_status: status, note: note || null })
      if (error) fail(error, 'We could not save that decision.')
      return toDocument(data as Row)
    },

    async listSubmissions({ kind, status, offset, limit }) {
      let q = sb.from('form_submissions').select('id, created_at, kind, status, payload').order('created_at', { ascending: false })
      if (kind) q = q.eq('kind', kind)
      if (status) q = q.eq('status', status)
      const { data, error } = await q.range(offset, offset + limit) // one extra row tells us whether there is more
      if (error) fail(error, 'We could not load the inbox.')
      const rows = data ?? []
      const items = rows.slice(0, limit).map((r) => ({
        id: str(r.id),
        createdAt: str(r.created_at),
        kind: r.kind as Submission['kind'],
        status: r.status as Submission['status'],
        payload: (r.payload ?? {}) as Record<string, unknown>,
      }))
      return { items, hasMore: rows.length > limit }
    },

    async setSubmissionStatus(id, status) {
      const { error } = await sb.from('form_submissions').update({ status }).eq('id', id)
      if (error) fail(error, 'We could not update that item.')
    },

    async getAdminStats() {
      const count = (q: PromiseLike<{ count: number | null; error: { message: string } | null }>) => q.then((r) => r.count ?? 0)
      const statuses = [...APPLICATION_STATUSES]
      const [byStatus, newSubs, newDeletes] = await Promise.all([
        Promise.all(
          statuses.map((st) => count(sb.from('driver_applications').select('id', { count: 'exact', head: true }).eq('status', st)))
        ),
        count(sb.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new')),
        count(sb.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new').eq('kind', 'delete-account')),
      ])
      const applicationsByStatus = Object.fromEntries(statuses.map((st, i) => [st, byStatus[i] ?? 0])) as AdminStats['applicationsByStatus']
      return { applicationsByStatus, newSubmissions: newSubs, newDeletionRequests: newDeletes }
    },

    async startMfaEnrolment() {
      // Drop any half finished set-up from an earlier attempt, then start a new one.
      const { data: existing } = await sb.auth.mfa.listFactors()
      for (const f of existing?.all ?? []) if (f.status === 'unverified') await sb.auth.mfa.unenroll({ factorId: f.id })
      const { data, error } = await sb.auth.mfa.enroll({
        factorType: 'totp',
        friendlyName: `Vuka Ride admin ${new Date().toISOString().slice(0, 10)}`,
      })
      if (error || !data) throw new Error('We could not start the set-up. Please try again.')
      return { factorId: data.id, qrSvg: data.totp.qr_code, secret: data.totp.secret }
    },

    async verifyMfa(factorId, code) {
      const { error } = await sb.auth.mfa.challengeAndVerify({ factorId, code: code.trim() })
      if (error) throw new Error('That code did not work. Check the code in your authenticator app and try again.')
    },

    async eraseDriver(userId) {
      const res = await fetch(`${API_BASE()}/admin/erase-driver`, {
        method: 'POST',
        headers: await bearer(),
        body: JSON.stringify({ userId }),
      })
      if (!res.ok)
        throw new Error((await res.json().catch(() => ({}) as { message?: string })).message ?? 'We could not erase that driver.')
    },

    async notifyDecision(applicationId) {
      try {
        const res = await fetch(`${API_BASE()}/admin/notify-decision`, {
          method: 'POST',
          headers: await bearer(),
          body: JSON.stringify({ applicationId }),
        })
        const body = (await res.json().catch(() => ({}))) as { sent?: boolean; reason?: string }
        return { sent: res.ok && body.sent === true, reason: body.reason }
      } catch {
        return { sent: false, reason: 'We could not reach the email service.' }
      }
    },
  }
}
