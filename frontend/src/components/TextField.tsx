import type { InputHTMLAttributes } from 'react'
import './TextField.css'

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export function TextField({ label, id, className = '', ...rest }: TextFieldProps) {
  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <input id={id} className={`ds-field__input ${className}`} {...rest} />
    </div>
  )
}
