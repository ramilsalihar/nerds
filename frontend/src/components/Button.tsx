import type { ButtonHTMLAttributes } from 'react'
import './Button.css'

type Variant = 'filled' | 'tinted' | 'plain' | 'destructive'
type Size = 'regular' | 'small'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
}

export function Button({
  variant = 'filled',
  size = 'regular',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`ds-button ds-button--${variant} ds-button--${size} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
