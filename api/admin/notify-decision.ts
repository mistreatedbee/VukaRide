import { handleNotifyDecision } from '../_lib/admin.js'

// Vercel function: POST /api/admin/notify-decision. Emails the driver when email sending is configured.
export const POST = (request: Request) => handleNotifyDecision(request, process.env)
export const OPTIONS = (request: Request) => handleNotifyDecision(request, process.env)
export const GET = (request: Request) => handleNotifyDecision(request, process.env)
