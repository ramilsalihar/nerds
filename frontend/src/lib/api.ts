const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

export const UNAUTHORIZED_EVENT = 'auth:unauthorized'

interface ApiOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'
  body?: unknown
  token?: string | null
}

export async function api<T>(path: string, { method = 'GET', body, token }: ApiOptions = {}): Promise<T> {
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
