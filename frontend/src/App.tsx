import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute, Sidebar, Topbar } from './components'
import { Dashboard } from './pages/Dashboard'
import { Login } from './pages/Login'
import { ProjectDetail } from './pages/ProjectDetail'
import { Projects } from './pages/Projects'
import { Settings } from './pages/Settings'
import { Students } from './pages/Students'
import './App.css'

export default function App() {
  const location = useLocation()
  const [search, setSearch] = useState('')
  const isDashboard = location.pathname === '/'

  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-shell__main">
        <Topbar search={isDashboard ? search : undefined} onSearchChange={isDashboard ? setSearch : undefined} />
        <div className="app-shell__content">
          <Routes>
            <Route path="/" element={<Dashboard search={search} />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />
            <Route
              path="/projects"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Projects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/students"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Students />
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Settings />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
