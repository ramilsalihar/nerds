const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

// Public GETs kicked off at boot (see lib/preload.ts) so pages don't wait on a second round-trip.
// Entries live briefly: long enough for the first page render (and StrictMode's double effect), short
// enough that later navigations still get fresh data. Any write clears them.
const PREFETCH_TTL_MS = 5000
const prefetched = new Map<string, { promise: Promise<unknown>; at: number }>()

export function prefetch(path: string): Promise<unknown> {
  const promise = request(path, {})
  // Swallow here; the page's own api() call sees the rejection and shows its error state.
  promise.catch(() => {})
  prefetched.set(path, { promise, at: Date.now() })
  return promise
}

export function api<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const method = options.method ?? 'GET'
  if (method !== 'GET') {
    prefetched.clear()
  } else if (!options.token) {
    const hit = prefetched.get(path)
    if (hit && Date.now() - hit.at < PREFETCH_TTL_MS) return hit.promise as Promise<T>
    prefetched.delete(path)
  }
  return request<T>(path, options)
}

async function request<T>(path: string, { method = 'GET', body, token }: ApiOptions): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })

  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined

  if (res.status === 401 && token) {
    window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  }

  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(', ') : (data?.message ?? res.statusText)
    throw new Error(message)
  }

  return data as T
}

// Multipart upload: let the browser set the Content-Type boundary.
export async function uploadImage(file: Blob, token: string | null): Promise<{ url: string }> {
  const form = new FormData()
  form.append('file', file, 'image.webp')
  const res = await fetch(`${API_URL}/uploads/image`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  })
  const text = await res.text()
  const data = text ? JSON.parse(text) : undefined
  if (res.status === 401 && token) window.dispatchEvent(new Event(UNAUTHORIZED_EVENT))
  if (!res.ok) throw new Error(data?.message ?? res.statusText)
  return data as { url: string }
}
