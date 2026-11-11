/** Paths that belong to the logged-in portal, not the public website. They are never prerendered or indexed. */
export const isPortalPath = (pathname: string) => /^\/(driver|admin|login)(\/|$)/.test(pathname)
