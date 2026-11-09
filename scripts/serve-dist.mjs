// Serves ./dist like a static host would (directory index files, a real 404 status with 404.html).
// Used by `npm run preview` and by the Playwright tests, so prerendered pages are what gets tested.
import { createReadStream, existsSync, statSync } from 'node:fs'
import { createServer } from 'node:http'
import { createGzip } from 'node:zlib'
import path from 'node:path'

const dist = path.resolve(import.meta.dirname, '..', 'dist')
const port = Number(process.env.PORT ?? 4173)
const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.webmanifest': 'application/manifest+json',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.xml': 'application/xml',
  '.txt': 'text/plain',
}

createServer((req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost')
  const safe = path.normalize(decodeURIComponent(url.pathname)).replace(/^(\.\.[/\\])+/, '')
  let file = path.join(dist, safe)
  if (existsSync(file) && statSync(file).isDirectory()) file = path.join(file, 'index.html')
  let status = 200
  if (!existsSync(file) || !file.startsWith(dist)) {
    file = path.join(dist, '404.html')
    status = 404
  }
  const type = types[path.extname(file)] ?? 'application/octet-stream'
  const headers = { 'Content-Type': type }
  // Mirror what a real host does: long cache for hashed assets, gzip for text.
  if (url.pathname.startsWith('/assets/')) headers['Cache-Control'] = 'public, max-age=31536000, immutable'
  const gzip = /text|javascript|json|xml|svg/.test(type) && /gzip/.test(req.headers['accept-encoding'] ?? '')
  if (gzip) headers['Content-Encoding'] = 'gzip'
  res.writeHead(status, headers)
  const source = createReadStream(file)
  if (gzip) source.pipe(createGzip()).pipe(res)
  else source.pipe(res)
}).listen(port, () => console.log(`Serving dist on http://localhost:${port}`))
