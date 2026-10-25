import { Link } from 'react-router-dom'
import { tileFor } from '../lib/color'
import { relativeTime } from '../lib/format'
import type { Project } from '../lib/types'
import './ProjectCard.css'

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__top">
        <div className="project-card__tile" style={tileFor(project.id)}>
          {project.title.charAt(0).toUpperCase()}
        </div>
        {project.rank && <span className="project-card__rank">#{project.rank}</span>}
      </div>
      <h3 className="project-card__title">{project.title}</h3>
      {project.student && <p className="project-card__student">by {project.student.name}</p>}
      <p className="project-card__description">{project.description}</p>
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
