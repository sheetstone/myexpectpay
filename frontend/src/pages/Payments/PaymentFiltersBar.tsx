import { useSearchParams } from 'react-router-dom'
import { useIntl } from 'react-intl'
import { DateRangePicker, MultiSelect } from '../../components/ui'
import type { PaymentStatus } from '../../types/api'
import { ALL_STATUSES } from './PaymentsPage'
import styles from './PaymentsPage.module.css'

export function PaymentFiltersBar() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [params, setParams] = useSearchParams()

  const startDate = params.get('startDate') ?? ''
  const endDate = params.get('endDate') ?? ''
  const activeStatuses = params.getAll('status') as PaymentStatus[]

  function update(key: string, value: string | string[]) {
    setParams(prev => {
      if (Array.isArray(value)) {
        prev.delete(key)
        value.forEach(v => prev.append(key, v))
      } else if (value) {
        prev.set(key, value)
      } else {
        prev.delete(key)
      }
      prev.set('page', '1')
      return prev
    })
  }

  function clearAll() {
    setParams(new URLSearchParams())
  }

  const hasFilters = startDate || endDate || activeStatuses.length > 0
  const statusOptions = ALL_STATUSES.map(s => ({ value: s, label: fmt(`payments.status.${s}`) }))

  return (
    <div className={styles.filtersBar}>
      <DateRangePicker
        startDate={startDate}
        endDate={endDate}
        onStartChange={v => update('startDate', v)}
        onEndChange={v => update('endDate', v)}
      />
      <MultiSelect
        options={statusOptions}
        value={activeStatuses}
        onChange={v => update('status', v)}
        placeholder={fmt('payments.filterByStatus')}
      />
      {hasFilters && (
        <button className={styles.clearBtn} onClick={clearAll}>
          {fmt('payments.clearFilters')}
        </button>
      )}
    </div>
  )
}
