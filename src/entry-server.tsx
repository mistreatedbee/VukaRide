import { Writable } from 'node:stream'
import { renderToPipeableStream } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server'

import { App } from './App'
import { headTags, serialiseTags } from './lib/head'
import { metaFor, type PageMeta } from './lib/routes'

/** Used by scripts/prerender.mjs at build time. Waits for every lazy page to resolve, then returns the full HTML. */
export function render(url: string): Promise<{ html: string; meta: PageMeta; head: string }> {
  return new Promise((resolve, reject) => {
    let html = ''
    const sink = new Writable({
      write(chunk, _enc, done) {
        html += chunk.toString()
        done()
      },
    })
    const stream = renderToPipeableStream(
      <StaticRouter location={url} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <App />
      </StaticRouter>,
      {
        onAllReady() {
          stream.pipe(sink)
        },
        onError: reject,
      }
    )
    sink.on('finish', () => {
      const meta = metaFor(url)
      resolve({ html, meta, head: serialiseTags(headTags(meta)) })
    })
    sink.on('error', reject)
  })
}

export { PAGES } from './lib/routes'
export { absoluteUrl, siteConfig } from './lib/site-config'
