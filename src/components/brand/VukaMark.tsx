/** The Vuka Ride mark: a bold V (the road) with a gold sun rising in its mouth. Uses the official SVG files. */
export function VukaMark({
  size = 48,
  variant = 'white',
  className = '',
}: {
  size?: number
  variant?: 'white' | 'green'
  className?: string
}) {
  return (
    <img
      src={variant === 'white' ? '/images/mark-white.svg' : '/images/mark-color.svg'}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      className={`shrink-0 ${className}`}
    />
  )
}

/** "VukaRide" set as one word on dark backgrounds: white and gold. */
export function Wordmark({ className = '' }: { className?: string }) {
  return (
    <span className={`font-bold tracking-[-0.015em] ${className}`}>
      <span className="text-white">Vuka</span>
      <span className="text-sun">Ride</span>
    </span>
  )
}

const LOGO_RATIO = 1031 / 240

/** Horizontal logo from the brand files. `size` is the height in px. */
export function VukaLogo({ theme = 'light', size = 36 }: { theme?: 'light' | 'dark'; size?: number }) {
  return (
    <img
      src={theme === 'dark' ? '/images/logo-horizontal-white.svg' : '/images/logo-horizontal.svg'}
      width={Math.round(size * LOGO_RATIO)}
      height={size}
      alt="Vuka Ride"
      className="block max-w-full"
    />
  )
}

/** Rounded-square app icon from the brand files. */
export function AppIcon({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <img
      src="/images/app-icon-rounded.svg"
      width={size}
      height={size}
      alt="Vuka Ride app icon"
      className={className}
      style={{ borderRadius: size * 0.22 }}
    />
  )
}
