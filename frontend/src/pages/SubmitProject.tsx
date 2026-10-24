import { Card, ProjectForm } from '../components'

export function SubmitProject() {
  return (
    <div style={{ maxWidth: 560, margin: '0 auto' }}>
      <Card>
        <h1 style={{ fontFamily: 'var(--font-sans)', fontSize: 22, fontWeight: 650, color: 'var(--label-primary)', margin: '0 0 4px' }}>
          Submit a project
        </h1>
        <p style={{ fontFamily: 'var(--font-sans)', fontSize: 14, color: 'var(--label-secondary)', margin: '0 0 20px' }}>
          An admin reviews every submission before it appears on the dashboard.
        </p>
        <ProjectForm />
      </Card>
    </div>
  )
}
