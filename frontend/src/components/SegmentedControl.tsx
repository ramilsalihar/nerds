import './SegmentedControl.css'

interface SegmentedControlProps<T extends string> {
  options: { label: string; value: T }[]
  value: T
  onChange: (value: T) => void
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const index = options.findIndex((o) => o.value === value)

  return (
    <div className="ds-segmented" role="tablist">
      <div
        className="ds-segmented__thumb"
        style={{
          width: `calc(${100 / options.length}% - 4px)`,
          transform: `translateX(calc(${index * 100}% + ${index * 4}px))`,
        }}
      />
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          aria-selected={option.value === value}
          className={`ds-segmented__item ${option.value === value ? 'ds-segmented__item--active' : ''}`}
          onClick={() => onChange(option.value)}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
