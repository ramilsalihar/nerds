import type { CSSProperties, ReactNode } from 'react'
import './Skeleton.css'

interface SkeletonProps {
  width?: CSSProperties['width']
  height?: CSSProperties['height']
  radius?: CSSProperties['borderRadius']
  circle?: boolean
  className?: string
  style?: CSSProperties
}

/** A single shimmering placeholder block. Decorative: wrap groups in <SkeletonGroup> for the a11y label. */
export function Skeleton({ width = '100%', height = 14, radius, circle = false, className = '', style }: SkeletonProps) {
  return (
    <span
      aria-hidden="true"
      className={`ds-skeleton ${className}`}
      style={{
        width,
        height: circle ? width : height,
        borderRadius: circle ? '50%' : radius,
        ...style,
      }}
    />
  )
}

/** Stacked text lines; the last one is shorter so it reads like a paragraph. */
export function SkeletonText({ lines = 3, lineHeight = 12, gap = 8 }: { lines?: number; lineHeight?: number; gap?: number }) {
  return (
    <span className="ds-skeleton-text" style={{ gap }} aria-hidden="true">
      {Array.from({ length: lines }, (_, i) => (
        <Skeleton key={i} height={lineHeight} width={i === lines - 1 && lines > 1 ? '62%' : '100%'} />
      ))}
    </span>
  )
}

/** Announces "Loading…" once to screen readers while its skeleton children render. */
export function SkeletonGroup({ label = 'Loading…', className = '', children }: { label?: string; className?: string; children: ReactNode }) {
  return (
    <div className={className} role="status" aria-busy="true" aria-live="polite">
      <span className="ds-skeleton-sr">{label}</span>
      {children}
    </div>
  )
}
