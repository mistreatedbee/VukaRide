import { lazy, Suspense, useEffect, useRef, useState } from 'react'

import { SectionHeading } from './ui'

const NotifyForm = lazy(() => import('./forms/NotifyForm').then((m) => ({ default: m.NotifyForm })))

/**
 * "Notify me" box shown while the app is not in the stores yet. The form code (validation library) is only
 * downloaded when this section is about to scroll into view, so it does not slow the first paint.
 */
export function LaunchNotify() {
  const box = useRef<HTMLDivElement>(null)
  const [near, setNear] = useState(false)

  useEffect(() => {
    const el = box.current
    if (!el || typeof IntersectionObserver === 'undefined') return
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px' }
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])

  return (
    <section aria-labelledby="notify-title" className="bg-mist py-12 lg:py-24">
      <div className="container-vuka">
        <SectionHeading
          id="notify-title"
          eyebrow="Launch news"
          title="Be first to ride"
          intro="Vuka Ride is coming soon. Leave your email or WhatsApp number and we will tell you the moment the app is ready."
        />
        <div
          ref={box}
          className="mx-auto mt-10 min-h-[420px] max-w-md rounded-[28px] bg-white p-6 shadow-[0_24px_60px_-30px_rgba(4,55,31,0.35)] sm:p-8"
        >
          {near && (
            <Suspense fallback={null}>
              <NotifyForm />
            </Suspense>
          )}
        </div>
      </div>
    </section>
  )
}
