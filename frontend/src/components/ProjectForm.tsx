import { useState, type FormEvent } from 'react'
import { Button } from './Button'
import { SegmentedControl } from './SegmentedControl'
import { TextField } from './TextField'
import { Textarea } from './Textarea'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import type { BudgetType, Project } from '../lib/types'
import './ProjectForm.css'

export function ProjectForm({ onSuccess }: { onSuccess?: (project: Project) => void }) {
  const { token } = useAuth()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [technicalSpec, setTechnicalSpec] = useState('')
  const [budgetType, setBudgetType] = useState<BudgetType>('fixed_tier')
  const [budgetAmount, setBudgetAmount] = useState('')
  const [deadline, setDeadline] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<Project | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const project = await api<Project>('/projects', {
        method: 'POST',
        token,
        body: {
          title,
          description,
          technicalSpec: technicalSpec || undefined,
          budgetType,
          budgetAmount: Number(budgetAmount),
          deadline: deadline || undefined,
        },
      })
      setResult(project)
      setTitle('')
      setDescription('')
      setTechnicalSpec('')
      setBudgetAmount('')
      setDeadline('')
      onSuccess?.(project)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (result) {
    return (
      <div className="project-form__success">
        <p className="project-form__success-title">"{result.title}" {result.status === 'open' ? 'is live now.' : 'submitted — pending admin review.'}</p>
        <Button variant="tinted" onClick={() => setResult(null)}>
          Submit another
        </Button>
      </div>
    )
  }

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <TextField id="title" label="Title" required value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        id="description"
        label="Description"
        required
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <Textarea
        id="technicalSpec"
        label="Technical spec (optional)"
        value={technicalSpec}
        onChange={(e) => setTechnicalSpec(e.target.value)}
      />
      <div className="project-form__field">
        <label className="project-form__label">Budget type</label>
        <SegmentedControl
          options={[
            { label: 'Fixed price', value: 'fixed_tier' },
            { label: 'Custom quote', value: 'custom' },
          ]}
          value={budgetType}
          onChange={setBudgetType}
        />
      </div>
      <div className="project-form__row">
        <TextField
          id="budgetAmount"
          label="Budget amount (USD)"
          type="number"
          min={0}
          step="0.01"
          required
          value={budgetAmount}
          onChange={(e) => setBudgetAmount(e.target.value)}
        />
        <TextField
          id="deadline"
          label="Deadline (optional)"
          type="date"
          value={deadline}
          onChange={(e) => setDeadline(e.target.value)}
        />
      </div>
      {error && <p className="project-form__error">{error}</p>}
      <Button type="submit" variant="filled" disabled={submitting}>
        {submitting ? 'Submitting…' : 'Submit project'}
      </Button>
    </form>
  )
}
