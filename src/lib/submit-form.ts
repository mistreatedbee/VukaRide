import { isMockMode, siteConfig } from './site-config'
import type { FormKind, FormKindMap } from './schemas'

export type SubmitMeta = {
  /** Milliseconds between the form appearing and the submit. Lets a server reject bots. */
  elapsedMs: number
}

export type SubmitResult = { ok: true; mock: boolean } | { ok: false; message: string }

const NETWORK_ERROR = 'We could not send that. Check your connection and try again.'
const GENERAL_ERROR = 'Something went wrong. Please check your details and try again.'
const MOCK_DELAY_MS = 600

/**
 * The only place that sends form data.
 *
 * - No NEXT_PUBLIC_API_BASE_URL: mock mode. Waits 600ms and succeeds; nothing leaves the browser.
 * - With it: POST `${API_BASE}/forms/{kind}` with JSON `{ ...data, _meta: { elapsedMs } }`.
 *   Any 2xx is success. See README "Form API contract".
 */
export async function submitForm<K extends FormKind>(kind: K, data: FormKindMap[K], meta: SubmitMeta): Promise<SubmitResult> {
  // Honeypot: a real visitor never sees or fills this field. Pretend it worked, send nothing.
  if ('website' in data && data.website) return { ok: true, mock: false }

  const base = siteConfig.apiBaseUrl
  if (!base) {
    // Personal data is only ever printed by the dev server, never in a production build.
    if (import.meta.env.DEV) console.info(`[mock form] ${kind}`, data)
    else console.info(`[mock form] ${kind} received (not sent: NEXT_PUBLIC_API_BASE_URL is not set)`)
    await new Promise((resolve) => setTimeout(resolve, MOCK_DELAY_MS))
    return { ok: true, mock: true }
  }

  // TODO: link to the finished app's backend. If you add a CAPTCHA (Turnstile, hCaptcha, reCAPTCHA),
  // get its token here and include it in the body as `_meta.captchaToken`.
  try {
    const { website: _website, ...fields } = data as typeof data & { website?: string }
    const res = await fetch(`${base}/forms/${kind}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify({ ...fields, _meta: meta }),
    })
    return res.ok ? { ok: true, mock: false } : { ok: false, message: GENERAL_ERROR }
  } catch {
    return { ok: false, message: NETWORK_ERROR }
  }
}

export { isMockMode }
