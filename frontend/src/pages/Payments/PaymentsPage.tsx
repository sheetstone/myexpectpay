import { useIntl } from 'react-intl'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { paymentsApi } from '../../api/paymentsApi'
import { Spinner, EmptyState, ErrorMessage, Pagination } from '../../components/ui'
import { PaymentFiltersBar } from './PaymentFiltersBar'
import { PaymentRow } from './PaymentRow'
import type { PaymentStatus } from '../../types/api'
import { PAGE_SIZE } from '../../constants'
import styles from './PaymentsPage.module.css'

const ALL_STATUSES: PaymentStatus[] = [
  'accepted', 'cancelled', 'completed', 'expired', 'in_progress',
  'rejected', 'returned', 'reversal_in_progress', 'reversal_completed', 'reversal_rejected',
]

export { ALL_STATUSES }

export function PaymentsPage() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [params, setParams] = useSearchParams()

  const page = Number(params.get('page') ?? '1')
  const startDate = params.get('startDate') ?? undefined
  const endDate = params.get('endDate') ?? undefined
  const rawStatus = params.getAll('status') as PaymentStatus[]
  const status = rawStatus.length > 0 ? rawStatus : undefined

  const { data, isLoading, isError } = useQuery({
    queryKey: ['payments', page, startDate, endDate, status],
    queryFn: () => paymentsApi.list({ page, limit: PAGE_SIZE, startDate, endDate, status }),
  })

  function setPage(p: number) {
    setParams(prev => { prev.set('page', String(p)); return prev })
  }

  return (
    <main className={styles.root}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{fmt('payments.title')}</h1>
        <div className={styles.actionBtns}>
          <button className={styles.actionBtn} disabled title={fmt('payments.sendComingSoon')}>
            {fmt('payments.send')}
          </button>
          <button className={styles.actionBtn} disabled title={fmt('payments.requestComingSoon')}>
            {fmt('payments.request')}
          </button>
        </div>
      </div>

      <PaymentFiltersBar />

      {isLoading && <div className={styles.centred}><Spinner /></div>}
      {isError && <ErrorMessage message={fmt('common.error')} />}

      {data && (
        <>
          {data.items.length === 0 ? (
            <EmptyState message={fmt('payments.empty')} />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>{fmt('payments.paymentDate')}</th>
                    <th>{fmt('payments.recipient')}</th>
                    <th>{fmt('payments.caseNumber')}</th>
                    <th>{fmt('payments.filterByStatus')}</th>
                    <th className={styles.amountCol}>{fmt('payments.amount')}</th>
                  </tr>
                </thead>
                <tbody>
                  {data.items.map(p => <PaymentRow key={p.id} payment={p} />)}
                </tbody>
              </table>
            </div>
          )}
          <Pagination page={data.page} totalPages={data.totalPages} onPageChange={setPage} />
        </>
      )}
    </main>
  )
}
