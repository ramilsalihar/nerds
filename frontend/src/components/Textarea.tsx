import type { TextareaHTMLAttributes } from 'react'
import './TextField.css'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
}

export function Textarea({ label, id, className = '', rows = 4, ...rest }: TextareaProps) {
  return (
    <div className="ds-field">
      {label && (
        <label className="ds-field__label" htmlFor={id}>
          {label}
        </label>
      )}
      <textarea id={id} rows={rows} className={`ds-field__input ds-field__input--textarea ${className}`} {...rest} />
    </div>
  )
}
