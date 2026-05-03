import { useIntl } from 'react-intl'

interface DateRangePickerProps {
  startDate: string
  endDate: string
  onStartChange: (v: string) => void
  onEndChange: (v: string) => void
}

const inputStyle: React.CSSProperties = {
  padding: '6px 10px',
  border: '1px solid var(--color-border)',
  borderRadius: 'var(--radius-md)',
  fontSize: 'var(--text-sm)',
  color: 'var(--color-text-primary)',
  background: 'var(--color-surface)',
  outline: 'none',
}

export function DateRangePicker({ startDate, endDate, onStartChange, onEndChange }: DateRangePickerProps) {
  const intl = useIntl()
  return (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <input
        type="date"
        value={startDate}
        onChange={(e) => onStartChange(e.target.value)}
        style={inputStyle}
        aria-label={intl.formatMessage({ id: 'payments.startDate' })}
        max={endDate || undefined}
      />
      <span style={{ color: 'var(--color-text-muted)', fontSize: 'var(--text-sm)' }}>–</span>
      <input
        type="date"
        value={endDate}
        onChange={(e) => onEndChange(e.target.value)}
        style={inputStyle}
        aria-label={intl.formatMessage({ id: 'payments.endDate' })}
        min={startDate || undefined}
      />
    </div>
  )
}
