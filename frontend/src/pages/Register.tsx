import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Button, Card, TextField } from '../components'
import { useAuth } from '../lib/auth'
import './AuthForm.css'

export function Register() {
  const { register } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [className, setClassName] = useState('')
  const [graduationYear, setGraduationYear] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const result = await register({
        name,
        email,
        password,
        className,
        graduationYear: Number(graduationYear),
      })
      setSubmitted(result.message)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <div className="auth-form">
        <Card>
          <h1 className="auth-form__title">Registration submitted</h1>
          <p style={{ color: 'var(--label-secondary)' }}>{submitted}</p>
          <p className="auth-form__switch">
            <Link to="/login">Back to log in</Link>
          </p>
        </Card>
      </div>
    )
  }

  return (
    <div className="auth-form">
      <Card>
        <h1 className="auth-form__title">Register as a student</h1>
        <form className="auth-form__fields" onSubmit={handleSubmit}>
          <TextField id="name" label="Full name" required value={name} onChange={(e) => setName(e.target.value)} />
          <TextField
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            id="password"
            label="Password"
            type="password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <TextField
            id="className"
            label="Class / cohort"
            required
            value={className}
            onChange={(e) => setClassName(e.target.value)}
          />
          <TextField
            id="graduationYear"
            label="Year of graduation"
            type="number"
            min={1900}
            required
            value={graduationYear}
            onChange={(e) => setGraduationYear(e.target.value)}
          />
          {error && <p className="auth-form__error">{error}</p>}
          <Button type="submit" variant="filled" disabled={submitting}>
            {submitting ? 'Submitting…' : 'Submit registration'}
          </Button>
        </form>
        <p className="auth-form__switch">
          Already approved? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
