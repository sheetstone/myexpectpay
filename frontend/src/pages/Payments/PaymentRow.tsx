import { useIntl } from 'react-intl'
import type { Payment } from '../../types/api'
import styles from './PaymentsPage.module.css'

interface Props { payment: Payment }

const STATUS_BADGE: Record<string, string> = {
  completed: 'badgeSuccess',
  accepted:  'badgeSuccess',
  in_progress: 'badgePending',
  reversal_in_progress: 'badgePending',
  cancelled:  'badgeDanger',
  rejected:   'badgeDanger',
  expired:    'badgeDanger',
  returned:   'badgeDanger',
  reversal_completed: 'badgeDanger',
  reversal_rejected:  'badgeDanger',
}

export function PaymentRow({ payment }: Props) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const amount = parseFloat(payment.amount)
  const isPositive = payment.type === 'received' || payment.type === 'pending_received'
  const isPending = payment.type === 'pending_sent' || payment.type === 'pending_received'

  const amountClass = isPending
    ? styles.amountPending
    : isPositive
    ? styles.amountPos
    : styles.amountNeg

  const badgeClass = styles[STATUS_BADGE[payment.status] ?? 'badgePending']

  return (
    <tr className={styles.row}>
      <td>{intl.formatDate(payment.paymentDate, { month: 'short', day: 'numeric', year: 'numeric' })}</td>
      <td>{payment.recipientName}</td>
      <td className={styles.monoCell}>{payment.caseNumber}</td>
      <td><span className={`${styles.badge} ${badgeClass}`}>{fmt(`payments.status.${payment.status}`)}</span></td>
      <td className={`${styles.amountCol} ${amountClass}`}>
        {isPositive ? '+' : '−'}${Math.abs(amount).toFixed(2)}
      </td>
    </tr>
  )
}
