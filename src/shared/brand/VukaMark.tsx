import React, { useId } from 'react'

export function VukaMark({ size = 48, variant = 'white' }: { size?: number; variant?: 'white' | 'green' }) {
  const v = variant === 'white' ? '#FFFFFF' : '#064E2B'
  const id = `vukaSun-${useId().replace(/:/g, '')}`
  return (
    <svg width={size} height={size} viewBox="64 64 384 384" aria-hidden="true" className="shrink-0">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFB300" />
          <stop offset="1" stopColor="#FF7A00" />
        </linearGradient>
      </defs>
      <path
        d="M138 196 L256 388 L374 196"
        fill="none"
        stroke={v}
        strokeWidth="76"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="256" cy="158" r="46" fill={`url(#${id})`} />
    </svg>
  )
}

/** "VukaRide" set as one word: Vuka in deep green (white on dark), Ride in orange (gold on dark). */
export function Wordmark({ theme = 'light', className = '' }: { theme?: 'light' | 'dark'; className?: string }) {
  return (
    <span className={`font-bold tracking-[-0.015em] ${className}`}>
      <span className={theme === 'dark' ? 'text-white' : 'text-deep'}>Vuka</span>
      <span className={theme === 'dark' ? 'text-sun' : 'text-orange'}>Ride</span>
    </span>
  )
}

export function VukaLogo({ theme = 'light', size = 36 }: { theme?: 'light' | 'dark'; size?: number }) {
  return (
    <span className="inline-flex items-center gap-2">
      <VukaMark size={size} variant={theme === 'dark' ? 'white' : 'green'} />
      <Wordmark theme={theme} className="text-[22px] leading-none" />
    </span>
  )
}

/** Rounded-square app icon: brand gradient with the white V and sun centred. */
export function AppIcon({ size = 96, className = '' }: { size?: number; className?: string }) {
  return (
    <span
      className={`bg-brand inline-flex items-center justify-center ${className}`}
      style={{ width: size, height: size, borderRadius: size * 0.22 }}
      role="img"
      aria-label="Vuka Ride app icon"
    >
      <VukaMark size={size * 0.72} />
    </span>
  )
}
