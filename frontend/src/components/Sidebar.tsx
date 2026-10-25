import type { ReactNode, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../lib/auth'
import './Sidebar.css'

function Icon({ children, ...rest }: SVGProps<SVGSVGElement>) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...rest}>
      {children}
    </svg>
  )
}

const HomeIcon = () => (
  <Icon>
    <path d="M3 11.5 12 4l9 7.5" />
    <path d="M5.5 10v9a1 1 0 0 0 1 1H9a1 1 0 0 0 1-1v-4a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v4a1 1 0 0 0 1 1h2.5a1 1 0 0 0 1-1v-9" />
  </Icon>
)

const StudentsIcon = () => (
  <Icon>
    <circle cx="9" cy="8" r="3.2" />
    <path d="M3.5 19.5c.6-3.4 2.9-5.2 5.5-5.2s4.9 1.8 5.5 5.2" />
    <circle cx="17.5" cy="8.5" r="2.4" />
    <path d="M15.8 14.6c2.2.2 4 1.8 4.5 4.6" />
  </Icon>
)

const ProjectsIcon = () => (
  <Icon>
    <rect x="4" y="4" width="16" height="16" rx="2" />
    <path d="M8 9h8M8 13h8M8 17h5" />
  </Icon>
)

const SettingsIcon = () => (
  <Icon>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.7 1.7 0 0 0-1.87-.34 1.7 1.7 0 0 0-1.04 1.56V19.6a2 2 0 1 1-4 0v-.09a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.7 1.7 0 0 0 .34-1.87 1.7 1.7 0 0 0-1.56-1.04H2.4a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.05 8.5a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.7 1.7 0 0 0 1.87.34H8.5a1.7 1.7 0 0 0 1.04-1.56V2.4a2 2 0 1 1 4 0v.09a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.7 1.7 0 0 0-.34 1.87V8.5a1.7 1.7 0 0 0 1.56 1.04h.09a2 2 0 1 1 0 4h-.09a1.7 1.7 0 0 0-1.56 1.04Z" />
  </Icon>
)

const LoginIcon = () => (
  <Icon>
    <path d="M15 3h4a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1h-4" />
    <path d="M10 17l5-5-5-5M15 12H3" />
  </Icon>
)

const LogoutIcon = () => (
  <Icon>
    <path d="M9 21H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1h4" />
    <path d="M16 17l5-5-5-5M21 12H9" />
  </Icon>
)

export function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <div className="sidebar-rail">
      <nav className="sidebar">
        <div className="sidebar__group">
          <div className="sidebar__logo-row">
            <div className="sidebar__logo">n</div>
            <span className="sidebar__wordmark">nerds</span>
          </div>
          <SidebarLink to="/" label="Dashboard" icon={<HomeIcon />} end />
          {user?.role === 'admin' && <SidebarLink to="/projects" label="Projects" icon={<ProjectsIcon />} />}
          {user?.role === 'admin' && <SidebarLink to="/students" label="Students" icon={<StudentsIcon />} />}
          {user?.role === 'admin' && <SidebarLink to="/settings" label="Settings" icon={<SettingsIcon />} />}
          {user?.role === 'student' && <SidebarLink to="/profile" label="My profile" icon={<StudentsIcon />} />}
        </div>

        <div className="sidebar__group">
          {user ? (
            <button className="sidebar__item" title="Log out" onClick={logout}>
              <span className="sidebar__icon">
                <LogoutIcon />
              </span>
              <span className="sidebar__label">Log out</span>
            </button>
          ) : (
            <SidebarLink to="/login" label="Log in" icon={<LoginIcon />} />
          )}
        </div>
      </nav>
    </div>
  )
}

function SidebarLink({ to, label, icon, end }: { to: string; label: string; icon: ReactNode; end?: boolean }) {
  return (
    <NavLink to={to} end={end} title={label} className={({ isActive }) => `sidebar__item ${isActive ? 'sidebar__item--active' : ''}`}>
      <span className="sidebar__icon">{icon}</span>
      <span className="sidebar__label">{label}</span>
    </NavLink>
  )
}
