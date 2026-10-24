import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Button, Card, List, ListRow, TextField, Textarea } from '../components'
import { api } from '../lib/api'
import { currency, relativeTime } from '../lib/format'
import type { LedgerEntry } from '../lib/types'
import './Donate.css'

export function Donate() {
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null)
  const [amount, setAmount] = useState('25')
  const [donorName, setDonorName] = useState('')
  const [donorEmail, setDonorEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [thanks, setThanks] = useState(false)

  function loadLedger() {
    api<LedgerEntry[]>('/donation-pool/ledger')
      .then(setLedger)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(loadLedger, [])

  const total = useMemo(() => {
    if (!ledger) return 0
    return ledger.reduce((sum, e) => sum + (e.type === 'inflow' ? Number(e.amount) : -Number(e.amount)), 0)
  }, [ledger])

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await api('/donation-pool/donate', {
        method: 'POST',
        body: {
          amount: Number(amount),
          donorName: donorName || undefined,
          donorEmail: donorEmail || undefined,
          message: message || undefined,
        },
      })
      setThanks(true)
      setDonorName('')
      setDonorEmail('')
      setMessage('')
      loadLedger()
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="donate">
      <Card>
        <h1 className="donate__title">Donate to the pool</h1>
        <p className="donate__copy">
          No account needed. Every dollar funds free tooling, hosting, and hackathons for students.
        </p>

        {thanks ? (
          <div className="donate__thanks">
            <p>Thank you for your donation!</p>
            <Button variant="tinted" onClick={() => setThanks(false)}>
              Donate again
            </Button>
          </div>
        ) : (
          <form className="donate__form" onSubmit={handleSubmit}>
            <TextField
              id="amount"
              label="Amount (USD)"
              type="number"
              min={1}
              step="0.01"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <div className="donate__row">
              <TextField
                id="donorName"
                label="Name (optional)"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
              />
              <TextField
                id="donorEmail"
                label="Email (optional)"
                type="email"
                value={donorEmail}
                onChange={(e) => setDonorEmail(e.target.value)}
              />
            </div>
            <Textarea
              id="message"
              label="Message (optional)"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            {error && <p className="donate__error">{error}</p>}
            <Button type="submit" variant="filled" disabled={submitting}>
              {submitting ? 'Donating…' : 'Donate'}
            </Button>
          </form>
        )}
      </Card>

      <Card>
        <div className="donate__ledger-header">
          <h2 className="donate__ledger-title">Ledger</h2>
          <span className="donate__ledger-total">{currency.format(total)} total</span>
        </div>
        {ledger === null ? (
          <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
        ) : (
          <List>
            {ledger.map((entry) => (
              <ListRow
                key={entry.id}
                title={entry.description}
                subtitle={`${relativeTime(entry.createdAt)}${entry.donorName ? ` · ${entry.donorName}` : ''}`}
                trailing={
                  <span className={`donate__amount donate__amount--${entry.type}`}>
                    {entry.type === 'inflow' ? '+' : '−'}
                    {currency.format(Number(entry.amount))}
                  </span>
                }
              />
            ))}
          </List>
        )}
      </Card>
    </div>
  )
}
