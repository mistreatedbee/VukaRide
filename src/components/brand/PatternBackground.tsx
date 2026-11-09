type Pattern = 'road' | 'mark' | 'dots'
type Tone = 'dark' | 'light'

const SIZE: Record<Pattern, number> = { road: 60, mark: 120, dots: 96 }

/**
 * Tone-on-tone brand pattern (tiles from the brand pack, in /public/patterns) laid over its parent.
 * The parent must be `relative`.
 */
export function PatternBackground({ pattern, tone = 'dark', className = '' }: { pattern: Pattern; tone?: Tone; className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: `url(/patterns/tile-${pattern}-${tone}.svg)`, backgroundSize: `${SIZE[pattern]}px ${SIZE[pattern]}px` }}
    />
  )
}
