import { handleForm } from '../_lib/forms.js'

// Vercel function: /api/forms/{driver-application|contact|delete-account|notify}. Logic lives in ../_lib/forms.ts.
export const POST = (request: Request) => handleForm(request, process.env)
export const OPTIONS = (request: Request) => handleForm(request, process.env)
export const GET = (request: Request) => handleForm(request, process.env)
