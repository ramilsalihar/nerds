const TOKEN_KEY = 'nerds.viewerToken'
const LIKED_KEY = 'nerds.likedProjectIds'

export function getViewerToken(): string {
  let token = localStorage.getItem(TOKEN_KEY)
  if (!token) {
    token = crypto.randomUUID()
    localStorage.setItem(TOKEN_KEY, token)
  }
  return token
}

export function hasLiked(projectId: string): boolean {
  return getLikedIds().has(projectId)
}

export function setLiked(projectId: string, liked: boolean) {
  const ids = getLikedIds()
  if (liked) ids.add(projectId)
  else ids.delete(projectId)
  localStorage.setItem(LIKED_KEY, JSON.stringify([...ids]))
}

function getLikedIds(): Set<string> {
  try {
    const raw = localStorage.getItem(LIKED_KEY)
    return new Set(raw ? (JSON.parse(raw) as string[]) : [])
  } catch {
    return new Set()
  }
}
