import type { Project } from './types'

// /p/:id is served by api/share.ts with link-preview meta tags; the SPA then
// renders the same page as /projects/:id.
export function shareUrl(projectId: string): string {
  return `${window.location.origin}/p/${projectId}`
}

export function ogImageUrl(project: Pick<Project, 'id' | 'updatedAt'>): string {
  return `/api/og?id=${encodeURIComponent(project.id)}&v=${new Date(project.updatedAt).getTime()}`
}

export type SharePlatform = 'x' | 'linkedin' | 'telegram' | 'whatsapp' | 'facebook'

export const SHARE_PLATFORMS: { id: SharePlatform; label: string }[] = [
  { id: 'x', label: 'X' },
  { id: 'linkedin', label: 'LinkedIn' },
  { id: 'telegram', label: 'Telegram' },
  { id: 'whatsapp', label: 'WhatsApp' },
  { id: 'facebook', label: 'Facebook' },
]

export function platformShareUrl(platform: SharePlatform, url: string, text: string): string {
  const u = encodeURIComponent(url)
  const t = encodeURIComponent(text)
  switch (platform) {
    case 'x':
      return `https://twitter.com/intent/tweet?text=${t}&url=${u}`
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${u}`
    case 'telegram':
      return `https://t.me/share/url?url=${u}&text=${t}`
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${u}`
  }
}

// Caption suggestions. Owners speak in first person; everyone else promotes
// someone else's work.
export function ownerCaptions(project: Pick<Project, 'title' | 'rank'>): string[] {
  const captions = [
    `I built ${project.title} 🚀 Check it out and leave a like!`,
    `Shipped my project ${project.title}. Would love your feedback 🙌`,
  ]
  if (project.rank && project.rank <= 10) {
    captions.unshift(`${project.title} is #${project.rank} on the nerds leaderboard 🏆 Help me climb higher!`)
  }
  return captions
}

export function viewerCaption(project: Pick<Project, 'title' | 'student'>): string {
  const by = project.student ? ` by ${project.student.name}` : ''
  return `Check out ${project.title}${by} 👀`
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

// Native share sheet is the best experience on phones; on desktop it's
// often a thin OS dialog, so we prefer our own menu there.
export function canNativeShare(): boolean {
  return typeof navigator.share === 'function' && window.matchMedia('(pointer: coarse)').matches
}
