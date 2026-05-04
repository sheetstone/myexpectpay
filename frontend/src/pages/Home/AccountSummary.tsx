import { useQuery } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { dashboardApi } from '../../api/dashboardApi'
import { Spinner, ErrorMessage } from '../../components/ui'
import styles from './AccountSummary.module.css'

export function AccountSummary() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard.summary'],
    queryFn: dashboardApi.summary,
  })

  if (isLoading) return <div className={styles.loading}><Spinner /></div>
  if (isError || !data) return <ErrorMessage message={fmt('common.error')} />

  const money = (n: number) =>
    intl.formatNumber(n, { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  return (
    <div className={styles.root}>
      <div className={styles.balanceRow}>
        <span className={styles.dollarSign}>$</span>
        <span className={styles.balance}>{money(data.balance)}</span>
      </div>

      <div className={styles.divider} />

      <div className={styles.statsGrid}>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{fmt('dashboard.totalSent')}</span>
          <span className={styles.statValueNeg}>${money(data.totalSent)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{fmt('dashboard.totalReceived')}</span>
          <span className={styles.statValuePos}>${money(data.totalReceived)}</span>
        </div>
        <div className={styles.stat}>
          <span className={styles.statLabel}>{fmt('dashboard.pendingCount')}</span>
          <span className={styles.statValuePending}>{data.pendingCount}</span>
        </div>
      </div>
    </div>
  )
}
