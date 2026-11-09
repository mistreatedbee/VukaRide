import { describe, expect, it } from 'vitest'

const lum = (hex: string) => {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((c) => (c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)) as [number, number, number]
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}
const ratio = (a: string, b: string) => {
  const [hi, lo] = [lum(a), lum(b)].sort((x, y) => y - x) as [number, number]
  return (hi + 0.05) / (lo + 0.05)
}

const C = {
  deep: '#064E2B',
  green: '#0B8F3E',
  g600: '#097235',
  night: '#04371F',
  orange: '#F57C00',
  sun: '#FFB300',
  ink: '#111827',
  slate: '#4B5563',
  mist: '#F5F7F5',
  leaf: '#D1FAE5',
  white: '#FFFFFF',
  danger: '#B42318',
  g50: '#EBF6F0',
}

/** Every small-text pair used on the site must reach 4.5:1 (WCAG AA). */
const SMALL_TEXT: [string, string, string][] = [
  ['white on green-600 (buttons)', C.white, C.g600],
  ['white on deep', C.white, C.deep],
  ['leaf on deep', C.leaf, C.deep],
  ['leaf on night', C.leaf, C.night],
  ['leaf on green-600 (hero gradient start)', C.leaf, C.g600],
  ['sun on deep', C.sun, C.deep],
  ['sun on night', C.sun, C.night],
  ['ink on sun (gold buttons)', C.ink, C.sun],
  ['ink on white', C.ink, C.white],
  ['slate on white', C.slate, C.white],
  ['slate on mist', C.slate, C.mist],
  ['deep on white', C.deep, C.white],
  ['green-600 on white (links, eyebrows)', C.g600, C.white],
  ['green-600 on mist', C.g600, C.mist],
  ['green-600 on green-50', C.g600, C.g50],
  ['danger on white (errors)', C.danger, C.white],
  ['deep on sun (drive banner)', C.deep, C.sun],
]

describe('brand contrast rules', () => {
  it.each(SMALL_TEXT)('%s reaches 4.5:1', (_n, fg, bg) => expect(ratio(fg, bg)).toBeGreaterThanOrEqual(4.5))

  it('documents the pairs the brand forbids for small text', () => {
    expect(ratio(C.white, C.green)).toBeLessThan(4.5) // white on #0B8F3E
    expect(ratio(C.orange, C.white)).toBeLessThan(3) // orange on white
    expect(ratio(C.white, C.orange)).toBeLessThan(3) // white on orange
  })
})
