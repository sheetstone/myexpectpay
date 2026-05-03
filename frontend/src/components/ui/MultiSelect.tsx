interface Option {
  value: string
  label: string
}

interface MultiSelectProps {
  options: Option[]
  value: string[]
  onChange: (values: string[]) => void
  placeholder?: string
}

const selectStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-surface)',
  outline: 'none',
  minWidth: 160,
}

export function MultiSelect({ options, value, onChange, placeholder }: MultiSelectProps) {
  return (
    <select
      multiple
      value={value}
      onChange={(e) => {
        const selected = Array.from(e.target.selectedOptions).map((o) => o.value)
        onChange(selected)
      }}
      style={{ ...selectStyle, minHeight: 80 }}
      aria-label={placeholder}
    >
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
