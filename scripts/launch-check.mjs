// Prints what is not ready for a real launch. Run by `npm run build` on Vercel production (and with `npm run launch-check`).
// It only warns by default. Set LAUNCH_STRICT=1 to fail the build instead (recommended once you go live).
import { readFileSync } from 'node:fs'
import path from 'node:path'

const root = path.resolve(import.meta.dirname, '..')
const env = { ...process.env }
// Also read .env.production, which Vite uses for production builds.
try {
  for (const line of readFileSync(path.join(root, '.env.production'), 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
    if (m && !(m[1] in env)) env[m[1]] = m[2]
  }
} catch {
  /* no file */
}

const has = (k) => Boolean(env[k]?.trim())
const problems = []
if (!has('NEXT_PUBLIC_SITE_URL') && !has('VITE_SITE_URL'))
  problems.push('NEXT_PUBLIC_SITE_URL is not set: canonical links and the sitemap will use https://example.com.')
if (!has('NEXT_PUBLIC_API_BASE_URL'))
  problems.push('NEXT_PUBLIC_API_BASE_URL is not set: the website forms run in DEMO MODE and drop every submission. Set it to /api.')
if (!has('NEXT_PUBLIC_SUPABASE_URL') || !has('NEXT_PUBLIC_SUPABASE_ANON_KEY'))
  problems.push('NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY are not set: the driver and admin portal will be closed.')
if (has('TURNSTILE_SECRET_KEY'))
  problems.push(
    'TURNSTILE_SECRET_KEY is set but the site does not render the Turnstile widget yet: every form submission would be rejected.'
  )

if (problems.length === 0) {
  console.log('[launch-check] OK')
} else {
  console.warn(`\n[launch-check] ${problems.length} thing(s) not ready for launch:\n${problems.map((p) => `  - ${p}`).join('\n')}\n`)
  if (process.env.LAUNCH_STRICT === '1') {
    console.error('[launch-check] LAUNCH_STRICT=1, failing the build.')
    process.exit(1)
  }
}
