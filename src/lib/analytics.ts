/**
 * Analytics stub. No analytics or trackers are installed on purpose.
 *
 * If you add analytics later (GA4, Plausible, PostHog, ...) or anything that sets cookies or
 * identifiers, you MUST add a consent banner first (POPIA) and only load the script after the
 * visitor accepts. Wire it up here so no other file needs to change.
 */
export function trackEvent(_name: string, _props?: Record<string, string | number | boolean>): void {
  // Intentionally empty. TODO: connect a consent-gated analytics provider.
}
