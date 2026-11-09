// Build step: turns the app into one static HTML file per route (good for SEO and speed), and writes
// sitemap.xml and robots.txt from NEXT_PUBLIC_SITE_URL. Runs after `vite build` and `vite build --ssr`.
import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const root = path.resolve(import.meta.dirname, '..')
const dist = path.join(root, 'dist')
const ssrDir = path.join(root, 'dist-ssr')

const { render, PAGES, absoluteUrl, siteConfig } = await import(pathToFileURL(path.join(ssrDir, 'entry-server.js')).href)
let template = await readFile(path.join(dist, 'index.html'), 'utf8')

// Inline the stylesheet (it is small) so the first paint does not wait for a second request,
// and preload the fonts used above the fold.
const css = template.match(/<link rel="stylesheet"[^>]*href="(\/assets\/[^"]+\.css)"[^>]*>/)
if (css) {
  const styles = await readFile(path.join(dist, css[1]), 'utf8')
  template = template.replace(css[0], `<style>${styles}</style>`)
}
const fonts = (await readdir(path.join(dist, 'assets'))).filter((f) => /poppins-latin-(400|600|700)-normal-.*\.woff2$/.test(f))
template = template.replace(
  '<!--head-meta-->',
  fonts.map((f) => `<link rel="preload" href="/assets/${f}" as="font" type="font/woff2" crossorigin />`).join('\n    ') +
    '\n    <!--head-meta-->'
)

if (!siteConfig.siteUrl) {
  console.warn(
    '\n[prerender] WARNING: NEXT_PUBLIC_SITE_URL is not set. Canonical links, social tags and the sitemap use https://example.com. Set it before launch.\n'
  )
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;')
const routes = [...PAGES.map((p) => p.path), '/404']

for (const url of routes) {
  const { html, meta, head } = await render(url)
  const page = template
    .replace(/<title>.*?<\/title>/, `<title>${esc(meta.title)}</title>`)
    .replace('<!--head-meta-->', head)
    .replace('<!--app-html-->', html)
  const file = url === '/' ? 'index.html' : url === '/404' ? '404.html' : path.join(url.slice(1), 'index.html')
  await mkdir(path.dirname(path.join(dist, file)), { recursive: true })
  await writeFile(path.join(dist, file), page)
}

const urls = PAGES.filter((p) => p.indexable).map((p) => `  <url><loc>${absoluteUrl(p.path)}</loc></url>`)
await writeFile(
  path.join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
)
await writeFile(path.join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl('/sitemap.xml')}\n`)

await rm(ssrDir, { recursive: true, force: true })
console.log(`[prerender] wrote ${routes.length} pages, sitemap.xml and robots.txt`)
