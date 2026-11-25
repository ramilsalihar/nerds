import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card, PillFilter, ProjectCard } from '../components'
import { api } from '../lib/api'
import { tileFor } from '../lib/color'
import type { Project, ProjectType } from '../lib/types'
import './Dashboard.css'

type TypeFilter = 'all' | ProjectType

const TYPE_PILLS: { label: string; value: TypeFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Startups', value: 'startup' },
  { label: 'Outsource', value: 'outsource' },
]

type SortKey = 'score' | 'usersCount' | 'revenueAmount' | 'likeCount'

const SORT_PILLS: { label: string; value: SortKey }[] = [
  { label: 'Top score', value: 'score' },
  { label: 'Most users', value: 'usersCount' },
  { label: 'Most revenue', value: 'revenueAmount' },
  { label: 'Most liked', value: 'likeCount' },
]

const METRIC_LABEL: Record<SortKey, string> = {
  score: 'Score',
  usersCount: 'Users',
  revenueAmount: 'Revenue',
  likeCount: 'Likes',
}

function metricValue(project: Project, sortKey: SortKey) {
  switch (sortKey) {
    case 'usersCount':
      return project.usersCount
    case 'revenueAmount':
      return `$${Number(project.revenueAmount).toLocaleString()}`
    case 'likeCount':
      return project.likeCount
    default:
      return project.score
  }
}

export function Dashboard({ search = '' }: { search?: string }) {
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [sortKey, setSortKey] = useState<SortKey>('score')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')

  useEffect(() => {
    api<Project[]>('/projects')
      .then(setProjects)
      .catch((err: Error) => setError(err.message))
  }, [])

  const ranked = useMemo(() => {
    if (!projects) return []
    const query = search.trim().toLowerCase()
    const ofType = typeFilter === 'all' ? projects : projects.filter((p) => p.type === typeFilter)
    const filtered = query
      ? ofType.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.description.toLowerCase().includes(query) ||
            p.student?.name.toLowerCase().includes(query),
        )
      : ofType
    const sorted = [...filtered].sort((a, b) => Number(b[sortKey]) - Number(a[sortKey]))
    return sorted.map((p, i) => ({ ...p, rank: i + 1 }))
  }, [projects, search, sortKey, typeFilter])

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

  const top3 = ranked.slice(0, 3)
  const rest = ranked.slice(3)

  const totalEarnings = projects.reduce((sum, p) => sum + Number(p.revenueAmount), 0)
  const totalUsers = projects.reduce((sum, p) => sum + p.usersCount, 0)

  return (
    <div className="dashboard">
      <div className="dashboard__header">
        <h1 className="dashboard__title">Leaderboard</h1>
        <p className="dashboard__subtitle">Project statistics, ranked — keep shipping to climb.</p>
      </div>

      <div className="dashboard__stats">
        <Card className="dashboard__stat">
          <p className="dashboard__stat-label">Total earnings</p>
          <p className="dashboard__stat-value">${totalEarnings.toLocaleString()}</p>
        </Card>
        <Card className="dashboard__stat">
          <p className="dashboard__stat-label">Total users</p>
          <p className="dashboard__stat-value">{totalUsers.toLocaleString()}</p>
        </Card>
      </div>

      <PillFilter options={TYPE_PILLS} value={typeFilter} onChange={setTypeFilter} />
      <PillFilter options={SORT_PILLS} value={sortKey} onChange={setSortKey} />

      {ranked.length === 0 && (
        <Card>
          <p style={{ margin: 0, color: 'var(--label-secondary)' }}>No projects match right now.</p>
        </Card>
      )}

      {top3.length > 0 && (
        <div className="podium">
          {top3.map((project, i) => (
            <PodiumSpot key={project.id} project={project} place={i + 1} metricLabel={METRIC_LABEL[sortKey]} metricVal={metricValue(project, sortKey)} />
          ))}
        </div>
      )}

      {rest.length > 0 && (
        <>
          <h2 className="dashboard__section-title">Everyone else</h2>
          <div className="dashboard__grid">
            {rest.map((project) => (
              <ProjectCard key={project.id} project={project} highlightLabel={METRIC_LABEL[sortKey]} highlightValue={metricValue(project, sortKey)} />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PodiumSpot({
  project,
  place,
  metricLabel,
  metricVal,
}: {
  project: Project
  place: number
  metricLabel: string
  metricVal: string | number
}) {
  const navigate = useNavigate()
  const image = project.imageUrls[0]

  return (
    <a
      href={`/projects/${project.id}`}
      className={`podium__spot podium__spot--${place}`}
      style={image ? undefined : tileFor(project.id)}
      onClick={(e) => {
        e.preventDefault()
        navigate(`/projects/${project.id}`)
      }}
    >
      {image ? (
        <img className="podium__bg" src={image} alt="" />
      ) : (
        <span className="podium__initial" aria-hidden="true">
          {project.title.charAt(0).toUpperCase()}
        </span>
      )}
      <div className="podium__shade" aria-hidden="true" />
      <div className="podium__medal" aria-label={`Rank ${place}`}>{place === 1 ? '🥇' : place === 2 ? '🥈' : '🥉'}</div>
      <div className="podium__info">
        <h3 className="podium__title">{project.title}</h3>
        {project.student && (
          <p
            className="podium__student"
            onClick={(e) => {
              e.preventDefault()
              e.stopPropagation()
              navigate(`/students/${project.student!.id}`)
            }}
          >
            by {project.student.name}
          </p>
        )}
        <p className="podium__score">
          {metricVal} {metricLabel.toLowerCase()}
        </p>
      </div>
    </a>
  )
}
