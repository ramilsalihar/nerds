import { useState } from 'react'
import { Route, Routes, useLocation } from 'react-router-dom'
import { ProtectedRoute, Sidebar, Topbar } from './components'
import { Admin } from './pages/Admin'
import { Dashboard } from './pages/Dashboard'
import { Donate } from './pages/Donate'
import { Login } from './pages/Login'
import { MyProjects } from './pages/MyProjects'
import { ProjectDetail } from './pages/ProjectDetail'
import { Register } from './pages/Register'
import { SubmitProject } from './pages/SubmitProject'
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
            <Route path="/donate" element={<Donate />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/my-projects"
              element={
                <ProtectedRoute roles={['student', 'client']}>
                  <MyProjects />
                </ProtectedRoute>
              }
            />
            <Route
              path="/submit-project"
              element={
                <ProtectedRoute roles={['client']}>
                  <SubmitProject />
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute roles={['admin']}>
                  <Admin />
                </ProtectedRoute>
              }
            />
          </Routes>
        </div>
      </div>
    </div>
  )
}
