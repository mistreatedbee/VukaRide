/** The car door sticker every Vuka Ride car carries (official artwork from the brand pack). */
export function DoorDecal({ className = '' }: { className?: string }) {
  return (
    <img
      src="/images/car-door-decal.svg"
      width={1200}
      height={600}
      alt="Vuka Ride car door sticker: logo, Moving Africa Forward, Verified driver, Download the Vuka Ride app"
      loading="lazy"
      decoding="async"
      className={`h-auto w-full rounded-[22px] ${className}`}
    />
  )
}
