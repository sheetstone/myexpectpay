import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline'
import { useIntl } from 'react-intl'
import styles from './Pagination.module.css'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  const intl = useIntl()

  if (totalPages <= 1) return null

  return (
    <div className={styles.root}>
      <span className={styles.info}>
        {intl.formatMessage({ id: 'common.page' }, { current: page, total: totalPages })}
      </span>
      <div className={styles.controls}>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <ChevronLeftIcon width={16} height={16} />
        </button>
        <span className={styles.page}>{page} / {totalPages}</span>
        <button
          className={styles.btn}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <ChevronRightIcon width={16} height={16} />
        </button>
      </div>
    </div>
  )
}
