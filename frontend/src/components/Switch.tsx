import './Switch.css'

interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
  label?: string
}

export function Switch({ checked, onChange, disabled, label }: SwitchProps) {
  return (
    <button
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      className={`ds-switch ${checked ? 'ds-switch--on' : ''}`}
      onClick={() => onChange(!checked)}
    >
      <span className="ds-switch__thumb" />
    </button>
  )
}
