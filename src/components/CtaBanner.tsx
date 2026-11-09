import { PatternBackground } from './brand/PatternBackground'
import { AppIcon } from './brand/VukaMark'
import { StoreButtons } from './StoreButtons'
import { Reveal } from './ui'

/** "Ready to ride?" download banner. */
export function CtaBanner({ id = 'download' }: { id?: string }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="bg-banner relative scroll-mt-[72px] overflow-hidden py-16 lg:py-24">
      <PatternBackground pattern="road" tone="dark" />
      <Reveal className="container-vuka relative flex flex-col items-center text-center">
        <AppIcon size={96} className="shadow-[0_20px_40px_-12px_rgba(0,0,0,0.45)] ring-1 ring-white/15" />
        <h2 id={`${id}-title`} className="h2-display mt-8 text-white">
          Ready to ride?
        </h2>
        <p className="mt-3 max-w-md text-base leading-[1.7] text-leaf sm:text-lg">Download Vuka Ride and rise to your next trip.</p>
        <StoreButtons align="center" className="mt-8" />
      </Reveal>
    </section>
  )
}
