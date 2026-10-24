import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Button, Card, List, ListRow, TextField, Textarea } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { currency, relativeTime } from '../lib/format'
import type { Application, Project, Submission } from '../lib/types'
import './ProjectDetail.css'

const STATUS_LABEL: Record<Project['status'], string> = {
  pending_review: 'Pending review',
  open: 'Open',
  in_progress: 'In progress',
  submitted: 'Submitted',
  completed: 'Completed',
  disputed: 'Disputed',
  rejected: 'Rejected',
}

export function ProjectDetail() {
  const { id } = useParams<{ id: string }>()
  const { user, token } = useAuth()
  const [project, setProject] = useState<Project | null>(null)
  const [applications, setApplications] = useState<Application[] | null>(null)
  const [submissions, setSubmissions] = useState<Submission[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const isOwner = !!user && !!project && user.id === project.clientId
  const isAssignedStudent = !!user && !!project && user.id === project.assignedStudentId

  function loadProject() {
    if (!id) return
    api<Project>(`/projects/${id}`)
      .then(setProject)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(loadProject, [id])

  useEffect(() => {
    if (!id || !project || !token) return
    if (isOwner || user?.role === 'admin') {
      api<Application[]>(`/projects/${id}/applications`, { token }).then(setApplications).catch(() => {})
    }
    if (isOwner || isAssignedStudent || user?.role === 'admin') {
      api<Submission[]>(`/projects/${id}/submissions`, { token }).then(setSubmissions).catch(() => {})
    }
  }, [id, project, token, isOwner, isAssignedStudent, user?.role])

  if (error) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-red-strong)' }}>Couldn't load this project: {error}</p>
      </Card>
    )
  }

  if (!project) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--label-secondary)' }}>Loading…</p>
      </Card>
    )
  }

  const myApplication = applications?.find((a) => a.studentId === user?.id) ?? null

  async function moderateApplication(applicationId: string) {
    setBusy(true)
    try {
      await api(`/applications/${applicationId}/accept`, { method: 'PATCH', token })
      loadProject()
      if (id) api<Application[]>(`/projects/${id}/applications`, { token }).then(setApplications)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function moderateSubmission(submissionId: string, action: 'approve' | 'request-changes') {
    setBusy(true)
    try {
      await api(`/submissions/${submissionId}/${action}`, { method: 'PATCH', token })
      loadProject()
      if (id) api<Submission[]>(`/projects/${id}/submissions`, { token }).then(setSubmissions)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="project-detail">
      <div className="project-detail__main">
        <Card>
          <div className="project-detail__header">
            <span className={`project-detail__status project-detail__status--${project.status}`}>
              {STATUS_LABEL[project.status]}
            </span>
            <span className="project-detail__meta">Posted {relativeTime(project.createdAt)}</span>
          </div>
          <h1 className="project-detail__title">{project.title}</h1>
          <p className="project-detail__budget">
            {currency.format(Number(project.budgetAmount))} · {project.budgetType === 'fixed_tier' ? 'Fixed price' : 'Custom quote'}
          </p>
          {project.client && <p className="project-detail__client">Posted by {project.client.name}</p>}
          <p className="project-detail__description">{project.description}</p>
          {project.technicalSpec && (
            <>
              <h3 className="project-detail__subhead">Technical spec</h3>
              <p className="project-detail__description">{project.technicalSpec}</p>
            </>
          )}
          {project.deadline && (
            <p className="project-detail__meta">Deadline: {new Date(project.deadline).toLocaleDateString()}</p>
          )}
          {project.assignedStudent && (
            <p className="project-detail__meta">Assigned to {project.assignedStudent.name}</p>
          )}
        </Card>

        {isOwner && project.status === 'open' && (
          <Card>
            <h2 className="project-detail__section-title">Applicants</h2>
            {applications === null ? (
              <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
            ) : applications.length === 0 ? (
              <p style={{ color: 'var(--label-secondary)' }}>No applications yet.</p>
            ) : (
              <List>
                {applications.map((app) => (
                  <ListRow
                    key={app.id}
                    title={app.student?.name ?? 'Student'}
                    subtitle={`${app.message}${app.proposedPrice ? ` · ${currency.format(Number(app.proposedPrice))} proposed` : ''}`}
                    trailing={
                      app.status === 'pending' ? (
                        <Button variant="filled" size="small" disabled={busy} onClick={() => moderateApplication(app.id)}>
                          Accept
                        </Button>
                      ) : (
                        <span className="project-detail__meta">{app.status}</span>
                      )
                    }
                  />
                ))}
              </List>
            )}
          </Card>
        )}

        {(isOwner || user?.role === 'admin') && submissions && submissions.length > 0 && (
          <Card>
            <h2 className="project-detail__section-title">Submissions</h2>
            <List>
              {submissions.map((sub) => (
                <ListRow
                  key={sub.id}
                  title={`Submitted ${relativeTime(sub.submittedAt)}`}
                  subtitle={sub.notes ?? sub.files.join(', ')}
                  trailing={
                    isOwner && sub.status === 'pending_review' ? (
                      <div className="project-detail__row-actions">
                        <Button variant="filled" size="small" disabled={busy} onClick={() => moderateSubmission(sub.id, 'approve')}>
                          Approve
                        </Button>
                        <Button variant="tinted" size="small" disabled={busy} onClick={() => moderateSubmission(sub.id, 'request-changes')}>
                          Request changes
                        </Button>
                      </div>
                    ) : (
                      <span className="project-detail__meta">{sub.status}</span>
                    )
                  }
                />
              ))}
            </List>
          </Card>
        )}
      </div>

      <div className="project-detail__side">
        {!user && (
          <Card>
            <p className="project-detail__meta" style={{ marginBottom: 12 }}>
              Log in as a student to apply for this project.
            </p>
            <Link to="/login">
              <Button variant="filled" style={{ width: '100%' }}>
                Log in
              </Button>
            </Link>
          </Card>
        )}

        {user?.role === 'student' && project.status === 'open' && !myApplication && (
          <ApplyCard projectId={project.id} onApplied={loadProject} />
        )}

        {user?.role === 'student' && myApplication && (
          <Card>
            <h2 className="project-detail__section-title">Your application</h2>
            <p className="project-detail__meta">Status: {myApplication.status}</p>
          </Card>
        )}

        {isAssignedStudent && project.status === 'in_progress' && (
          <SubmitCard projectId={project.id} onSubmitted={loadProject} />
        )}

        {isAssignedStudent && project.status === 'submitted' && (
          <Card>
            <p className="project-detail__meta">Work submitted — waiting on client review.</p>
          </Card>
        )}
      </div>
    </div>
  )
}

function ApplyCard({ projectId, onApplied }: { projectId: string; onApplied: () => void }) {
  const { token } = useAuth()
  const [message, setMessage] = useState('')
  const [proposedPrice, setProposedPrice] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [sent, setSent] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await api(`/projects/${projectId}/applications`, {
        method: 'POST',
        token,
        body: { message, proposedPrice: proposedPrice ? Number(proposedPrice) : undefined },
      })
      setSent(true)
      onApplied()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (sent) {
    return (
      <Card>
        <p className="project-detail__meta">Application sent.</p>
      </Card>
    )
  }

  return (
    <Card>
      <h2 className="project-detail__section-title">Apply for this project</h2>
      <Textarea id="apply-message" label="Message" required value={message} onChange={(e) => setMessage(e.target.value)} />
      <TextField
        id="apply-price"
        label="Proposed price (optional)"
        type="number"
        min={0}
        step="0.01"
        value={proposedPrice}
        onChange={(e) => setProposedPrice(e.target.value)}
      />
      {error && <p className="project-detail__error">{error}</p>}
      <Button variant="filled" style={{ width: '100%', marginTop: 8 }} disabled={submitting || !message} onClick={submit}>
        {submitting ? 'Sending…' : 'Submit application'}
      </Button>
    </Card>
  )
}

function SubmitCard({ projectId, onSubmitted }: { projectId: string; onSubmitted: () => void }) {
  const { token } = useAuth()
  const [files, setFiles] = useState('')
  const [notes, setNotes] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function submit() {
    setSubmitting(true)
    setError(null)
    try {
      await api(`/projects/${projectId}/submissions`, {
        method: 'POST',
        token,
        body: { files: files.split(',').map((f) => f.trim()).filter(Boolean), notes: notes || undefined },
      })
      onSubmitted()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Card>
      <h2 className="project-detail__section-title">Submit your work</h2>
      <TextField
        id="submit-files"
        label="File links (comma-separated)"
        required
        value={files}
        onChange={(e) => setFiles(e.target.value)}
      />
      <Textarea id="submit-notes" label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} />
      {error && <p className="project-detail__error">{error}</p>}
      <Button variant="filled" style={{ width: '100%', marginTop: 8 }} disabled={submitting || !files} onClick={submit}>
        {submitting ? 'Submitting…' : 'Submit work'}
      </Button>
    </Card>
  )
}
