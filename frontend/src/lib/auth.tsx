import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { api } from './api'

export type Role = 'student' | 'admin'

export interface User {
  id: string
  email: string
  role: Role
  name: string
}

interface AuthState {
  user: User | null
  token: string | null
}

interface AuthContextValue extends AuthState {
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function decodeToken(token: string): User | null {
  try {
    const base64Url = token.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), '=')
    const payload = JSON.parse(decodeURIComponent(escape(atob(padded))))
    return { id: payload.sub, email: payload.email, role: payload.role, name: payload.name ?? payload.email }
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(() => {
    const token = localStorage.getItem('token')
    const user = token ? decodeToken(token) : null
    return user ? { token, user } : { token: null, user: null }
  })

  useEffect(() => {
    if (state.token) localStorage.setItem('token', state.token)
    else localStorage.removeItem('token')
  }, [state.token])

  async function login(email: string, password: string) {
    const { accessToken } = await api<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    })
    setState({ token: accessToken, user: decodeToken(accessToken) })
  }

  function logout() {
    setState({ token: null, user: null })
  }

  return <AuthContext.Provider value={{ ...state, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
