const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000'

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

  if (!res.ok) {
    const message = Array.isArray(data?.message) ? data.message.join(', ') : (data?.message ?? res.statusText)
    throw new Error(message)
  }

  return data as T
}
