import { Link } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import { colorFor, initials } from '../lib/color'
import './Topbar.css'

interface TopbarProps {
  search?: string
  onSearchChange?: (value: string) => void
}

export function Topbar({ search, onSearchChange }: TopbarProps) {
  const { user } = useAuth()

  return (
    <header className="topbar">
      {onSearchChange ? (
        <div className="topbar__search">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            placeholder="Search projects or budget type"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      ) : (
        <span />
      )}

      {user ? (
        <div className="topbar__user">
          <div className="topbar__greeting">
            <span className="topbar__greeting-label">Welcome back,</span>
            <span className="topbar__greeting-name">{user.name}</span>
          </div>
          <div className="topbar__avatar" style={{ background: colorFor(user.id) }}>
            {initials(user.name)}
          </div>
        </div>
      ) : (
        <Link to="/login" className="topbar__login">
          Log in
        </Link>
      )}
    </header>
  )
}
