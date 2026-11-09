export type Platform = 'android' | 'ios' | 'desktop'

/** Which store suits this visitor. iPadOS reports itself as a Mac, so touch support is the tell. */
export function detectPlatform(userAgent: string, maxTouchPoints = 0): Platform {
  if (/android/i.test(userAgent)) return 'android'
  if (/iphone|ipad|ipod/i.test(userAgent)) return 'ios'
  if (/macintosh/i.test(userAgent) && maxTouchPoints > 1) return 'ios'
  return 'desktop'
}
