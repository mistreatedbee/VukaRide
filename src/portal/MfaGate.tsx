import { ShieldCheck } from 'lucide-react'
import { useEffect, useState, type FormEvent } from 'react'

import { VukaLogo } from '../components/brand/VukaMark'
import { Button } from '../components/ui'
import { usePortalState } from './auth'
import { Notice, Spinner } from './ui'

const inputCls =
  'block w-full min-h-12 rounded-xl border border-green-300 bg-white px-4 text-base tracking-[0.3em] text-ink focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15'

/**
 * Admins must use an authenticator app. First time: scan the QR code and confirm a code. After that: enter a code each sign-in.
 * Driver documents contain ID numbers, so one stolen email inbox must not be enough to open them.
 */
export function MfaGate({ mode, factorId }: { mode: 'enrol' | 'verify'; factorId?: string }) {
  const state = usePortalState()
  const [setup, setSetup] = useState<{ factorId: string; qrSvg: string; secret: string } | null>(null)
  const [code, setCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const api = state.status === 'ready' ? state.api : null
  useEffect(() => {
    if (mode !== 'enrol' || !api) return
    let alive = true
    api
      .startMfaEnrolment()
      .then((s) => alive && setSetup(s))
      .catch((e: unknown) => alive && setError(e instanceof Error ? e.message : 'Something went wrong.'))
    return () => {
      alive = false
    }
  }, [mode, api])

  if (!api) return <Spinner />
  const id = mode === 'enrol' ? setup?.factorId : factorId

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!id) return
    setBusy(true)
    setError(null)
    try {
      await api.verifyMfa(id, code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <VukaLogo size={40} />
      <h1 className="mt-8 flex items-center gap-3 text-3xl font-bold tracking-tight text-deep">
        <ShieldCheck className="size-8 text-green-600" aria-hidden="true" />
        {mode === 'enrol' ? 'Set up two-step sign-in' : 'Enter your code'}
      </h1>
      <p className="mt-3 leading-[1.7] text-slate">
        {mode === 'enrol'
          ? 'Admins can open driver documents, so a second step is required. Scan this code with an authenticator app such as Google Authenticator, Microsoft Authenticator or 1Password, then enter the 6 digit code it shows.'
          : 'Open your authenticator app and enter the 6 digit code for Vuka Ride.'}
      </p>
      {mode === 'enrol' && (
        <div className="mt-6">
          {setup ? (
            <>
              <img
                src={setup.qrSvg}
                alt="QR code for your authenticator app"
                width={192}
                height={192}
                className="mx-auto rounded-2xl border border-green-100 bg-white p-2"
              />
              <p className="mt-4 text-sm text-slate">
                Cannot scan? Enter this key in the app instead:
                <code className="mt-1 block rounded-lg bg-mist px-3 py-2 font-mono text-sm break-all text-ink">{setup.secret}</code>
              </p>
            </>
          ) : (
            !error && <Spinner label="Preparing" />
          )}
        </div>
      )}
      <form onSubmit={submit} className="mt-6" noValidate>
        <label htmlFor="mfa-code" className="block text-sm font-semibold text-ink">
          6 digit code
        </label>
        <input
          id="mfa-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          pattern="[0-9]*"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          aria-describedby={error ? 'mfa-error' : undefined}
          className={`${inputCls} mt-2`}
        />
        {error && (
          <div id="mfa-error" className="mt-3">
            <Notice tone="bad">{error}</Notice>
          </div>
        )}
        <Button type="submit" disabled={busy || !id || code.trim().length < 6} className="mt-5 w-full">
          {busy ? 'Checking…' : mode === 'enrol' ? 'Turn on and continue' : 'Continue'}
        </Button>
      </form>
      <button
        type="button"
        onClick={() => void api.signOut()}
        className="mt-6 min-h-11 text-sm font-semibold text-green-600 underline underline-offset-2"
      >
        Sign out
      </button>
    </div>
  )
}
