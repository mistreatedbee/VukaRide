import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'

import { getPortalApi } from './api'
import type { PortalApi, PortalSession } from './types'

type PortalState =
  | { status: 'loading' }
  | { status: 'unavailable' }
  | { status: 'ready'; api: PortalApi; session: PortalSession | null; refresh: () => Promise<void> }

const PortalContext = createContext<PortalState>({ status: 'loading' })

export function PortalProvider({ children }: { children: ReactNode }) {
  const [api, setApi] = useState<PortalApi | null | undefined>(undefined)
  const [session, setSession] = useState<PortalSession | null>(null)
  const [sessionLoaded, setSessionLoaded] = useState(false)

  useEffect(() => {
    let alive = true
    void getPortalApi().then((a) => alive && setApi(a))
    return () => {
      alive = false
    }
  }, [])

  const refresh = useCallback(async () => {
    if (!api) return
    setSession(await api.getSession().catch(() => null))
    setSessionLoaded(true)
  }, [api])

  useEffect(() => {
    if (!api) return
    let alive = true
    const load = () =>
      api
        .getSession()
        .then((s) => alive && (setSession(s), setSessionLoaded(true)))
        .catch(() => alive && (setSession(null), setSessionLoaded(true)))
    void load()
    const off = api.onAuthChange(() => void load())
    return () => {
      alive = false
      off()
    }
  }, [api])

  const value = useMemo<PortalState>(() => {
    if (api === undefined || (api && !sessionLoaded)) return { status: 'loading' }
    if (api === null) return { status: 'unavailable' }
    return { status: 'ready', api, session, refresh }
  }, [api, session, sessionLoaded, refresh])

  return <PortalContext.Provider value={value}>{children}</PortalContext.Provider>
}

export const usePortalState = () => useContext(PortalContext)

/** For screens that only render when signed in: the api and the session are guaranteed. */
export function usePortal(): { api: PortalApi; session: PortalSession } {
  const s = useContext(PortalContext)
  if (s.status !== 'ready' || !s.session) throw new Error('usePortal used outside a signed-in portal screen')
  return { api: s.api, session: s.session }
}
