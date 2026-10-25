import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Card } from '../components'
import { api } from '../lib/api'
import { colorFor, initials } from '../lib/color'
import type { Project, Student } from '../lib/types'
import './StudentProfile.css'

export function StudentProfile() {
  const { id } = useParams<{ id: string }>()
  const [student, setStudent] = useState<Student | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    api<Student>(`/users/${id}`).then(setStudent).catch((err: Error) => setError(err.message))
    api<Project[]>('/projects')
      .then((all) => setProjects(all.filter((p) => p.studentId === id)))
      .catch((err: Error) => setError(err.message))
  }, [id])

  if (error) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-red-strong)' }}>Couldn't load this profile: {error}</p>
      </Card>
    )
  }

  if (!student) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--label-secondary)' }}>Loading…</p>
      </Card>
    )
  }

  const skills = student.studentProfile?.skills ?? []
  const links = student.studentProfile?.portfolioLinks ?? []

  return (
    <div className="student-profile">
      <Card>
        <div className="student-profile__header">
          <div className="student-profile__avatar" style={{ background: colorFor(student.id) }}>
            {student.avatarUrl ? <img src={student.avatarUrl} alt={student.name} /> : initials(student.name)}
          </div>
          <div>
            <h1 className="student-profile__name">{student.name}</h1>
            {(student.className || student.graduationYear) && (
              <p className="student-profile__meta">
                {[student.className, student.graduationYear ? `Class of ${student.graduationYear}` : null].filter(Boolean).join(' · ')}
              </p>
            )}
            {student.bio && <p className="student-profile__bio">{student.bio}</p>}

            <div className="student-profile__contact">
              <a className="student-profile__project-link" href={`mailto:${student.email}`}>
                ✉ {student.email}
              </a>
              {links.map((link) => (
                <a key={link} className="student-profile__project-link" href={link} target="_blank" rel="noreferrer">
                  {link.replace(/^https?:\/\//, '')} ↗
                </a>
              ))}
            </div>

            {skills.length > 0 && (
              <div className="student-profile__skills">
                {skills.map((skill) => (
                  <span key={skill} className="student-profile__skill">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </Card>

      <Card>
        <h2 className="student-profile__section-title">Projects</h2>
        {projects === null ? (
          <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
        ) : projects.length === 0 ? (
          <p style={{ color: 'var(--label-secondary)' }}>No projects published yet.</p>
        ) : (
          projects.map((p) => (
            <div key={p.id} className="student-profile__project">
              <h3 className="student-profile__project-title">{p.title}</h3>
              <p className="student-profile__project-desc">{p.description}</p>
              <div className="student-profile__project-links">
                {p.repoUrl && (
                  <a className="student-profile__project-link" href={p.repoUrl} target="_blank" rel="noreferrer">
                    GitHub ↗
                  </a>
                )}
                {p.liveUrl && (
                  <a className="student-profile__project-link" href={p.liveUrl} target="_blank" rel="noreferrer">
                    Live demo ↗
                  </a>
                )}
                {p.videoUrl && (
                  <a className="student-profile__project-link" href={p.videoUrl} target="_blank" rel="noreferrer">
                    Demo video ↗
                  </a>
                )}
              </div>
              {p.imageUrls.length > 0 && (
                <div className="student-profile__images">
                  {p.imageUrls.map((src) => (
                    <img key={src} src={src} alt={`${p.title} screenshot`} />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </Card>
    </div>
  )
}
