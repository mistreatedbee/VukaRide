/** Shared types and rules for the driver and admin portal. */

export type Role = 'driver' | 'admin'

/** Admins must use an authenticator app. 'enrol' = none set up yet, 'verify' = set up but not entered this session. */
export type MfaState = 'ok' | 'enrol' | 'verify'

export type PortalSession = { userId: string; email: string; role: Role; fullName: string | null; mfa: MfaState; mfaFactorId?: string }

export const APPLICATION_STATUSES = ['draft', 'submitted', 'in_review', 'needs_info', 'approved', 'rejected'] as const
export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number]

export const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted',
  in_review: 'In review',
  needs_info: 'More information needed',
  approved: 'Approved',
  rejected: 'Not approved',
}

export const STATUS_HELP: Record<ApplicationStatus, string> = {
  draft: 'Finish your details and documents, then send your application for review.',
  submitted: 'We have your application. A reviewer will look at it soon.',
  in_review: 'A reviewer is checking your details and documents.',
  needs_info: 'We need something more from you. Read the note below, fix it, and send it again.',
  approved: 'You are approved to drive with Vuka Ride.',
  rejected: 'We could not approve this application. See the note below.',
}

/** The driver can still change their details and documents only in these states. */
export const isEditable = (status: ApplicationStatus | undefined) => status === undefined || status === 'draft' || status === 'needs_info'

export type Application = {
  id: string
  userId: string
  status: ApplicationStatus
  fullName: string
  mobile: string
  email: string
  city: string
  otherCity: string
  vehicle: string
  vehicleYear: string
  plate: string
  licenceConfirmed: boolean
  termsAccepted: boolean
  submittedAt: string | null
  reviewedAt: string | null
  reviewNote: string | null
  createdAt: string
  updatedAt: string
}

export type ApplicationInput = Pick<
  Application,
  'fullName' | 'mobile' | 'email' | 'city' | 'otherCity' | 'vehicle' | 'vehicleYear' | 'plate' | 'licenceConfirmed' | 'termsAccepted'
>

export const EMPTY_APPLICATION: ApplicationInput = {
  fullName: '',
  mobile: '',
  email: '',
  city: '',
  otherCity: '',
  vehicle: '',
  vehicleYear: '',
  plate: '',
  licenceConfirmed: false,
  termsAccepted: false,
}

export const DOC_KINDS = [
  'licence',
  'prdp',
  'id',
  'criminal_record',
  'proof_of_address',
  'selfie',
  'vehicle_registration',
  'insurance',
  'operating_licence',
  'bank_proof',
] as const
export type DocKind = (typeof DOC_KINDS)[number]

/**
 * Document list. It mirrors the requirements shown on the Drive page, which are still marked [confirm] there,
 * so change both together once the regulator and attorney have confirmed them.
 * `required` documents must be uploaded before the application can be sent. Others can be added later.
 */
export const DOC_INFO: Record<DocKind, { label: string; hint: string; required: boolean }> = {
  licence: { label: 'Driving licence', hint: 'Valid South African licence, code B or higher. Front and back.', required: true },
  prdp: { label: 'Professional Driving Permit (PrDP)', hint: 'Valid PrDP for carrying passengers.', required: true },
  id: { label: 'ID, work permit or visa', hint: 'South African ID, or a valid work permit or visa that allows work.', required: true },
  criminal_record: { label: 'SAPS Criminal Record Report', hint: 'A recent report from the South African Police Service.', required: true },
  proof_of_address: { label: 'Proof of address', hint: 'Not older than 3 months.', required: true },
  selfie: { label: 'Selfie and profile photo', hint: 'A clear photo of your face, no sunglasses or hat.', required: true },
  vehicle_registration: { label: 'Vehicle registration', hint: 'The registration papers for the car you will drive.', required: true },
  insurance: { label: 'Vehicle insurance', hint: 'Cover that suits carrying passengers. [Confirm the cover required.]', required: true },
  operating_licence: {
    label: 'E-hailing operating licence',
    hint: 'Issued by your Provincial Regulatory Entity. You can add it when you have it.',
    required: false,
  },
  bank_proof: { label: 'Proof of bank account', hint: 'An account in your own name, for payouts. You can add it later.', required: false },
}

export const DOC_STATUS_LABEL = { uploaded: 'Waiting for review', accepted: 'Accepted', rejected: 'Needs replacing' } as const
export type DocStatus = keyof typeof DOC_STATUS_LABEL

export type DocumentRow = {
  id: string
  userId: string
  kind: DocKind
  fileName: string
  storagePath: string
  status: DocStatus
  note: string | null
  createdAt: string
}

export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024
export const ALLOWED_UPLOAD_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'] as const

export function validateUpload(file: { type: string; size: number }): string | null {
  if (!(ALLOWED_UPLOAD_TYPES as readonly string[]).includes(file.type)) return 'Use a PDF, JPG, PNG or WebP file.'
  if (file.size > MAX_UPLOAD_BYTES) return 'That file is too large. The limit is 10 MB.'
  if (file.size === 0) return 'That file is empty.'
  return null
}

/** Required document kinds with no usable (non-rejected) upload yet. */
export function missingRequiredDocs(docs: Pick<DocumentRow, 'kind' | 'status'>[]): DocKind[] {
  return DOC_KINDS.filter((k) => DOC_INFO[k].required && !docs.some((d) => d.kind === k && d.status !== 'rejected'))
}

export type ApplicationSummary = Application & { documentCount: number }

export type Submission = {
  id: string
  createdAt: string
  kind: 'driver-application' | 'contact' | 'delete-account' | 'notify'
  status: 'new' | 'in_progress' | 'done' | 'spam'
  payload: Record<string, unknown>
}
export const SUBMISSION_STATUS_LABEL: Record<Submission['status'], string> = {
  new: 'New',
  in_progress: 'In progress',
  done: 'Done',
  spam: 'Spam',
}
export const SUBMISSION_KIND_LABEL: Record<Submission['kind'], string> = {
  'driver-application': 'Driver enquiry',
  contact: 'Contact message',
  'delete-account': 'Account deletion request',
  notify: 'Launch sign-up',
}

export type AdminStats = {
  applicationsByStatus: Record<ApplicationStatus, number>
  newSubmissions: number
  newDeletionRequests: number
}

/** The portal API. One implementation talks to Supabase, another (development only) keeps demo data in memory. */
export interface PortalApi {
  readonly mode: 'supabase' | 'demo'
  getSession(): Promise<PortalSession | null>
  onAuthChange(callback: () => void): () => void
  sendSignInCode(email: string): Promise<void>
  verifySignInCode(email: string, code: string): Promise<void>
  signOut(): Promise<void>

  getMyApplication(): Promise<Application | null>
  saveMyApplication(input: ApplicationInput): Promise<Application>
  submitMyApplication(): Promise<Application>
  listMyDocuments(): Promise<DocumentRow[]>
  uploadDocument(kind: DocKind, file: File): Promise<DocumentRow>
  deleteDocument(doc: DocumentRow): Promise<void>
  documentUrl(doc: DocumentRow): Promise<string | null>

  listApplications(): Promise<ApplicationSummary[]>
  getApplicationDetail(id: string): Promise<{ application: Application; documents: DocumentRow[] } | null>
  reviewApplication(id: string, status: 'in_review' | 'needs_info' | 'approved' | 'rejected', note: string): Promise<Application>
  reviewDocument(id: string, status: 'accepted' | 'rejected', note: string): Promise<DocumentRow>
  listSubmissions(opts: SubmissionQuery): Promise<{ items: Submission[]; hasMore: boolean }>
  setSubmissionStatus(id: string, status: Submission['status']): Promise<void>
  getAdminStats(): Promise<AdminStats>

  startMfaEnrolment(): Promise<{ factorId: string; qrSvg: string; secret: string }>
  verifyMfa(factorId: string, code: string): Promise<void>
  /** POPIA erasure: deletes the driver's files, documents, application and sign-in account. Admin only, logged. */
  eraseDriver(userId: string): Promise<void>
  /** Emails the driver about the decision when email sending is set up. Never throws for "not configured". */
  notifyDecision(applicationId: string): Promise<{ sent: boolean; reason?: string }>
}

export type SubmissionQuery = { kind?: Submission['kind']; status?: Submission['status']; offset: number; limit: number }
export const INBOX_PAGE = 50
