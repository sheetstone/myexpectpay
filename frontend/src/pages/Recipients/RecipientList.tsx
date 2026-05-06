import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { recipientsApi } from '../../api/recipientsApi'
import { PAGE_SIZE } from '../../constants'
import type { Recipient } from '../../types/api'
import { Spinner, EmptyState, ErrorMessage, Pagination, useToast } from '../../components/ui'
import { useFmt } from '../../hooks'
import { RecipientCard } from './RecipientCard'
import styles from './RecipientList.module.css'

interface RecipientListProps {
  onEdit: (r: Recipient) => void
}

export function RecipientList({ onEdit }: RecipientListProps) {
  const fmt = useFmt()
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()
  const { toast } = useToast()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['recipients', page],
    queryFn: () => recipientsApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  })

  async function handleDelete(id: string) {
    try {
      await recipientsApi.delete(id)
      await queryClient.invalidateQueries({ queryKey: ['recipients'] })
      toast(fmt('common.deleteSuccess'), 'success')
    } catch {
      toast(fmt('common.error'), 'error')
    }
  }

  if (isLoading) return <div className={styles.centred}><Spinner /></div>
  if (isError) return <ErrorMessage />
  if (!data || data.items.length === 0) return <EmptyState message={fmt('recipients.empty')} />

  return (
    <div>
      <ul className={styles.list}>
        {data.items.map((r) => (
          <li key={r.id}>
            <RecipientCard
              recipient={r}
              caseNumber={null}
              onEdit={onEdit}
              onDelete={handleDelete}
            />
          </li>
        ))}
      </ul>
      <Pagination
        page={data.page}
        totalPages={data.totalPages}
        onPageChange={setPage}
      />
    </div>
  )
}
