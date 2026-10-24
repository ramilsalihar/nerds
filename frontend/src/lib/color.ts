const PALETTE = ['blue', 'green', 'indigo', 'orange', 'pink', 'purple', 'red', 'teal', 'yellow'] as const

function hueFor(seed: string): (typeof PALETTE)[number] {
  let hash = 0
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0
  return PALETTE[hash % PALETTE.length]
}

export function colorFor(seed: string): string {
  // "-strong" tier: these fills carry white text on top (avatar initials),
  // so they need to stay ≥4.5:1 against white.
  return `var(--color-${hueFor(seed)}-strong)`
}

export function tileFor(seed: string): { background: string; color: string } {
  const hue = hueFor(seed)
  // Pastel tile + strong-tone letter — same accessible pair as colorFor,
  // just inverted (a light tint behind, not a solid fill under white text).
  return {
    background: `color-mix(in srgb, var(--color-${hue}-strong) 18%, white)`,
    color: `var(--color-${hue}-strong)`,
  }
}

export function initials(name: string): string {
  const parts = name.trim().split(/\s+/)
  const first = parts[0]?.[0] ?? ''
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? '') : ''
  return (first + last).toUpperCase()
}
