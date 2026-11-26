import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { ImageUploadField } from './ImageUploadField'
import { Switch } from './Switch'
import { TextField } from './TextField'
import { Textarea } from './Textarea'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { PROJECT_TYPE_LABEL } from '../lib/types'
import type { Project, ProjectType, Student } from '../lib/types'
import './ProjectForm.css'

interface ProjectFormProps {
  students: Student[]
  project?: Project
  lockStudent?: boolean
  onSuccess?: (project: Project) => void
  onCancel?: () => void
}

export function ProjectForm({ students, project, lockStudent = false, onSuccess, onCancel }: ProjectFormProps) {
  const { token, user } = useAuth()
  const isAdmin = user?.role === 'admin'
  const isEdit = !!project
  const [studentId, setStudentId] = useState(project?.studentId ?? students[0]?.id ?? '')
  const [title, setTitle] = useState(project?.title ?? '')
  const [description, setDescription] = useState(project?.description ?? '')
  const [repoUrl, setRepoUrl] = useState(project?.repoUrl ?? '')
  const [liveUrl, setLiveUrl] = useState(project?.liveUrl ?? '')
  const [videoUrl, setVideoUrl] = useState(project?.videoUrl ?? '')
  const [imageUrls, setImageUrls] = useState<string[]>(project?.imageUrls ?? [])
  const [imagesBusy, setImagesBusy] = useState(false)
  const [type, setType] = useState<ProjectType>(project?.type ?? 'startup')
  const [deployed, setDeployed] = useState(project?.deployed ?? false)
  const [usersCount, setUsersCount] = useState(String(project?.usersCount ?? 0))
  const [revenueAmount, setRevenueAmount] = useState(String(project?.revenueAmount ?? 0))
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const body = {
        studentId: lockStudent ? undefined : studentId,
        title,
        description,
        repoUrl: repoUrl || undefined,
        liveUrl: liveUrl || undefined,
        videoUrl: videoUrl || undefined,
        imageUrls,
        type,
        usersCount: Number(usersCount),
        revenueAmount: Number(revenueAmount),
        // Deployment status is confirmed by an admin only.
        ...(isAdmin ? { deployed } : {}),
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
        setVideoUrl('')
        setImageUrls([])
        setType('startup')
        setDeployed(false)
        setUsersCount('0')
        setRevenueAmount('0')
      }
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      {!lockStudent && (
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
      )}
      <div className="project-form__field">
        <label className="project-form__label" htmlFor="projectType">
          Project type
        </label>
        <select id="projectType" className="project-form__select" value={type} onChange={(e) => setType(e.target.value as ProjectType)}>
          {(Object.keys(PROJECT_TYPE_LABEL) as ProjectType[]).map((t) => (
            <option key={t} value={t}>
              {PROJECT_TYPE_LABEL[t]}
            </option>
          ))}
        </select>
        <p className="project-form__hint">
          {type === 'startup'
            ? 'Scored on traction: users and revenue. Startup revenue counts 10× — it is much harder to earn.'
            : 'Client work: scored on what the client paid. Users count is not scored.'}
        </p>
      </div>
      <TextField id="title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea id="description" label="Description" required value={description} onChange={(e) => setDescription(e.target.value)} />
      <div className="project-form__row">
        <TextField id="repoUrl" label="GitHub repo URL (optional)" type="url" value={repoUrl} onChange={(e) => setRepoUrl(e.target.value)} />
        <TextField id="liveUrl" label="Live demo URL (optional)" type="url" value={liveUrl} onChange={(e) => setLiveUrl(e.target.value)} />
      </div>
      <TextField
        id="videoUrl"
        label="Project overview video — YouTube link (optional)"
        type="url"
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
      />
      <ImageUploadField firstImageIsPreview value={imageUrls} onChange={setImageUrls} max={8} onBusyChange={setImagesBusy} />
      {isAdmin && (
        <div className="project-form__field project-form__field--inline">
          <label className="project-form__label" htmlFor="deployed">
            Deployed
          </label>
          <Switch checked={deployed} onChange={setDeployed} label="Deployed" />
        </div>
      )}
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
      {!isAdmin && (
        <p className="project-form__hint">
          {isEdit
            ? `Set by an admin: ${project!.deployed ? 'Deployed' : 'Not deployed'}`
            : 'An admin will mark the project as deployed.'}
        </p>
      )}
      {error && <p className="project-form__error">{error}</p>}
      <div className="project-form__actions">
        <Button type="submit" variant="filled" disabled={submitting || imagesBusy || !studentId}>
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
