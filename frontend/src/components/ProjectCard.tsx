import { Link } from 'react-router-dom'
import { tileFor } from '../lib/color'
import { currency, relativeTime } from '../lib/format'
import type { Project } from '../lib/types'
import './ProjectCard.css'

const BUDGET_TYPE_LABEL: Record<Project['budgetType'], string> = {
  fixed_tier: 'Fixed price',
  custom: 'Custom quote',
}

export function ProjectCard({ project }: { project: Project }) {
  return (
    <Link to={`/projects/${project.id}`} className="project-card">
      <div className="project-card__tile" style={tileFor(project.id)}>
        {project.title.charAt(0).toUpperCase()}
      </div>
      <h3 className="project-card__title">{project.title}</h3>
      <p className="project-card__description">{project.description}</p>
      <div className="project-card__stats">
        <span className="project-card__stat">
          <strong>{currency.format(Number(project.budgetAmount))}</strong> {BUDGET_TYPE_LABEL[project.budgetType]}
        </span>
        <span className="project-card__stat project-card__stat--muted">{relativeTime(project.createdAt)}</span>
      </div>
    </Link>
  )
}
