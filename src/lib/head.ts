import { SITE_NAME, type PageMeta } from './routes'
import { absoluteUrl } from './site-config'

export type HeadTag = { tag: 'meta' | 'link'; key: string; attrs: Record<string, string> }

/** All per-page head tags. Used by RouteMeta in the browser and by the build-time prerender. */
export function headTags(m: PageMeta): HeadTag[] {
  const url = absoluteUrl(m.path)
  const image = absoluteUrl(m.ogImage)
  const twitterImage = absoluteUrl('/og/twitter-card.png')
  const meta = (key: string, kind: 'name' | 'property', content: string): HeadTag => ({
    tag: 'meta',
    key: `${kind}:${key}`,
    attrs: { [kind]: key, content },
  })
  return [
    meta('description', 'name', m.description),
    meta('robots', 'name', m.indexable ? 'index,follow' : 'noindex,follow'),
    { tag: 'link', key: 'canonical', attrs: { rel: 'canonical', href: url } },
    meta('og:type', 'property', 'website'),
    meta('og:site_name', 'property', SITE_NAME),
    meta('og:locale', 'property', 'en_ZA'),
    meta('og:title', 'property', m.title),
    meta('og:description', 'property', m.description),
    meta('og:url', 'property', url),
    meta('og:image', 'property', image),
    meta('og:image:width', 'property', '1200'),
    meta('og:image:height', 'property', '630'),
    meta('twitter:card', 'name', 'summary_large_image'),
    meta('twitter:title', 'name', m.title),
    meta('twitter:description', 'name', m.description),
    meta('twitter:image', 'name', m.path === '/drive' ? image : twitterImage),
  ]
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

export const serialiseTags = (tags: HeadTag[]) =>
  tags
    .map(
      (t) =>
        `<${t.tag} ${Object.entries(t.attrs)
          .map(([k, v]) => `${k}="${esc(v)}"`)
          .join(' ')} data-head="${esc(t.key)}" />`
    )
    .join('\n    ')
