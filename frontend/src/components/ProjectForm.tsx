import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { Switch } from './Switch'
import { TextField } from './TextField'
import { Textarea } from './Textarea'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { Project, Student } from '../lib/types'
import './ProjectForm.css'

interface ProjectFormProps {
  students: Student[]
  project?: Project
  onSuccess?: (project: Project) => void
  onCancel?: () => void
}

export function ProjectForm({ students, project, onSuccess, onCancel }: ProjectFormProps) {
  const { token } = useAuth()
  const isEdit = !!project
  const [studentId, setStudentId] = useState(project?.studentId ?? students[0]?.id ?? '')
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? '')
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '')
  const [deployed, setDeployed] = useState(project?.deployed ?? false)
  const [usersCount, setUsersCount] = useState(String(project?.usersCount ?? 0))
  const [revenueAmount, setRevenueAmount] = useState(String(project?.revenueAmount ?? 0))
  const [uiUxRating, setUiUxRating] = useState(String(project?.uiUxRating ?? 0))
  const [functionalityRating, setFunctionalityRating] = useState(String(project?.functionalityRating ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body = {
        studentId,
        title,
        description,
        repoUrl: repoUrl || undefined,
        liveUrl: liveUrl || undefined,
        deployed,
        usersCount: Number(usersCount),
        revenueAmount: Number(revenueAmount),
        uiUxRating: Number(uiUxRating),
        functionalityRating: Number(functionalityRating),
      }
      const result = isEdit
        ? await api<Project>(`/projects/${project!.id}`, { method: 'PATCH', token, body })
        : await api<Project>('/projects', { method: 'POST', token, body })
      onSuccess?.(result)
      if (!isEdit) {
        setTitle('')
        setDescription('')
        setRepoUrl('')
        setLiveUrl('')
        setDeployed(false)
        setUsersCount('0')
        setRevenueAmount('0')
        setUiUxRating('0')
        setFunctionalityRating('0')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <div className="project-form__field">
        <label className="project-form__label" htmlFor="studentId">
          Student
        </label>
        <select id="studentId" className="project-form__select" value={studentId} onChange={(e) => setStudentId(e.target.value)} required>
          {students.length === 0 && <option value="">No students yet — add one first</option>}
          {students.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <TextField id="title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea id="description" label="Description" required value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="project-form__row">
        <TextField id="repoUrl" label="Repo URL (optional)" type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        <TextField id="liveUrl" label="Live URL (optional)" type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      </div>
      <div className="project-form__field project-form__field--inline">
        <label className="project-form__label" htmlFor="deployed">
          Deployed
        </label>
        <Switch checked={deployed} onChange={setDeployed} label="Deployed" />
      </div>
      <div className="project-form__row">
        <TextField
          id="usersCount"
          label="Users count"
          type="number"
          min={0}
          value={usersCount}
          onChange={(e) => setUsersCount(e.target.value)}
        />
        <TextField
          id="revenueAmount"
          label="Revenue (USD)"
          type="number"
          min={0}
          step="0.01"
          value={revenueAmount}
          onChange={(e) => setRevenueAmount(e.target.value)}
        />
      </div>
      <div className="project-form__row">
        <TextField
          id="uiUxRating"
          label="UI/UX rating (0-5)"
          type="number"
          min={0}
          max={5}
          step="0.1"
          value={uiUxRating}
          onChange={(e) => setUiUxRating(e.target.value)}
        />
        <TextField
          id="functionalityRating"
          label="Functionality rating (0-5)"
          type="number"
          min={0}
          max={5}
          step="0.1"
          value={functionalityRating}
          onChange={(e) => setFunctionalityRating(e.target.value)}
        />
      </div>
      {error && <p className="project-form__error">{error}</p>}
      <div className="project-form__actions">
        <Button type="submit" variant="filled" disabled={submitting || !studentId}>
          {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Create project'}
        </Button>
        {onCancel && (
          <Button type="button" variant="plain" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  )
}
