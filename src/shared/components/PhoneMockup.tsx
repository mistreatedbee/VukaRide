import React from 'react'
import { Briefcase, Home, Search } from 'lucide-react'

import { VukaMark, Wordmark } from '../brand/VukaMark'

/** 320×640 phone showing the rider's "Where to?" screen, drawn in code. */
export function PhoneMockup({ className = '' }: { className?: string }) {
  return (
    <div
      role="img"
      aria-label="The Vuka Ride app showing a route on a map and a Where to? panel with saved places"
      className={`relative w-[280px] shrink-0 rounded-[46px] bg-[#0b1410] p-[10px] shadow-[0_40px_80px_-20px_rgba(4,55,31,0.6)] sm:w-[320px] ${className}`}
    >
      <div className="relative aspect-[1/2] overflow-hidden rounded-[36px] bg-green-50" aria-hidden="true">
        {/* map */}
        <svg viewBox="0 0 300 600" className="absolute inset-0 size-full" preserveAspectRatio="xMidYMid slice">
          <rect width="300" height="600" fill="#E3F2E8" />
          <rect x="18" y="70" width="90" height="70" rx="10" fill="#D3EBDC" />
          <rect x="190" y="40" width="96" height="110" rx="10" fill="#D3EBDC" />
          <rect x="30" y="230" width="110" height="80" rx="10" fill="#D3EBDC" />
          <rect x="180" y="250" width="90" height="60" rx="10" fill="#D3EBDC" />
          <g stroke="#FFFFFF" strokeLinecap="round" fill="none">
            <path d="M-10 190 L310 160" strokeWidth="14" />
            <path d="M150 -10 L130 620" strokeWidth="12" />
            <path d="M-10 350 L310 380" strokeWidth="10" />
            <path d="M40 -10 L80 400" strokeWidth="8" />
            <path d="M250 -10 L240 400" strokeWidth="8" />
          </g>
          <path d="M70 330 L130 300 L140 175 L245 165 L238 95" fill="none" stroke="#0B8F3E" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="70" cy="330" r="9" fill="#FFFFFF" stroke="#064E2B" strokeWidth="4" />
          <circle cx="238" cy="95" r="10" fill="#FFB300" stroke="#FFFFFF" strokeWidth="4" />
        </svg>

        {/* logo pill */}
        <div className="absolute top-10 left-4 inline-flex items-center gap-1.5 rounded-full bg-white py-1.5 pr-3 pl-2 shadow-sm">
          <VukaMark size={18} variant="green" />
          <Wordmark className="text-xs" />
        </div>

        {/* bottom sheet */}
        <div className="absolute inset-x-0 bottom-0 rounded-t-[26px] bg-white px-4 pt-3 pb-5 shadow-[0_-8px_24px_rgba(4,55,31,0.12)]">
          <div className="mx-auto h-1 w-10 rounded-full bg-green-100" />
          <p className="mt-3 text-lg font-bold text-deep">Where to?</p>
          <div className="mt-2 flex items-center gap-2 rounded-xl bg-mist px-3 py-2.5 text-[13px] text-slate">
            <Search className="size-4" />
            Search destination
          </div>
          <ul className="mt-2 divide-y divide-green-50">
            {[
              { Icon: Home, label: 'Home' },
              { Icon: Briefcase, label: 'Work' },
            ].map(({ Icon, label }) => (
              <li key={label} className="flex items-center gap-3 py-2">
                <span className="inline-flex size-8 items-center justify-center rounded-full bg-green-50 text-green-600">
                  <Icon className="size-4" />
                </span>
                <span className="text-[13px] font-medium text-ink">{label}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 rounded-full bg-green-600 py-2.5 text-center text-sm font-semibold text-white">Request a ride</div>
        </div>
      </div>
    </div>
  )
}
