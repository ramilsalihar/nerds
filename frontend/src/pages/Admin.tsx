import { useEffect, useState } from 'react'
import { Button, Card, List, ListRow, ProjectForm, SegmentedControl, TextField } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { relativeTime } from '../lib/format'
import type { Project, Student } from '../lib/types'
import './Admin.css'

type Tab = 'students' | 'projects'

export function Admin() {
  const { token } = useAuth()
  const [tab, setTab] = useState<Tab>('students')
  const [students, setStudents] = useState<Student[] | null>(null)
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [editingProject, setEditingProject] = useState<Project | null>(null)

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

  return (
    <div className="admin">
      <h1 className="admin__title">Admin</h1>
      <SegmentedControl
        options={[
          { label: 'Students', value: 'students' },
          { label: 'Projects', value: 'projects' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {error && <p className="admin__error">{error}</p>}

      {tab === 'students' && (
        <>
          <Card>
            <h2 className="admin__section-title">Add a student</h2>
            <CreateStudentForm onCreated={loadStudents} />
          </Card>
          <Card>
            <h2 className="admin__section-title">All students</h2>
            {students === null ? (
              <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
            ) : students.length === 0 ? (
              <p style={{ color: 'var(--label-secondary)' }}>No students yet.</p>
            ) : (
              <List>
                {students.map((s) => (
                  <ListRow
                    key={s.id}
                    title={s.name}
                    subtitle={`${s.email}${s.studentProfile?.skills.length ? ` · ${s.studentProfile.skills.join(', ')}` : ''}`}
                  />
                ))}
              </List>
            )}
          </Card>
        </>
      )}

      {tab === 'projects' && (
        <>
          <Card>
            <h2 className="admin__section-title">{editingProject ? `Edit "${editingProject.title}"` : 'Add a project'}</h2>
            <ProjectForm
              students={students ?? []}
              project={editingProject ?? undefined}
              onSuccess={() => {
                setEditingProject(null)
                loadProjects()
              }}
              onCancel={editingProject ? () => setEditingProject(null) : undefined}
            />
          </Card>
          <Card>
            <h2 className="admin__section-title">All projects</h2>
            {projects === null ? (
              <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
            ) : projects.length === 0 ? (
              <p style={{ color: 'var(--label-secondary)' }}>No projects yet.</p>
            ) : (
              <List>
                {projects.map((p) => (
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
            )}
          </Card>
        </>
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
    <div className="admin__form">
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
      {error && <p className="admin__error">{error}</p>}
      <Button variant="filled" disabled={submitting || !name || !email || password.length < 8} onClick={submit}>
        {submitting ? 'Adding…' : 'Add student'}
      </Button>
    </div>
  )
}
