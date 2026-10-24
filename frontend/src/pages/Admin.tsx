import { useEffect, useState } from 'react'
import { Button, Card, List, ListRow, ProjectForm, SegmentedControl } from '../components'
import { api } from '../lib/api'
import { useAuth } from '../lib/auth'
import { currency, relativeTime } from '../lib/format'
import type { LedgerEntry, Project } from '../lib/types'
import './Admin.css'

type Tab = 'queue' | 'ledger' | 'post'

export function Admin() {
  const { token } = useAuth()
  const [tab, setTab] = useState<Tab>('queue')
  const [pending, setPending] = useState<Project[] | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busyId, setBusyId] = useState<string | null>(null)

  function loadQueue() {
    api<Project[]>('/projects/pending-review', { token })
      .then(setPending)
      .catch((err: Error) => setError(err.message))
  }

  useEffect(() => {
    loadQueue()
    api<LedgerEntry[]>('/donation-pool/ledger')
      .then(setLedger)
      .catch((err: Error) => setError(err.message))
  }, [])

  async function moderate(id: string, action: 'approve' | 'reject') {
    setBusyId(id)
    try {
      await api(`/projects/${id}/${action}`, { method: 'PATCH', token })
      setPending((prev) => prev?.filter((p) => p.id !== id) ?? null)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusyId(null)
    }
  }

  return (
    <div className="admin">
      <h1 className="admin__title">Admin</h1>
      <SegmentedControl
        options={[
          { label: 'Moderation queue', value: 'queue' },
          { label: 'Ledger', value: 'ledger' },
          { label: 'Post a project', value: 'post' },
        ]}
        value={tab}
        onChange={setTab}
      />

      {error && <p className="admin__error">{error}</p>}

      {tab === 'queue' && (
        <Card>
          {pending === null ? (
            <p style={{ color: 'var(--label-secondary)' }}>Loading…</p>
          ) : pending.length === 0 ? (
            <p style={{ color: 'var(--label-secondary)' }}>Nothing waiting on review.</p>
          ) : (
            <List>
              {pending.map((project) => (
                <ListRow
                  key={project.id}
                  title={project.title}
                  subtitle={`${currency.format(Number(project.budgetAmount))} · ${project.description}`}
                  trailing={
                    <div className="admin__actions">
                      <Button
                        variant="tinted"
                        size="small"
                        disabled={busyId === project.id}
                        onClick={() => moderate(project.id, 'approve')}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="destructive"
                        size="small"
                        disabled={busyId === project.id}
                        onClick={() => moderate(project.id, 'reject')}
                      >
                        Reject
                      </Button>
                    </div>
                  }
                />
              ))}
            </List>
          )}
        </Card>
      )}

      {tab === 'ledger' && (
        <Card>
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
                    <span className={`admin__amount admin__amount--${entry.type}`}>
                      {entry.type === 'inflow' ? '+' : '−'}
                      {currency.format(Number(entry.amount))}
                    </span>
                  }
                />
              ))}
            </List>
          )}
        </Card>
      )}

      {tab === 'post' && (
        <Card>
          <p className="admin__post-note">Projects you post go live immediately — no moderation queue for your own.</p>
          <ProjectForm />
        </Card>
      )}
    </div>
  )
}
