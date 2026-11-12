import { Download } from 'lucide-react'
import { Link } from 'react-router-dom'

import { storeHref, type StorePlatform } from '../lib/site-config'

const STORES: { platform: StorePlatform; small: string; big: string; label: string }[] = [
  { platform: 'android', small: 'Get it on', big: 'Google Play', label: 'Get it on Google Play' },
  { platform: 'ios', small: 'Download on the', big: 'App Store', label: 'Download on the App Store' },
]

const CLASS =
  'inline-flex min-h-[52px] items-center gap-3 rounded-[14px] bg-white px-4 py-2 text-ink shadow-sm transition-[filter,transform] duration-150 ease-out hover:brightness-95 active:scale-[0.98]'

/**
 * Store buttons. Each reads its URL from the site config: set, it goes straight to the store;
 * empty, it goes to /download, which shows a "Coming soon" state.
 */
export function StoreButtons({ className = '', align = 'start' }: { className?: string; align?: 'start' | 'center' }) {
  return (
    <div className={`flex flex-wrap gap-3 ${align === 'center' ? 'justify-center' : ''} ${className}`}>
      {STORES.map((s) => {
        const href = storeHref(s.platform)
        const soon = href.startsWith('/')
        const small = soon ? 'Coming soon on' : s.small
        const content = (
          <>
            <Download className="size-5 text-green-600" aria-hidden="true" />
            <span className="flex flex-col text-left leading-tight">
              <span className="text-[11px] font-medium text-slate">{small}</span>{' '}
              <span className="text-[15px] font-semibold whitespace-nowrap">{s.big}</span>
            </span>
          </>
        )
        return href.startsWith('/') ? (
          <Link key={s.platform} to={href} className={CLASS}>
            {content}
          </Link>
        ) : (
          <a key={s.platform} href={href} className={CLASS} rel="noopener noreferrer">
            {content}
          </a>
        )
      })}
    </div>
  )
}
