// Shared helpers for the link-preview functions (api/share.ts, api/og.ts).
// Files under api/_lib are not deployed as functions (underscore prefix).

export interface ShareSummary {
  id: string
  title: string
  description: string
  imageUrl: string | null
  type: 'startup' | 'outsource'
  deployed: boolean
  likeCount: number
  rank: number
  totalProjects: number
  updatedAt: string
  student: { id: string; name: string; avatarUrl: string | null } | null
}

// Ranks shown on the card. Below this we show likes instead, so a share never
// advertises "#47 of 50".
export const SHOW_RANK_UP_TO = 10

const API_URL = process.env.API_URL ?? process.env.VITE_API_URL ?? 'http://localhost:3000'

// The backend sleeps on Render's free plan and takes ~30s+ to wake. Crawlers
// give up after a few seconds, so fail fast and let the CDN cache carry us.
const FETCH_TIMEOUT_MS = 4000

export async function fetchShareSummary(id: string): Promise<ShareSummary | null> {
  try {
    const res = await fetch(`${API_URL}/projects/${encodeURIComponent(id)}/share`, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
    })
    if (!res.ok) return null
    return (await res.json()) as ShareSummary
  } catch {
    return null
  }
}

export function truncate(text: string, max: number): string {
  const clean = text.replace(/\s+/g, ' ').trim()
  return clean.length <= max ? clean : `${clean.slice(0, max - 1).trimEnd()}…`
}

// Cloudinary can resize and re-encode on the fly. Satori (the OG renderer)
// can't decode WebP, and our uploads are WebP, so force JPEG here.
export function cloudinaryVariant(url: string, transform: string): string {
  const marker = '/image/upload/'
  const at = url.indexOf(marker)
  if (at === -1 || !url.includes('res.cloudinary.com')) return url
  const head = url.slice(0, at + marker.length)
  return `${head}${transform}/${url.slice(at + marker.length)}`
}
