import {
  APPLICATION_STATUSES,
  EMPTY_APPLICATION,
  validateUpload,
  type AdminStats,
  type Application,
  type ApplicationInput,
  type ApplicationStatus,
  type DocKind,
  type DocumentRow,
  type PortalApi,
  type PortalSession,
  type Submission,
} from './types'

/**
 * In-memory stand-in for Supabase so the portal can be developed and clicked through with no backend.
 * Only the dev server loads this file (see api.ts). It is never in a production build, and everything in it is
 * obviously fake. Sign in with any email; an address starting with "admin" gets the admin role. Any 6 digit code works.
 */
export function createDemoApi(): PortalApi {
  let session: PortalSession | null = null
  const listeners = new Set<() => void>()
  const notify = () => listeners.forEach((l) => l())
  const now = () => new Date().toISOString()
  let n = 100
  const id = () => `demo-${++n}`

  const makeApp = (userId: string, status: ApplicationStatus, over: Partial<ApplicationInput> = {}): Application => ({
    id: id(),
    userId,
    status,
    ...EMPTY_APPLICATION,
    ...over,
    submittedAt: status === 'draft' ? null : now(),
    reviewedAt: null,
    reviewNote: null,
    createdAt: now(),
    updatedAt: now(),
  })

  const apps: Application[] = [
    makeApp('demo-user-1', 'submitted', {
      fullName: 'Demo Driver One',
      mobile: '+27820000001',
      email: 'one@demo.test',
      city: '[City 1]',
      vehicle: 'Demo Hatchback',
      vehicleYear: '2019',
      plate: 'DEMO 001 GP',
      licenceConfirmed: true,
      termsAccepted: true,
    }),
    makeApp('demo-user-2', 'in_review', {
      fullName: 'Demo Driver Two',
      mobile: '+27820000002',
      email: 'two@demo.test',
      city: '[City 2]',
      vehicle: 'Demo Sedan',
      vehicleYear: '2021',
      plate: 'DEMO 002 GP',
      licenceConfirmed: true,
      termsAccepted: true,
    }),
    makeApp('demo-user-3', 'approved', {
      fullName: 'Demo Driver Three',
      mobile: '+27820000003',
      email: 'three@demo.test',
      city: '[City 1]',
      vehicle: 'Demo SUV',
      vehicleYear: '2020',
      plate: 'DEMO 003 GP',
      licenceConfirmed: true,
      termsAccepted: true,
    }),
  ]
  const docs: DocumentRow[] = [
    {
      id: id(),
      userId: 'demo-user-1',
      kind: 'licence',
      fileName: 'licence.pdf',
      storagePath: 'demo/licence.pdf',
      status: 'uploaded',
      note: null,
      createdAt: now(),
    },
    {
      id: id(),
      userId: 'demo-user-1',
      kind: 'selfie',
      fileName: 'selfie.jpg',
      storagePath: 'demo/selfie.jpg',
      status: 'uploaded',
      note: null,
      createdAt: now(),
    },
  ]
  const submissions: Submission[] = [
    {
      id: id(),
      createdAt: now(),
      kind: 'contact',
      status: 'new',
      payload: { name: 'Demo Visitor', email: 'visitor@demo.test', topic: 'Rider support', message: 'This is a demo message.' },
    },
    {
      id: id(),
      createdAt: now(),
      kind: 'delete-account',
      status: 'new',
      payload: { contact: 'someone@demo.test', reason: 'Demo request', confirm: true },
    },
    { id: id(), createdAt: now(), kind: 'notify', status: 'done', payload: { email: 'launch@demo.test', consent: true } },
  ]
  const blobs = new Map<string, string>()

  const mine = () => {
    if (!session) throw new Error('Please sign in again.')
    return session.userId
  }
  const requireAdmin = () => {
    if (session?.role !== 'admin') throw new Error('Not allowed')
  }
  const delay = () => new Promise((r) => setTimeout(r, 120))

  return {
    mode: 'demo',
    async getSession() {
      return session
    },
    onAuthChange(cb) {
      listeners.add(cb)
      return () => void listeners.delete(cb)
    },
    async sendSignInCode(email) {
      await delay()
      if (!/^\S+@\S+\.\S+$/.test(email)) throw new Error('We could not send the code. Check the email address and try again.')
    },
    async verifySignInCode(email, code) {
      await delay()
      if (!/^\d{6}$/.test(code.trim())) throw new Error('That code did not work. Check it and try again, or ask for a new one.')
      const admin = email.toLowerCase().startsWith('admin')
      session = { userId: admin ? 'demo-admin' : `demo-${email.toLowerCase()}`, email, role: admin ? 'admin' : 'driver', fullName: null }
      notify()
    },
    async signOut() {
      session = null
      notify()
    },

    async getMyApplication() {
      await delay()
      return apps.find((a) => a.userId === mine()) ?? null
    },
    async saveMyApplication(input) {
      await delay()
      const existing = apps.find((a) => a.userId === mine())
      if (existing) {
        if (existing.status !== 'draft' && existing.status !== 'needs_info') throw new Error('This application can no longer be edited')
        Object.assign(existing, input, { updatedAt: now() })
        return { ...existing }
      }
      const created = makeApp(mine(), 'draft', input)
      apps.push(created)
      return { ...created }
    },
    async submitMyApplication() {
      await delay()
      const app = apps.find((a) => a.userId === mine())
      if (!app) throw new Error('No application found')
      const a = app
      if (
        !a.fullName ||
        !a.mobile ||
        !a.email ||
        !a.city ||
        !a.vehicle ||
        !a.vehicleYear ||
        !a.plate ||
        !a.licenceConfirmed ||
        !a.termsAccepted
      )
        throw new Error('Please complete all required details first')
      Object.assign(a, { status: 'submitted' as const, submittedAt: now(), reviewNote: null, updatedAt: now() })
      return { ...a }
    },
    async listMyDocuments() {
      await delay()
      return docs.filter((d) => d.userId === mine()).map((d) => ({ ...d }))
    },
    async uploadDocument(kind: DocKind, file: File) {
      await delay()
      const problem = validateUpload(file)
      if (problem) throw new Error(problem)
      const doc: DocumentRow = {
        id: id(),
        userId: mine(),
        kind,
        fileName: file.name,
        storagePath: `demo/${id()}`,
        status: 'uploaded',
        note: null,
        createdAt: now(),
      }
      blobs.set(doc.storagePath, URL.createObjectURL(file))
      docs.push(doc)
      return { ...doc }
    },
    async deleteDocument(doc) {
      await delay()
      const i = docs.findIndex((d) => d.id === doc.id && d.userId === mine())
      if (i >= 0 && docs[i]?.status !== 'accepted') docs.splice(i, 1)
    },
    async documentUrl(doc) {
      return blobs.get(doc.storagePath) ?? null
    },

    async listApplications() {
      await delay()
      requireAdmin()
      return apps
        .filter((a) => a.status !== 'draft')
        .map((a) => ({ ...a, documentCount: docs.filter((d) => d.userId === a.userId).length }))
    },
    async getApplicationDetail(appId) {
      await delay()
      requireAdmin()
      const application = apps.find((a) => a.id === appId)
      return application
        ? { application: { ...application }, documents: docs.filter((d) => d.userId === application.userId).map((d) => ({ ...d })) }
        : null
    },
    async reviewApplication(appId, status, note) {
      await delay()
      requireAdmin()
      if ((status === 'needs_info' || status === 'rejected') && !note.trim()) throw new Error('A note is required')
      const app = apps.find((a) => a.id === appId && a.status !== 'draft')
      if (!app) throw new Error('Application not found or still a draft')
      Object.assign(app, { status, reviewNote: note.trim() || null, reviewedAt: now(), updatedAt: now() })
      return { ...app }
    },
    async reviewDocument(docId, status, note) {
      await delay()
      requireAdmin()
      if (status === 'rejected' && !note.trim()) throw new Error('A note is required')
      const doc = docs.find((d) => d.id === docId)
      if (!doc) throw new Error('Document not found')
      Object.assign(doc, { status, note: note.trim() || null })
      return { ...doc }
    },
    async listSubmissions() {
      await delay()
      requireAdmin()
      return submissions.map((s) => ({ ...s }))
    },
    async setSubmissionStatus(subId, status) {
      await delay()
      requireAdmin()
      const s = submissions.find((x) => x.id === subId)
      if (s) s.status = status
    },
    async getAdminStats() {
      await delay()
      requireAdmin()
      const byStatus = Object.fromEntries(APPLICATION_STATUSES.map((s) => [s, 0])) as AdminStats['applicationsByStatus']
      for (const a of apps) byStatus[a.status] += 1
      return {
        applicationsByStatus: byStatus,
        newSubmissions: submissions.filter((s) => s.status === 'new').length,
        newDeletionRequests: submissions.filter((s) => s.status === 'new' && s.kind === 'delete-account').length,
      }
    },
  }
}
