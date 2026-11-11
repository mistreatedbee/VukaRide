import { handleEraseDriver } from '../_lib/admin.js'

// Vercel function: POST /api/admin/erase-driver. Logic and checks live in ../_lib/admin.ts.
export const POST = (request: Request) => handleEraseDriver(request, process.env)
export const OPTIONS = (request: Request) => handleEraseDriver(request, process.env)
export const GET = (request: Request) => handleEraseDriver(request, process.env)
