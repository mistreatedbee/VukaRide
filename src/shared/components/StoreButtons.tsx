import React from 'react'
import { Download } from 'lucide-react'

const STORES = [
  { small: 'Get it on', big: 'Google Play', label: 'Get Vuka Ride on Google Play' },
  { small: 'Download on the', big: 'App Store', label: 'Download Vuka Ride on the App Store' },
]

export function StoreButtons({ className = '', align = 'start' }: { className?: string; align?: 'start' | 'center' }) {
  return (
    <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''} ${className}`}>
      {STORES.map((s) => (
        <a
          key={s.big}
          href="#" // TODO: real store URLs
          aria-label={s.label}
          className="inline-flex min-h-[52px] items-center gap-3 rounded-[14px] bg-white px-4 py-2 text-ink shadow-sm transition-[filter,transform] duration-150 ease-out hover:brightness-95 active:scale-[0.98]"
        >
          <Download className="size-5 text-green-600" aria-hidden="true" />
          <span className="flex flex-col text-left leading-tight">
            <span className="text-[11px] font-medium text-slate">{s.small}</span>
            <span className="text-[15px] font-semibold whitespace-nowrap">{s.big}</span>
          </span>
        </a>
      ))}
    </div>
  )
}
