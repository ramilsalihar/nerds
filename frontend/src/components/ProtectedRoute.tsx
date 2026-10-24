import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth, type Role } from '../lib/auth'

export function ProtectedRoute({ roles, children }: { roles: Role[]; children: ReactNode }) {
  const { user } = useAuth()

  if (!user) return <Navigate to="/login" replace />
  if (!roles.includes(user.role)) return <Navigate to="/" replace />

  return <>{children}</>
}
