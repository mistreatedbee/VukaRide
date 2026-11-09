import React from 'react'

type Pattern = 'road' | 'mark' | 'dots' | 'lanes'
type Tone = 'dark' | 'light'

/**
 * Tone-on-tone brand pattern laid over its parent. The parent must be `relative`.
 * Dark tone: white at 10%. Light tone: deep green at 12%.
 */
export function PatternBackground({ pattern, tone = 'dark', className = '' }: { pattern: Pattern; tone?: Tone; className?: string }) {
  const url = `url("data:image/svg+xml,${encodeURIComponent(svgFor(pattern, tone))}")`
  const size = { road: '60px 60px', mark: '120px 120px', dots: '96px 96px', lanes: '80px 40px' }[pattern]
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 ${className}`}
      style={{ backgroundImage: url, backgroundSize: size }}
    />
  )
}

function svgFor(pattern: Pattern, tone: Tone) {
  const ink = tone === 'dark' ? 'rgba(255,255,255,0.10)' : 'rgba(6,78,43,0.12)'
  const gold = 'rgba(255,179,0,0.45)'
  switch (pattern) {
    case 'road':
      return `<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60'><path d='M0 15 L30 45 L60 15' fill='none' stroke='${ink}' stroke-width='7' stroke-linecap='round' stroke-linejoin='round'/><circle cx='30' cy='30' r='4.5' fill='${gold}'/></svg>`
    case 'mark': {
      const m = (x: number, y: number) =>
        `<g transform='translate(${x} ${y}) scale(0.135)'><path d='M138 196 L256 388 L374 196' transform='translate(-256 -256)' fill='none' stroke='${ink}' stroke-width='76' stroke-linecap='round' stroke-linejoin='round'/><circle cx='0' cy='-98' r='46' fill='${ink}'/></g>`
      return `<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'>${m(30, 30)}${m(90, 90)}${m(90, -30)}${m(30, 150)}</svg>`
    }
    case 'dots': {
      let dots = ''
      for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) dots += `<circle cx='${12 + i * 24}' cy='${12 + j * 24}' r='1.6' fill='${ink}'/>`
      return `<svg xmlns='http://www.w3.org/2000/svg' width='96' height='96'>${dots}<circle cx='60' cy='36' r='4' fill='rgba(245,124,0,0.35)'/></svg>`
    }
    case 'lanes':
      return `<svg xmlns='http://www.w3.org/2000/svg' width='80' height='40'><g transform='skewX(-18)'><rect x='14' y='16' width='22' height='7' rx='3.5' fill='${ink}'/><rect x='54' y='16' width='22' height='7' rx='3.5' fill='rgba(245,124,0,0.3)'/></g></svg>`
  }
}
