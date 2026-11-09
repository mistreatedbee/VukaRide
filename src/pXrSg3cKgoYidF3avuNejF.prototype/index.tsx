import React, { useEffect, useState } from 'react'

import Home from '../ag2KYtFiqoa9ED1DKWRmSk.frame'
import Drive from '../9fD7iQ75Hi9Wmz9YBepa9w.frame'
import Safety from '../9zhFQ6upiqGmp7V9w1F5Mh.frame'
import About from '../bH7JKcd73Qc2oAZMMJoCWz.frame'
import Contact from '../fjvjMben7XXNn2NW6NeyVD.frame'
import Privacy from '../q9QQ1cYKU9SvGHuapp33cq.frame'
import Terms from '../5goxC6iesjSKSEz5NVzEuZ.frame'
import DeleteAccount from '../uLaY1cxzxshLvWB1nvVuhV.frame'
import NotFound from '../sVKeJFc3BbAyY2aDssQ6z7.frame'

import type { Route } from '../shared/nav'

/** The size every frame draws at, unless one exports its own. */
export const viewport = 'web'

export const folders = [
  { id: 'marketing', name: 'Marketing', frames: ['ag2KYtFiqoa9ED1DKWRmSk', '9fD7iQ75Hi9Wmz9YBepa9w', '9zhFQ6upiqGmp7V9w1F5Mh', 'bH7JKcd73Qc2oAZMMJoCWz'] },
  { id: 'support', name: 'Support & legal', frames: ['fjvjMben7XXNn2NW6NeyVD', 'q9QQ1cYKU9SvGHuapp33cq', '5goxC6iesjSKSEz5NVzEuZ', 'uLaY1cxzxshLvWB1nvVuhV', 'sVKeJFc3BbAyY2aDssQ6z7'] },
]

const PAGE_BY_FRAME: Record<string, string> = {
  ag2KYtFiqoa9ED1DKWRmSk: 'home',
  '9fD7iQ75Hi9Wmz9YBepa9w': 'drive',
  '9zhFQ6upiqGmp7V9w1F5Mh': 'safety',
  bH7JKcd73Qc2oAZMMJoCWz: 'about',
  fjvjMben7XXNn2NW6NeyVD: 'contact',
  q9QQ1cYKU9SvGHuapp33cq: 'privacy',
  '5goxC6iesjSKSEz5NVzEuZ': 'terms',
  uLaY1cxzxshLvWB1nvVuhV: 'delete-account',
  sVKeJFc3BbAyY2aDssQ6z7: 'not-found',
}

export default function VukaRide({ start }: { start?: string }) {
  const [{ route, n }, setNav] = useState(() => ({ route: (start && PAGE_BY_FRAME[start]) || 'home', n: 0 }))
  const [page, anchor] = route.split('#')

  // After a page change, jump to the anchor or the top.
  useEffect(() => {
    const id = requestAnimationFrame(() => {
      const el = anchor ? document.getElementById(anchor) : null
      if (el) el.scrollIntoView({ behavior: 'smooth' })
      else window.scrollTo({ top: 0 })
    })
    return () => cancelAnimationFrame(id)
  }, [route, n])

  // n bumps on every click, so the same anchor link scrolls again.
  const go = (to: Route) => setNav((s) => ({ route: to, n: s.n + 1 }))

  switch (page) {
    case 'drive':
      return <Drive onNavigate={go} />
    case 'safety':
      return <Safety onNavigate={go} />
    case 'about':
      return <About onNavigate={go} />
    case 'contact':
      return <Contact onNavigate={go} />
    case 'privacy':
      return <Privacy onNavigate={go} />
    case 'terms':
      return <Terms onNavigate={go} />
    case 'delete-account':
      return <DeleteAccount onNavigate={go} />
    case 'not-found':
      return <NotFound onNavigate={go} />
    default:
      return <Home onNavigate={go} />
  }
}
