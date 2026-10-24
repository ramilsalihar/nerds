import type { HTMLAttributes, ReactNode } from 'react'
import './List.css'

export function List({ className = '', children, ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`ds-list ${className}`} {...rest}>
      {children}
    </div>
  )
}

interface ListRowProps extends HTMLAttributes<HTMLDivElement> {
  title: string
  subtitle?: string
  leading?: ReactNode
  trailing?: ReactNode
  interactive?: boolean
}

export function ListRow({
  title,
  subtitle,
  leading,
  trailing,
  interactive = false,
  className = '',
  ...rest
}: ListRowProps) {
  return (
    <div
      className={`ds-list-row ${interactive ? 'ds-list-row--interactive' : ''} ${className}`}
      {...rest}
    >
      {leading && <div className="ds-list-row__leading">{leading}</div>}
      <div className="ds-list-row__body">
        <span className="ds-list-row__title">{title}</span>
        {subtitle && <span className="ds-list-row__subtitle">{subtitle}</span>}
      </div>
      {trailing && <div className="ds-list-row__trailing">{trailing}</div>}
    </div>
  )
}
