import { Fragment } from 'react'

import { Placeholder } from './ui'

/** Renders text and highlights every [bracketed placeholder], so unfinished content is always visible. */
export function Bracketed({ text }: { text: string }) {
  return (
    <>
      {text
        .split(/(\[[^\]]+\])/g)
        .map((part, i) =>
          part.startsWith('[') && part.endsWith(']') ? <Placeholder key={i}>{part}</Placeholder> : <Fragment key={i}>{part}</Fragment>
        )}
    </>
  )
}
