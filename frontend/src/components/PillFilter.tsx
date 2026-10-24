import './PillFilter.css'

interface PillFilterProps<T extends string> {
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}

export function PillFilter<T extends string>({ options, value, onChange }: PillFilterProps<T>) {
  return (
    <div className="pill-filter">
      {options.map((option) => (
        <button
          key={option.value}
          className={`pill-filter__item ${option.value === value ? 'pill-filter__item--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
