import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { messagesApi } from '../../api/messagesApi'
import { Spinner, ErrorMessage, EmptyState } from '../../components/ui'
import styles from './RecentMessages.module.css'

const PREVIEW_COUNT = 5

export function RecentMessages() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })

  const { data, isLoading, isError } = useQuery({
    queryKey: ['messages'],
    queryFn: messagesApi.list,
  })

  if (isLoading) return <div className={styles.loading}><Spinner /></div>
  if (isError || !data) return <ErrorMessage message={fmt('common.error')} />

  const preview = data.items.slice(0, PREVIEW_COUNT)

  return (
    <div className={styles.root}>
      {preview.length === 0 ? (
        <EmptyState message={fmt('messages.empty')} />
      ) : (
        <ul className={styles.list}>
          {preview.map(msg => (
            <li key={msg.id} className={`${styles.item}${msg.isRead ? '' : ` ${styles.unread}`}`}>
              <div className={styles.from}>{msg.sender}</div>
              <div className={styles.subject}>{msg.subject}</div>
              <div className={styles.date}>
                {intl.formatDate(msg.createdAt, { month: 'short', day: 'numeric', year: 'numeric' })}
              </div>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.footer}>
        <Link to="/messages" className={styles.viewAll}>{fmt('dashboard.viewAllMessages')}</Link>
      </div>
    </div>
  )
}
