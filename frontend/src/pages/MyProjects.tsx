import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, List, ListRow } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { currency, relativeTime } from '../lib/format'
import type { Application, Project } from '../lib/types'

const STATUS_LABEL: Record<Project['status'], string> = {
  pending_review: 'Pending review',
  open: 'Open',
  in_progress: 'In progress',
  submitted: 'Submitted',
  completed: 'Completed',
  disputed: 'Disputed',
  rejected: 'Rejected',
}

export function MyProjects() {
  const { user, token } = useAuth()
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [applications, setApplications] = useState<Application[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!user) return
    const path = user.role === 'client' ? '/projects/mine/client' : '/projects/mine/student'
    api<Project[]>(path, { token }).then(setProjects).catch((err: Error) => setError(err.message))
    if (user.role === 'student') {
      api<Application[]>('/applications/mine', { token }).then(setApplications).catch(() => {})
    }
  }, [user, token])

  if (!user) return null

  const pendingApplications = applications?.filter((a) => a.status !== 'accepted') ?? []

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Card>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 650, color: 'var(--label-primary)', margin: '0 0 4px' }}>
          {user.role === 'client' ? 'Your projects' : 'Your work'}
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--label-secondary)', margin: '0 0 4px' }}>
          {user.role === 'client'
            ? 'Every project you have posted, at any stage.'
            : 'Projects you are assigned to.'}
        </p>
      </Card>

      <Card>
        {error && <p style={{ color: 'var(--color-red-strong)' }}>{error}</p>}
        {projects === null ? (
          <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
        ) : projects.length === 0 ? (
          <p style={{ color: 'var(--label-secondary)' }}>Nothing here yet.</p>
        ) : (
          <List>
            {projects.map((project) => (
              <ListRow
                key={project.id}
                interactive
                title={project.title}
                subtitle={`${STATUS_LABEL[project.status]} · ${currency.format(Number(project.budgetAmount))} · ${relativeTime(project.createdAt)}`}
                onClick={() => navigate(`/projects/${project.id}`)}
              />
            ))}
          </List>
        )}
      </Card>

      {user.role === 'student' && pendingApplications.length > 0 && (
        <Card>
          <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 16, fontWeight: 650, color: 'var(--label-primary)', margin: '0 0 12px' }}>
            Your applications
          </h2>
          <List>
            {pendingApplications.map((app) => (
              <ListRow
                key={app.id}
                interactive
                title={app.project?.title ?? 'Project'}
                subtitle={`Status: ${app.status}`}
                onClick={() => navigate(`/projects/${app.projectId}`)}
              />
            ))}
          </List>
        </Card>
      )}
    </div>
  )
}
