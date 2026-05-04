import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { casesApi } from '../../api/casesApi'
import { PAGE_SIZE } from '../../constants'
import type { Case } from '../../types/api'
import { Spinner, EmptyState, ErrorMessage, Pagination, ConfirmDialog, useToast } from '../../components/ui'
import styles from './CasesList.module.css'

interface CasesListProps {
  onEdit: (c: Case) => void
}

export function CasesList({ onEdit }: CasesListProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [page, setPage] = useState(1)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cases', page],
    queryFn: () => casesApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  })

  async function handleDeleteConfirm() {
    if (!deletingId) return
    try {
      await casesApi.delete(deletingId)
      await queryClient.invalidateQueries({ queryKey: ['cases'] })
      toast(fmt('common.deleteSuccess'), 'success')
    } catch {
      toast(fmt('common.error'), 'error')
    } finally {
      setDeletingId(null)
    }
  }

  if (isLoading) {
    return (
      <div className={styles.centred}>
        <Spinner />
      </div>
    )
  }

  if (isError) {
    return <ErrorMessage />
  }

  if (!data || data.items.length === 0) {
    return <EmptyState message={fmt('cases.empty')} />
  }

  return (
    <div>
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th className={styles.th}>{fmt('cases.caseNumber')}</th>
              <th className={styles.th}>{fmt('cases.ncpName')}</th>
              <th className={styles.th}>{fmt('cases.children')}</th>
              <th className={`${styles.th} ${styles.actionsCol}`}>{''}</th>
            </tr>
          </thead>
          <tbody>
            {data.items.map((c) => (
              <tr key={c.id} className={styles.tr}>
                <td className={styles.td}>{c.caseNumber}</td>
                <td className={styles.td}>{c.ncpName}</td>
                <td className={`${styles.td} ${styles.childrenCell}`}>
                  {c.children.join(', ')}
                </td>
                <td className={`${styles.td} ${styles.actionsCell}`}>
                  <button
                    className={styles.editBtn}
                    onClick={() => onEdit(c)}
                  >
                    {fmt('cases.edit')}
                  </button>
                  <button
                    className={styles.deleteBtn}
                    onClick={() => setDeletingId(c.id)}
                  >
                    {fmt('common.delete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={deletingId !== null}
        title={fmt('cases.deleteTitle')}
        message={fmt('cases.deleteConfirm')}
        confirmLabel={fmt('common.delete')}
        onConfirm={() => void handleDeleteConfirm()}
        onCancel={() => setDeletingId(null)}
      />
    </div>
  )
}
