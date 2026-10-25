import { useEffect, useState } from 'react'
import { Button, Card, ProjectForm, TextField, Textarea } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Project, Student } from '../lib/types'
import './Profile.css'

export function Profile() {
  const { user } = useAuth()
  const [student, setStudent] = useState<Student | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | 'new' | null>(null)

  function load() {
    if (!user) return
    api<Student>(`/users/${user.id}`).then(setStudent).catch((err: Error) => setError(err.message))
    api<Project[]>('/projects')
      .then((all) => setProjects(all.filter((p) => p.studentId === user.id)))
      .catch((err: Error) => setError(err.message))
  }

  useEffect(load, [user])

  if (!user) return null

  return (
    <div className="profile">
      <div className="profile__header">
        <h1 className="profile__title">My profile</h1>
        <p className="profile__subtitle">Viewers see this on your public page — keep it current so people can reach you.</p>
      </div>

      {error && <p className="profile__error">{error}</p>}

      <Card>
        <h2 className="profile__section-title">Profile details</h2>
        {student ? <ProfileForm student={student} onSaved={load} /> : <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>}
      </Card>

      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h2 className="profile__section-title" style={{ margin: 0 }}>
            My projects
          </h2>
          {editingProject === null && (
            <Button variant="tinted" size="small" onClick={() => setEditingProject('new')}>
              + Add a project
            </Button>
          )}
        </div>

        {editingProject === null && projects && (
          <div className="profile__project-list">
            {projects.length === 0 && <p style={{ color: 'var(--label-secondary)' }}>No project yet — add one above.</p>}
            {projects.map((p) => (
              <div key={p.id} className="profile__project-row">
                <span>{p.title}</span>
                <Button variant="tinted" size="small" onClick={() => setEditingProject(p)}>
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}

        {editingProject !== null && student && (
          <ProjectForm
            students={[student]}
            lockStudent
            project={editingProject === 'new' ? undefined : editingProject}
            onSuccess={() => {
              setEditingProject(null)
              load()
            }}
            onCancel={() => setEditingProject(null)}
          />
        )}
      </Card>
    </div>
  )
}

function ProfileForm({ student, onSaved }: { student: Student; onSaved: () => void }) {
  const { token } = useAuth()
  const [bio, setBio] = useState(student.bio ?? '')
  const [avatarUrl, setAvatarUrl] = useState(student.avatarUrl ?? '')
  const [className, setClassName] = useState(student.className ?? '')
  const [graduationYear, setGraduationYear] = useState(String(student.graduationYear ?? ''))
  const [skills, setSkills] = useState((student.studentProfile?.skills ?? []).join(', '))
  const [portfolioLinks, setPortfolioLinks] = useState((student.studentProfile?.portfolioLinks ?? []).join('\n'))
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    try {
      await api(`/users/${student.id}`, {
        method: 'PATCH',
        token,
        body: {
          bio: bio || undefined,
          avatarUrl: avatarUrl || undefined,
          className: className || undefined,
          graduationYear: graduationYear ? Number(graduationYear) : undefined,
          skills: skills
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean),
          portfolioLinks: portfolioLinks
            .split('\n')
            .map((s) => s.trim())
            .filter(Boolean),
        },
      })
      setSuccess(true)
      onSaved()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="profile__form">
      <p style={{ margin: 0, color: 'var(--label-secondary)', fontSize: 13 }}>
        Contact email (shown to viewers): <strong>{student.email}</strong>
      </p>
      <Textarea id="bio" label="Bio" rows={3} value={bio} onChange={(e) => setBio(e.target.value)} />
      <TextField id="avatarUrl" label="Avatar image URL (optional)" type="url" value={avatarUrl} onChange={(e) => setAvatarUrl(e.target.value)} />
      <div className="profile__row">
        <TextField id="className" label="Class / cohort" value={className} onChange={(e) => setClassName(e.target.value)} />
        <TextField
          id="graduationYear"
          label="Year of graduation"
          type="number"
          min={1900}
          value={graduationYear}
          onChange={(e) => setGraduationYear(e.target.value)}
        />
      </div>
      <TextField id="skills" label="Skills (comma-separated)" value={skills} onChange={(e) => setSkills(e.target.value)} />
      <Textarea
        id="portfolioLinks"
        label="Other links — LinkedIn, personal site, etc. (one per line)"
        rows={2}
        value={portfolioLinks}
        onChange={(e) => setPortfolioLinks(e.target.value)}
      />
      {error && <p className="profile__error">{error}</p>}
      {success && <p className="profile__success">Saved.</p>}
      <div>
        <Button variant="filled" disabled={submitting} onClick={submit}>
          {submitting ? 'Saving…' : 'Save profile'}
        </Button>
      </div>
    </div>
  )
}
