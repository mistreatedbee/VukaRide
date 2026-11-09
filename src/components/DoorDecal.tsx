import { VukaMark, Wordmark } from './brand/VukaMark'

/** The car door sticker every Vuka Ride car carries, drawn in code. */
export function DoorDecal() {
  return (
    <div
      role="img"
      aria-label="Vuka Ride car door sticker: logo, Moving Africa Forward, Verified driver, Download the Vuka Ride app"
      className="bg-brand rounded-[22px] p-2"
    >
      <div
        className="flex flex-col items-center rounded-[16px] border-2 border-sun px-5 py-6 text-center sm:px-8 sm:py-8"
        aria-hidden="true"
      >
        <VukaMark size={64} />
        <Wordmark className="mt-2 text-[30px] leading-none sm:text-[36px]" />
        <p className="mt-2 text-[10px] font-semibold tracking-[0.22em] text-leaf sm:text-[11px]">MOVING AFRICA FORWARD</p>
        <div className="my-4 h-px w-full bg-sun/50" />
        <p className="text-base font-bold tracking-[0.18em] text-sun sm:text-lg">VERIFIED DRIVER</p>
        <p className="mt-1 text-xs text-white sm:text-sm">Download the Vuka Ride app</p>
      </div>
    </div>
  )
}
