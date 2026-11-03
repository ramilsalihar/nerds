import { useEffect, useMemo, useState } from 'react'
import { Button, Card, List, ListRow, MetricChart, PillFilter, ProjectForm } from '../components'
import type { ChartMetricKey } from '../components'
import { metricValueOf } from '../components/MetricChart'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { relativeTime } from '../lib/format'
import type { Project, Student } from '../lib/types'
import './Projects.css'

const FILTER_PILLS: { label: string; value: ChartMetricKey }[] = [
  { label: 'Score', value: 'score' },
  { label: 'Users', value: 'usersCount' },
  { label: 'Earned money', value: 'revenueAmount' },
  { label: 'Likes', value: 'likeCount' },
  { label: 'UI/UX', value: 'uiUxRating' },
  { label: 'Functionality', value: 'functionalityRating' },
]

const FILTER_LABEL: Record<ChartMetricKey, string> = {
  score: 'Score',
  usersCount: 'Users',
  revenueAmount: 'Earned money',
  likeCount: 'Likes',
  uiUxRating: 'UI/UX',
  functionalityRating: 'Functionality',
}

export function Projects() {
  const { token } = useAuth()
  const [students, setStudents] = useState<Student[] | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [creating, setCreating] = useState(false)
  const [activeFilter, setActiveFilter] = useState<ChartMetricKey | null>(null)

  function loadStudents() {
    api<Student[]>('/users/students', { token })
      .then(setStudents)
      .catch((err: Error) => setError(err.message))
  }

  function loadProjects() {
    api<Project[]>('/projects')
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    loadStudents()
    loadProjects()
  }, [])

  const formOpen = creating || editingProject !== null

  function closeForm() {
    setCreating(false)
    setEditingProject(null)
  }

  function toggleFilter(filter: ChartMetricKey) {
    setActiveFilter((prev) => (prev === filter ? null : filter))
  }

  const sortedProjects = useMemo(() => {
    if (!projects) return null
    if (!activeFilter) return projects
    return [...projects].sort((a, b) => metricValueOf(b, activeFilter) - metricValueOf(a, activeFilter))
  }, [projects, activeFilter])

  return (
    <div className="projects-admin">
      <div className="projects-admin__header">
        <h1 className="projects-admin__title">Projects</h1>
        <p className="projects-admin__subtitle">Add a project and connect it to the student who built it.</p>
      </div>

      {error && <p className="projects-admin__error">{error}</p>}

      <Card>
        <div className="projects-admin__section-header">
          <h2 className="projects-admin__section-title">{formOpen ? (editingProject ? `Edit "${editingProject.title}"` : 'Add a project') : 'Projects'}</h2>
          {!formOpen && (
            <Button variant="filled" size="small" onClick={() => setCreating(true)} disabled={!students || students.length === 0}>
              + Add project
            </Button>
          )}
        </div>

        {!formOpen && students !== null && students.length === 0 && (
          <p style={{ color: 'var(--label-secondary)' }}>Add a student first on the Students page before connecting a project.</p>
        )}

        {formOpen && (
          <ProjectForm
            students={students ?? []}
            project={editingProject ?? undefined}
            onSuccess={() => {
              closeForm()
              loadProjects()
            }}
            onCancel={closeForm}
          />
        )}

        {!formOpen && (
          sortedProjects === null ? (
            <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
          ) : sortedProjects.length === 0 ? (
            <p style={{ color: 'var(--label-secondary)' }}>No projects yet.</p>
          ) : (
            <>
              <div className="projects-admin__filters">
                <PillFilter options={FILTER_PILLS} value={activeFilter ?? ('' as ChartMetricKey)} onChange={toggleFilter} />
              </div>

              {activeFilter && <MetricChart projects={sortedProjects} metricKey={activeFilter} label={FILTER_LABEL[activeFilter]} />}

              <List>
                {sortedProjects.map((p) => (
                  <ListRow
                    key={p.id}
                    title={`#${p.rank} · ${p.title}`}
                    subtitle={`${p.student?.name ?? 'Unassigned'} · score ${p.score} · ${p.likeCount} likes · ${relativeTime(p.createdAt)}`}
                    trailing={
                      <Button variant="tinted" size="small" onClick={() => setEditingProject(p)}>
                        Edit
                      </Button>
                    }
                  />
                ))}
              </List>
            </>
          )
        )}
      </Card>
    </div>
  )
}
