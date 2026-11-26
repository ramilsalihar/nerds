// Page-shaped placeholders. They reuse each page's own layout classes so the real
// content lands in the same place and nothing jumps when data arrives.
import { Card } from './Card'
import { Skeleton, SkeletonGroup, SkeletonText } from './Skeleton'
import '../pages/Dashboard.css'
import '../pages/ProjectDetail.css'
import '../pages/StudentProfile.css'
import './ProjectCard.css'

const FILL = { position: 'absolute', inset: 0, borderRadius: 0 } as const

function PillRow({ widths }: { widths: number[] }) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {widths.map((w, i) => (
        <Skeleton key={i} width={w} height={34} radius="var(--radius-pill)" />
      ))}
    </div>
  )
}

export function ProjectCardSkeleton() {
  return (
    <div className="project-card" style={{ cursor: 'default' }}>
      <Skeleton height="auto" radius="var(--radius-md)" style={{ aspectRatio: '16 / 10', marginBottom: 4 }} />
      <Skeleton width="70%" height={16} />
      <Skeleton width="40%" height={11} />
      <Skeleton width="55%" height={12} style={{ marginTop: 4 }} />
    </div>
  )
}

export function DashboardSkeleton() {
  return (
    <SkeletonGroup label="Loading leaderboard…" className="dashboard ds-skeleton-screen">
      <div className="dashboard__header">
        <Skeleton width={180} height={30} />
        <Skeleton width={300} height={14} style={{ maxWidth: '100%' }} />
      </div>

      <div className="dashboard__stats">
        {[0, 1].map((i) => (
          <Card key={i} className="dashboard__stat">
            <Skeleton width={90} height={12} />
            <Skeleton width={130} height={26} />
          </Card>
        ))}
      </div>

      <PillRow widths={[52, 84, 92]} />
      <PillRow widths={[86, 96, 108, 92]} />

      <div className="podium">
        {[1, 2, 3].map((place) => (
          <div key={place} className={`podium__spot podium__spot--${place}`} style={{ boxShadow: 'none' }}>
            <Skeleton height="100%" style={FILL} />
          </div>
        ))}
      </div>

      <Skeleton width={140} height={18} />
      <div className="dashboard__grid">
        {Array.from({ length: 6 }, (_, i) => (
          <ProjectCardSkeleton key={i} />
        ))}
      </div>
    </SkeletonGroup>
  )
}

export function ProjectDetailSkeleton() {
  return (
    <SkeletonGroup label="Loading project…" className="project-detail ds-skeleton-screen">
      <div className="project-detail__main">
        <Card>
          <div className="project-detail__header">
            <Skeleton width={150} height={24} radius="var(--radius-pill)" />
            <Skeleton width={72} height={24} radius="var(--radius-pill)" />
            <Skeleton width={90} height={13} />
          </div>
          <Skeleton width="55%" height={30} style={{ margin: '4px 0 10px' }} />
          <Skeleton width={120} height={13} style={{ marginBottom: 16 }} />
          <SkeletonText lines={4} lineHeight={13} />
          <div style={{ display: 'flex', gap: 10, marginTop: 16 }}>
            <Skeleton width={84} height={20} />
            <Skeleton width={96} height={20} />
          </div>
          <div className="project-detail__images">
            {[0, 1].map((i) => (
              <Skeleton key={i} width={220} height={140} radius="var(--radius-md)" />
            ))}
          </div>
        </Card>

        <Card>
          <Skeleton width={90} height={18} style={{ marginBottom: 16 }} />
          <div className="project-detail__metrics">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="project-detail__metric">
                <Skeleton width={56} height={24} />
                <Skeleton width={70} height={11} style={{ marginTop: 6 }} />
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <Skeleton width={110} height={18} style={{ marginBottom: 16 }} />
          <ListSkeleton rows={2} avatar />
        </Card>
      </div>

      <div className="project-detail__side">
        <Card>
          <Skeleton height={44} radius="var(--radius-md)" />
          <Skeleton width={70} height={12} style={{ margin: '12px auto 0' }} />
          <Skeleton height={40} radius="var(--radius-md)" style={{ marginTop: 12 }} />
        </Card>
      </div>
    </SkeletonGroup>
  )
}

export function StudentProfileSkeleton() {
  return (
    <SkeletonGroup label="Loading profile…" className="student-profile ds-skeleton-screen">
      <Card>
        <div className="student-profile__header">
          <Skeleton width={72} circle />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 10, minWidth: 0 }}>
            <Skeleton width={200} height={24} style={{ maxWidth: '100%' }} />
            <Skeleton width={150} height={13} />
            <SkeletonText lines={2} lineHeight={13} />
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4 }}>
              {[64, 80, 56, 72].map((w, i) => (
                <Skeleton key={i} width={w} height={24} radius="var(--radius-pill)" />
              ))}
            </div>
          </div>
        </div>
      </Card>
      <Card>
        <Skeleton width={100} height={18} style={{ marginBottom: 16 }} />
        <ProjectBlocksSkeleton />
      </Card>
    </SkeletonGroup>
  )
}

/** Title + description + image strip, as on a student's public page. */
export function ProjectBlocksSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }} aria-hidden="true">
      {Array.from({ length: count }, (_, i) => (
        <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <Skeleton width="40%" height={16} />
          <SkeletonText lines={2} lineHeight={12} />
          <div style={{ display: 'flex', gap: 10 }}>
            <Skeleton width={160} height={100} radius="var(--radius-md)" />
            <Skeleton width={160} height={100} radius="var(--radius-md)" />
          </div>
        </div>
      ))}
    </div>
  )
}

/** Generic row list: optional avatar, title + subtitle, optional trailing buttons. */
export function ListSkeleton({ rows = 4, avatar = false, actions = 0, label }: { rows?: number; avatar?: boolean; actions?: number; label?: string }) {
  const body = (
    <div style={{ display: 'flex', flexDirection: 'column' }}>
      {Array.from({ length: rows }, (_, i) => (
        <div
          key={i}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 0',
            borderTop: i === 0 ? undefined : '1px solid var(--separator)',
          }}
        >
          {avatar && <Skeleton width={36} circle />}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
            <Skeleton width={`${45 + ((i * 17) % 30)}%`} height={14} />
            <Skeleton width={`${60 + ((i * 11) % 25)}%`} height={11} />
          </div>
          {Array.from({ length: actions }, (_, j) => (
            <Skeleton key={j} width={64} height={30} radius="var(--radius-pill)" />
          ))}
        </div>
      ))}
    </div>
  )
  return label ? <SkeletonGroup label={label} className="ds-skeleton-screen">{body}</SkeletonGroup> : body
}

/** Labelled-field form placeholder. */
export function FormSkeleton({ fields = 4, label = 'Loading…' }: { fields?: number; label?: string }) {
  return (
    <SkeletonGroup label={label} className="ds-skeleton-screen">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {Array.from({ length: fields }, (_, i) => (
          <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <Skeleton width={90} height={12} />
            <Skeleton height={i === 1 ? 84 : 40} radius="var(--radius-md)" />
          </div>
        ))}
        <Skeleton width={120} height={40} radius="var(--radius-pill)" />
      </div>
    </SkeletonGroup>
  )
}
