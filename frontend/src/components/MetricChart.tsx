import type { Project } from '../lib/types'
import './MetricChart.css'

export type ChartMetricKey = 'score' | 'usersCount' | 'revenueAmount' | 'likeCount' | 'uiUxRating' | 'functionalityRating'

const ACCESSORS: Record<ChartMetricKey, (p: Project) => number> = {
  score: (p) => p.score,
  usersCount: (p) => p.usersCount,
  revenueAmount: (p) => Number(p.revenueAmount),
  likeCount: (p) => p.likeCount,
  uiUxRating: (p) => p.uiUxRating,
  functionalityRating: (p) => p.functionalityRating,
}

export function metricValueOf(project: Project, metricKey: ChartMetricKey): number {
  return ACCESSORS[metricKey](project)
}

function formatValue(metricKey: ChartMetricKey, value: number): string {
  if (metricKey === 'revenueAmount') return `$${value.toLocaleString()}`
  if (metricKey === 'uiUxRating' || metricKey === 'functionalityRating') return value.toFixed(1)
  return value.toLocaleString()
}

interface MetricChartProps {
  projects: Project[]
  metricKey: ChartMetricKey
  label: string
}

export function MetricChart({ projects, metricKey, label }: MetricChartProps) {
  const rows = projects
    .map((p) => ({ id: p.id, title: p.title, value: metricValueOf(p, metricKey) }))
    .sort((a, b) => b.value - a.value)
  const max = rows.reduce((m, r) => Math.max(m, r.value), 0) || 1

  return (
    <div className="metric-chart">
      <h3 className="metric-chart__title">{label} by project</h3>
      <div className="metric-chart__rows">
        {rows.map((r) => (
          <div className="metric-chart__row" key={r.id}>
            <span className="metric-chart__name" title={r.title}>
              {r.title}
            </span>
            <div className="metric-chart__track">
              <div className="metric-chart__bar" style={{ width: `${(r.value / max) * 100}%` }} />
            </div>
            <span className="metric-chart__value">{formatValue(metricKey, r.value)}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
