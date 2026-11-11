import { createClient, type SupabaseClient } from '@supabase/supabase-js'

import {
  APPLICATION_STATUSES,
  validateUpload,
  type AdminStats,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type ApplicationSummary,
  type DocKind,
  type DocumentRow,
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
  // Messages raised by our own SQL functions are written for people; anything else gets the generic text.
  const known = [
    'Please complete all required details first',
    'This application can no longer be edited',
    'A note is required',
    'Not allowed',
  ]
  const m = error?.message ?? ''
  throw new Error(known.find((k) => m.includes(k)) ?? fallback)
}

export function createSupabaseApi(url: string, anonKey: string): PortalApi {
  const sb: SupabaseClient = createClient(url, anonKey, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  })

  const requireUser = async () => {
    const { data } = await sb.auth.getUser()
    if (!data.user) throw new Error('Please sign in again.')
    return data.user
  }

  return {
    mode: 'supabase',

    async getSession() {
      const { data } = await sb.auth.getSession()
      const user = data.session?.user
      if (!user) return null
      const { data: profile } = await sb.from('profiles').select('role, full_name, email').eq('id', user.id).maybeSingle()
      const role: Role = profile?.role === 'admin' ? 'admin' : 'driver'
      return {
        userId: user.id,
        email: user.email ?? str(profile?.email),
        role,
        fullName: strOrNull(profile?.full_name),
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

    async getMyApplication() {
      const user = await requireUser()
      const { data, error } = await sb.from('driver_applications').select('*').eq('user_id', user.id).maybeSingle()
      if (error) fail(error, 'We could not load your application.')
      return data ? toApplication(data) : null
    },

    async saveMyApplication(input) {
      const user = await requireUser()
      const existing = await this.getMyApplication()
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
      const { error } = await sb.from('driver_documents').delete().eq('id', doc.id)
      if (error) fail(error, 'We could not remove that document.')
      await sb.storage.from(BUCKET).remove([doc.storagePath])
    },

    async documentUrl(doc) {
      const { data } = await sb.storage.from(BUCKET).createSignedUrl(doc.storagePath, 300)
      return data?.signedUrl ?? null
    },

    async listApplications() {
      const [apps, docs] = await Promise.all([
        sb.from('driver_applications').select('*').neq('status', 'draft').order('updated_at', { ascending: false }),
        sb.from('driver_documents').select('user_id'),
      ])
      if (apps.error) fail(apps.error, 'We could not load applications.')
      const counts = new Map<string, number>()
      for (const d of docs.data ?? []) counts.set(str(d.user_id), (counts.get(str(d.user_id)) ?? 0) + 1)
      return (apps.data ?? []).map(
        (r) => ({ ...toApplication(r), documentCount: counts.get(str(r.user_id)) ?? 0 }) satisfies ApplicationSummary
      )
    },

    async getApplicationDetail(id) {
      const { data, error } = await sb.from('driver_applications').select('*').eq('id', id).maybeSingle()
      if (error) fail(error, 'We could not load that application.')
      if (!data) return null
      const application = toApplication(data)
      const docs = await sb.from('driver_documents').select('*').eq('user_id', application.userId).order('created_at', { ascending: false })
      return { application, documents: (docs.data ?? []).map(toDocument) }
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

    async listSubmissions() {
      const { data, error } = await sb
        .from('form_submissions')
        .select('id, created_at, kind, status, payload')
        .order('created_at', { ascending: false })
        .limit(200)
      if (error) fail(error, 'We could not load the inbox.')
      return (data ?? []).map((r) => ({
        id: str(r.id),
        createdAt: str(r.created_at),
        kind: r.kind as Submission['kind'],
        status: r.status as Submission['status'],
        payload: (r.payload ?? {}) as Record<string, unknown>,
      }))
    },

    async setSubmissionStatus(id, status) {
      const { error } = await sb.from('form_submissions').update({ status }).eq('id', id)
      if (error) fail(error, 'We could not update that item.')
    },

    async getAdminStats() {
      const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as AdminStats['applicationsByStatus']
      const [apps, newSubs, newDeletes] = await Promise.all([
        sb.from('driver_applications').select('status'),
        sb.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new'),
        sb.from('form_submissions').select('id', { count: 'exact', head: true }).eq('status', 'new').eq('kind', 'delete-account'),
      ])
      for (const a of apps.data ?? []) byStatus[a.status as ApplicationStatus] += 1
      return { applicationsByStatus: byStatus, newSubmissions: newSubs.count ?? 0, newDeletionRequests: newDeletes.count ?? 0 }
    },
  }
}
