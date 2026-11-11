import { isPortalConfigured, siteConfig } from '../lib/site-config'
import type { PortalApi } from './types'

let cached: Promise<PortalApi | null> | undefined

/**
 * The portal's data layer, created once.
 * - Supabase configured: the real thing.
 * - Not configured, dev server: in-memory demo data (a banner says so).
 * - Not configured, production build: null, and the portal shows "not available yet".
 * The demo module is behind `import.meta.env.DEV`, so production bundles do not contain it.
 */
export function getPortalApi(): Promise<PortalApi | null> {
  cached ??= (async () => {
    if (isPortalConfigured() && siteConfig.supabaseUrl && siteConfig.supabaseAnonKey) {
      const { createSupabaseApi } = await import('./supabase-api')
      return createSupabaseApi(siteConfig.supabaseUrl, siteConfig.supabaseAnonKey)
    }
    if (import.meta.env.DEV) {
      const { createDemoApi } = await import('./demo-api')
      return createDemoApi()
    }
    return null
  })()
  return cached
}
