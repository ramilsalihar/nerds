import { useEffect, useMemo, useState } from 'react'
import { Card, ProjectCard } from '../components'
import { api } from '../lib/api'
import { tileFor } from '../lib/color'
import type { Project } from '../lib/types'
import './Dashboard.css'

export function Dashboard({ search = '' }: { search?: string }) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    api<Project[]>('/projects')
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
  }, [])

  const filtered = useMemo(() => {
    if (!projects) return []
    const query = search.trim().toLowerCase()
    if (!query) return projects
    return projects.filter(
      (p) =>
        p.title.toLowerCase().includes(query) ||
        p.description.toLowerCase().includes(query) ||
        p.student?.name.toLowerCase().includes(query),
    )
  }, [projects, search])

  if (error) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-red-strong)' }}>Couldn't load the leaderboard: {error}</p>
      </Card>
    )
  }

  if (!projects) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--label-secondary)' }}>Loading…</p>
      </Card>
    )
  }

  const top3 = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Leaderboard</h1>
        <p className="dashboard__subtitle">
          Ranked by users, revenue, ratings, deploy status and likes — keep shipping to climb.
        </p>
      </div>

      {filtered.length === 0 && (
        <Card>
          <p style={{ margin: 0, color: 'var(--label-secondary)' }}>No projects match right now.</p>
        </Card>
      )}

      {top3.length > 0 && (
        <div className="podium">
          {[top3[1], top3[0], top3[2]].map((project, i) =>
            project ? <PodiumSpot key={project.id} project={project} place={[2, 1, 3][i]} /> : <div key={`empty-${i}`} />,
          )}
        </div>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="dashboard__section-title">Everyone else</h2>
          <div className="dashboard__grid">
            {rest.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PodiumSpot({ project, place }: { project: Project; place: number }) {
  return (
    <a href={`/projects/${project.id}`} className={`podium__spot podium__spot--${place}`}>
      <div className="podium__medal">{place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}</div>
      <div className="podium__tile" style={tileFor(project.id)}>
        {project.title.charAt(0).toUpperCase()}
      </div>
      <h3 className="podium__title">{project.title}</h3>
      {project.student && <p className="podium__student">by {project.student.name}</p>}
      <p className="podium__score">{project.score} pts</p>
      <p className="podium__likes">{project.likeCount} likes</p>
    </a>
  )
}
