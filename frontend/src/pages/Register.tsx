import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, SegmentedControl, TextField } from '../components'
import { useAuth, type Role } from '../lib/auth'
import './AuthForm.css'

export function Register() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<Role>('client')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await register(email, password, name, role)
      navigate('/')
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="auth-form">
      <Card>
        <h1 className="auth-form__title">Create an account</h1>
        <form className="auth-form__fields" onSubmit={handleSubmit}>
          <div className="auth-form__field">
            <label className="auth-form__label">I am a</label>
            <SegmentedControl
              options={[
                { label: 'Project owner', value: 'client' },
                { label: 'Student', value: 'student' },
              ]}
              value={role}
              onChange={setRole}
            />
          </div>
          <TextField id="name" label="Name" required value={name} onChange={(e) => setName(e.target.value)} />
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
          {error && <p className="auth-form__error">{error}</p>}
          <Button type="submit" variant="filled" disabled={submitting}>
            {submitting ? 'Creating account…' : 'Create account'}
          </Button>
        </form>
        <p className="auth-form__switch">
          Already have an account? <Link to="/login">Log in</Link>
        </p>
      </Card>
    </div>
  )
}
