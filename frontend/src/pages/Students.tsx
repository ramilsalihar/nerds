import { useEffect, useState } from 'react'
import { Button, Card, ProjectForm, TextField } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Project, Student } from '../lib/types'
import './Students.css'

export function Students() {
  const { token } = useAuth()
  const [students, setStudents] = useState<Student[] | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)

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

  function reload() {
    loadStudents()
    loadProjects()
  }

  useEffect(reload, [])

  return (
    <div className="students">
      <div className="students__header">
        <h1 className="students__title">Students</h1>
        <p className="students__subtitle">Add students and manage the project each one is connected to.</p>
      </div>

      <Card>
        <h2 className="students__section-title">Add a student</h2>
        <CreateStudentForm onCreated={reload} />
      </Card>

      {error && <p className="students__error">{error}</p>}

      <Card>
        <h2 className="students__section-title">All students</h2>
        {students === null || projects === null ? (
          <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
        ) : students.length === 0 ? (
          <p style={{ color: 'var(--label-secondary)' }}>No students yet — add one above.</p>
        ) : (
          <div className="students__list">
            {students.map((s) => (
              <StudentRow key={s.id} student={s} projects={projects.filter((p) => p.studentId === s.id)} onChanged={reload} />
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

function StudentRow({ student, projects, onChanged }: { student: Student; projects: Project[]; onChanged: () => void }) {
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState<Project | 'new' | null>(null)

  return (
    <div className="student-row">
      <button className="student-row__summary" onClick={() => setExpanded((v) => !v)}>
        <div className="student-row__info">
          <span className="student-row__name">{student.name}</span>
          <span className="student-row__email">{student.email}</span>
          {!!student.studentProfile?.skills.length && (
            <span className="student-row__skills">{student.studentProfile.skills.join(', ')}</span>
          )}
        </div>
        <div className="student-row__projects">
          {projects.length === 0 ? (
            <span className="student-row__no-project">No project yet</span>
          ) : (
            projects.map((p) => (
              <span key={p.id} className="student-row__project-chip">
                {p.title} · {p.score} pts
              </span>
            ))
          )}
        </div>
        <span className={`student-row__chevron ${expanded ? 'student-row__chevron--open' : ''}`}>⌄</span>
      </button>

      {expanded && (
        <div className="student-row__detail">
          {editing === null &&
            projects.map((p) => (
              <div key={p.id} className="student-row__project-row">
                <span>{p.title}</span>
                <Button variant="tinted" size="small" onClick={() => setEditing(p)}>
                  Edit project
                </Button>
              </div>
            ))}
          {editing === null && (
            <Button variant="tinted" size="small" onClick={() => setEditing('new')}>
              + Add a project
            </Button>
          )}
          {editing !== null && (
            <ProjectForm
              students={[student]}
              project={editing === 'new' ? undefined : editing}
              onSuccess={() => {
                setEditing(null)
                onChanged()
              }}
              onCancel={() => setEditing(null)}
            />
          )}
        </div>
      )}
    </div>
  )
}

function CreateStudentForm({ onCreated }: { onCreated: () => void }) {
  const { token } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [skills, setSkills] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await api('/users/students', {
        method: 'POST',
        token,
        body: {
          name,
          email,
          password,
          skills: skills ? skills.split(',').map((s) => s.trim()).filter(Boolean) : undefined,
        },
      })
      setName('')
      setEmail('')
      setPassword('')
      setSkills('')
      onCreated()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="students__form">
      <TextField id="student-name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
      <TextField id="student-email" label="Email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <TextField
        id="student-password"
        label="Temporary password"
        type="password"
        minLength={8}
        required
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <TextField id="student-skills" label="Skills (comma-separated, optional)" value={skills} onChange={(e) => setSkills(e.target.value)} />
      {error && <p className="students__error">{error}</p>}
      <Button variant="filled" disabled={submitting || !name || !email || password.length < 8} onClick={submit}>
        {submitting ? 'Adding…' : 'Add student'}
      </Button>
    </div>
  )
}
