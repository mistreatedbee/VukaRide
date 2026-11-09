import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'

import { JsonLd, RouteMeta, ScrollManager, SiteLayout } from './components/SiteChrome'
import { notFoundLoader, pageLoaders } from './lib/page-loaders'

const Home = lazy(pageLoaders['/'])
const Drive = lazy(pageLoaders['/drive'])
const Safety = lazy(pageLoaders['/safety'])
const About = lazy(pageLoaders['/about'])
const Contact = lazy(pageLoaders['/contact'])
const Privacy = lazy(pageLoaders['/privacy'])
const Terms = lazy(pageLoaders['/terms'])
const DeleteAccount = lazy(pageLoaders['/delete-account'])
const Download = lazy(pageLoaders['/download'])
const NotFound = lazy(notFoundLoader)

export function App() {
  return (
    <SiteLayout>
      <RouteMeta />
      <ScrollManager />
      <JsonLd />
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/drive" element={<Drive />} />
          <Route path="/safety" element={<Safety />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/delete-account" element={<DeleteAccount />} />
          <Route path="/download" element={<Download />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </SiteLayout>
  )
}
