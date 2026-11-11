import { useState, type FormEvent } from 'react'
import { Navigate } from 'react-router-dom'

import { VukaLogo } from '../components/brand/VukaMark'
import { Button } from '../components/ui'
import { usePortalState } from './auth'
import { Notice } from './ui'

const inputCls =
  'block w-full min-h-12 rounded-xl border border-green-300 bg-white px-4 text-base text-ink focus:border-green-600 focus:outline-none focus:ring-4 focus:ring-green-600/15'

export default function Login() {
  const state = usePortalState()
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (state.status !== 'ready') return null
  if (state.session) return <Navigate to={state.session.role === 'admin' ? '/admin' : '/driver'} replace />
  const { api } = state

  const send = async (e?: FormEvent) => {
    e?.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.sendSignInCode(email.trim())
      setStep('code')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
    } finally {
      setBusy(false)
    }
  }

  const verify = async (e: FormEvent) => {
    e.preventDefault()
    setBusy(true)
    setError(null)
    try {
      await api.verifySignInCode(email.trim(), code)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.')
      setBusy(false)
    }
  }

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <a href="/" aria-label="Vuka Ride home" className="inline-block">
        <VukaLogo size={40} />
      </a>
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-deep">Sign in</h1>
      <p className="mt-2 leading-[1.7] text-slate">
        Drivers and the Vuka Ride team sign in with a one-time code sent to their email. There is no password to remember.
      </p>

      {api.mode === 'demo' && (
        <div className="mt-6">
          <Notice tone="warn" title="Demo data">
            This is the development demo. Use any email (start it with “admin” for the admin view) and any 6 digit code.
          </Notice>
        </div>
      )}

      <div className="mt-8">
        {step === 'email' ? (
          <form onSubmit={send} noValidate>
            <label htmlFor="login-email" className="block text-sm font-semibold text-ink">
              Email address
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-describedby={error ? 'login-error' : undefined}
              className={`${inputCls} mt-2`}
            />
            {error && (
              <p id="login-error" role="alert" className="mt-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy || !email.trim()} className="mt-5 w-full">
              {busy ? 'Sending…' : 'Email me a code'}
            </Button>
          </form>
        ) : (
          <form onSubmit={verify} noValidate>
            <Notice tone="good" title="Check your email">
              We sent a code to <strong>{email}</strong>. Enter it below, or open the link in the email.
            </Notice>
            <label htmlFor="login-code" className="mt-6 block text-sm font-semibold text-ink">
              6 digit code
            </label>
            <input
              id="login-code"
              name="code"
              inputMode="numeric"
              autoComplete="one-time-code"
              pattern="[0-9]*"
              maxLength={8}
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              aria-describedby={error ? 'login-error' : undefined}
              className={`${inputCls} mt-2 tracking-[0.3em]`}
            />
            {error && (
              <p id="login-error" role="alert" className="mt-2 text-sm font-medium text-danger">
                {error}
              </p>
            )}
            <Button type="submit" disabled={busy || code.trim().length < 6} className="mt-5 w-full">
              {busy ? 'Checking…' : 'Sign in'}
            </Button>
            <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-sm">
              <button
                type="button"
                onClick={() => void send()}
                disabled={busy}
                className="min-h-11 font-semibold text-green-600 underline underline-offset-2"
              >
                Send a new code
              </button>
              <button
                type="button"
                onClick={() => {
                  setStep('email')
                  setCode('')
                  setError(null)
                }}
                className="min-h-11 font-semibold text-green-600 underline underline-offset-2"
              >
                Use a different email
              </button>
            </div>
          </form>
        )}
      </div>
      <p className="mt-10 text-sm text-slate">
        Not a driver yet?{' '}
        <a href="/drive#apply" className="font-semibold text-green-600 underline underline-offset-2">
          Apply to drive
        </a>
        . By signing in you agree to our{' '}
        <a href="/terms" className="font-semibold text-green-600 underline underline-offset-2">
          Terms
        </a>{' '}
        and{' '}
        <a href="/privacy" className="font-semibold text-green-600 underline underline-offset-2">
          Privacy Policy
        </a>
        .
      </p>
    </div>
  )
}
