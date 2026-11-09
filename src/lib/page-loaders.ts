/** One dynamic import per page, so each page ships as its own chunk. Shared by the router and by the client entry (which preloads the current page before hydrating). */
export const pageLoaders = {
  '/': () => import('../pages/Home'),
  '/drive': () => import('../pages/Drive'),
  '/safety': () => import('../pages/Safety'),
  '/about': () => import('../pages/About'),
  '/contact': () => import('../pages/Contact'),
  '/privacy': () => import('../pages/Privacy'),
  '/terms': () => import('../pages/Terms'),
  '/delete-account': () => import('../pages/DeleteAccount'),
  '/download': () => import('../pages/Download'),
} as const

export const notFoundLoader = () => import('../pages/NotFound')

export const loaderFor = (pathname: string) => (pageLoaders as Record<string, () => Promise<unknown>>)[pathname] ?? notFoundLoader
