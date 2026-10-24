import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Button, Card, List, ListRow, PillFilter, ProjectCard } from '../components'
import { api } from '../lib/api'
import { currency, relativeTime } from '../lib/format'
import type { LedgerEntry, Project } from '../lib/types'
import './Dashboard.css'

type BudgetFilter = 'all' | 'fixed_tier' | 'custom'

const BUDGET_PILLS: { label: string; value: BudgetFilter }[] = [
  { label: 'All', value: 'all' },
  { label: 'Fixed price', value: 'fixed_tier' },
  { label: 'Custom quote', value: 'custom' },
]

export function Dashboard({ search = '' }: { search?: string }) {
  const navigate = useNavigate()
  const [projects, setProjects] = useState<Project[] | null>(null)
  const [ledger, setLedger] = useState<LedgerEntry[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [budgetFilter, setBudgetFilter] = useState<BudgetFilter>('all')

  useEffect(() => {
    Promise.all([api<Project[]>('/projects'), api<LedgerEntry[]>('/donation-pool/ledger')])
      .then(([projectsRes, ledgerRes]) => {
        setProjects([...projectsRes].sort((a, b) => b.createdAt.localeCompare(a.createdAt)))
        setLedger(ledgerRes)
      })
      .catch((err: Error) => setError(err.message))
  }, [])

  const featured = projects?.[0] ?? null

  const totals = useMemo(() => {
    if (!ledger) return null
    const raised = ledger.reduce((sum, e) => sum + (e.type === 'inflow' ? Number(e.amount) : -Number(e.amount)), 0)
    return { raised, count: ledger.length }
  }, [ledger])

  const gridProjects = useMemo(() => {
    if (!projects) return []
    const query = search.trim().toLowerCase()
    return projects
      .filter((p) => budgetFilter === 'all' || p.budgetType === budgetFilter)
      .filter((p) => !query || p.title.toLowerCase().includes(query) || p.description.toLowerCase().includes(query))
  }, [projects, featured, budgetFilter, search])

  if (error) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--color-red-strong)' }}>Couldn't load the dashboard: {error}</p>
      </Card>
    )
  }

  if (!projects || !ledger) {
    return (
      <Card>
        <p style={{ margin: 0, color: 'var(--label-secondary)' }}>Loading…</p>
      </Card>
    )
  }

  return (
    <div className="dashboard">
      <div className="dashboard__main">
        {featured && (
          <div className="hero">
            <span className="hero__eyebrow">Newly opened</span>
            <h1 className="hero__title">{featured.title}</h1>
            <p className="hero__budget">{currency.format(Number(featured.budgetAmount))} budget</p>
            <Button
              variant="filled"
              className="hero__cta"
              onClick={() => document.getElementById('projects-grid')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View open projects
            </Button>
          </div>
        )}

        <div className="dashboard__section-header">
          <h2 className="dashboard__section-title">Open Projects</h2>
          <PillFilter options={BUDGET_PILLS} value={budgetFilter} onChange={setBudgetFilter} />
        </div>

        <div id="projects-grid" className="dashboard__grid">
          {gridProjects.length === 0 && (
            <Card>
              <p style={{ margin: 0, color: 'var(--label-secondary)' }}>No projects match right now.</p>
            </Card>
          )}
          {gridProjects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </div>

      <div className="dashboard__side">
        <Card>
          <div className="dashboard__section-header">
            <h2 className="dashboard__section-title">What's New</h2>
            <Link to="/donate" className="dashboard__see-all">
              See All
            </Link>
          </div>
          <List>
            {ledger.slice(0, 3).map((entry) => (
              <ListRow
                key={entry.id}
                title={entry.description}
                subtitle={`${relativeTime(entry.createdAt)}${entry.donorName ? ` · ${entry.donorName}` : ''}`}
                trailing={
                  <span className={`dashboard__amount dashboard__amount--${entry.type}`}>
                    {entry.type === 'inflow' ? '+' : '−'}
                    {currency.format(Number(entry.amount))}
                  </span>
                }
              />
            ))}
          </List>
        </Card>

        <Card className="dashboard__promo">
          <span className="dashboard__promo-tag">Donation Pool</span>
          <h2 className="dashboard__promo-title">Support Student Projects</h2>
          <p className="dashboard__promo-copy">
            A share of every project's budget — plus every direct donation — funds free tooling, hosting, and
            hackathons for students.
          </p>
          <div className="dashboard__promo-stats">
            {totals && (
              <>
                <div className="dashboard__promo-stat">
                  <strong>{currency.format(totals.raised)}</strong>
                  <span>Raised</span>
                </div>
                <div className="dashboard__promo-stat">
                  <strong>{totals.count}</strong>
                  <span>Donations</span>
                </div>
                <div className="dashboard__promo-stat">
                  <strong>{projects.length}</strong>
                  <span>Open projects</span>
                </div>
              </>
            )}
          </div>
          <Button variant="filled" style={{ width: '100%' }} onClick={() => navigate('/donate')}>
            Donate now
          </Button>
        </Card>
      </div>
    </div>
  )
}
