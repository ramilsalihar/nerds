import { useState, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Card, TextField } from '../components'
import { useAuth } from '../lib/auth'
import './AuthForm.css'

export function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await login(email, password)
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
        <h1 className="auth-form__title">Log in</h1>
        <form className="auth-form__fields" onSubmit={handleSubmit}>
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
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="auth-form__error">{error}</p>}
          <Button type="submit" variant="filled" disabled={submitting}>
            {submitting ? 'Logging in…' : 'Log in'}
          </Button>
        </form>
      </Card>
    </div>
  )
}
