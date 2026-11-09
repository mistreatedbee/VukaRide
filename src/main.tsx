import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'

import { App } from './App'
import { loaderFor } from './lib/page-loaders'
import './index.css'

const ROUTER_FUTURE = { v7_startTransition: true, v7_relativeSplatPath: true } as const

const root = document.getElementById('root')
if (!root) throw new Error('Missing #root element')

const app = (
  <StrictMode>
    <BrowserRouter future={ROUTER_FUTURE}>
      <App />
    </BrowserRouter>
  </StrictMode>
)

// The production build ships prerendered HTML, so hydrate it. In dev the root is empty.
// The current page's chunk is loaded first so hydration matches the server HTML.
if (root.firstElementChild) {
  void loaderFor(window.location.pathname)().then(() => hydrateRoot(root, app))
} else {
  createRoot(root).render(app)
}
