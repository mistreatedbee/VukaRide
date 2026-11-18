import { useState } from 'react'
import { Navigate } from 'react-router-dom'

import { VukaLogo } from '../components/brand/VukaMark'
import { usePortalState } from './auth'
import Login from './Login'

const cardCls =
  'block w-full rounded-2xl border border-green-300 bg-white p-5 text-left transition-colors hover:border-green-600 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-green-600/15'

/**
 * Sign up for riders and drivers. Riders book in the Vuka Ride app, so they are sent to the download
 * page. Drivers create a portal account with the same email one-time code used to sign in.
 */
export default function Signup() {
  const state = usePortalState()
  const [choice, setChoice] = useState<'driver' | null>(null)

  if (state.status === 'ready' && state.session) {
    return <Navigate to={state.session.role === 'admin' ? '/admin' : '/driver'} replace />
  }
  if (choice === 'driver') return <Login signup />

  return (
    <div className="mx-auto w-full max-w-md px-5 py-12">
      <a href="/" aria-label="Vuka Ride home" className="inline-block">
        <VukaLogo size={40} />
      </a>
      <h1 className="mt-8 text-3xl font-bold tracking-tight text-deep">Sign up</h1>
      <p className="mt-2 leading-[1.7] text-slate">How would you like to use Vuka Ride?</p>

      <div className="mt-8 space-y-4">
        <a href="/download" className={cardCls}>
          <span className="block text-lg font-semibold text-deep">I want to ride</span>
          <span className="mt-1 block leading-[1.6] text-slate">
            Riders sign up in the Vuka Ride app. Get the app and create your account there.
          </span>
        </a>
        <button type="button" onClick={() => setChoice('driver')} className={cardCls}>
          <span className="block text-lg font-semibold text-deep">I want to drive</span>
          <span className="mt-1 block leading-[1.6] text-slate">
            Create a driver account with your email, then complete your application and upload your documents.
          </span>
        </button>
      </div>

      <p className="mt-10 text-sm text-slate">
        Already have an account?{' '}
        <a href="/login" className="font-semibold text-green-600 underline underline-offset-2">
          Sign in
        </a>
        .
      </p>
    </div>
  )
}
