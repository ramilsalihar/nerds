import { Link, useNavigate } from 'react-router-dom'
import { tileFor } from '../lib/color'
import { relativeTime } from '../lib/format'
import type { Project } from '../lib/types'
import './ProjectCard.css'

interface ProjectCardProps {
  project: Project
  highlightLabel?: string
  highlightValue?: string | number
}

export function ProjectCard({ project, highlightLabel, highlightValue }: ProjectCardProps) {
  const navigate = useNavigate()

  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__top">
        <div className="project-card__tile" style={tileFor(project.id)}>
          {project.title.charAt(0).toUpperCase()}
        </div>
        {project.rank && <span className="project-card__rank">#{project.rank}</span>}
      </div>
      <h3 className="project-card__title">{project.title}</h3>
      {project.student && (
        <p
          className="project-card__student"
          onClick={(e) => {
            e.preventDefault()
            e.stopPropagation()
            navigate(`/students/${project.student!.id}`)
          }}
        >
          by {project.student.name}
        </p>
      )}
      {highlightLabel && (
        <p className="project-card__headline">
          <strong>{highlightValue}</strong> {highlightLabel.toLowerCase()}
        </p>
      )}
      <div className="project-card__stats">
        <span className="project-card__stat">
          <strong>{project.likeCount}</strong> likes
        </span>
        <span className="project-card__stat">
          <strong>{project.score}</strong> score
        </span>
        {project.deployed && <span className="project-card__badge">Deployed</span>}
        <span className="project-card__stat project-card__stat--muted">{relativeTime(project.createdAt)}</span>
      </div>
    </Link>
  )
}
