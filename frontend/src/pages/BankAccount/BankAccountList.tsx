import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { banksApi } from '../../api/banksApi'
import { PAGE_SIZE } from '../../constants'
import type { BankAccount } from '../../types/api'
import { Spinner, EmptyState, ErrorMessage, Pagination } from '../../components/ui'
import { BankItem } from './BankItem'
import styles from './BankAccountPage.module.css'

interface BankAccountListProps {
  onEdit: (bank: BankAccount) => void
}

export function BankAccountList({ onEdit }: BankAccountListProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [page, setPage] = useState(1)
  const queryClient = useQueryClient()

  const { data, isLoading, isError } = useQuery({
    queryKey: ['banks', page],
    queryFn: () => banksApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  })

  async function handleDelete(id: string) {
    await banksApi.delete(id)
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
  }

  async function handleVerify(id: string) {
    await banksApi.verify(id)
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
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
    return <EmptyState message={fmt('bankAccount.empty')} />
  }

  return (
    <div>
      <ul className={styles.list}>
        {data.items.map((bank) => (
          <li key={bank.id}>
            <BankItem
              bank={bank}
              onEdit={onEdit}
              onDelete={handleDelete}
              onVerify={handleVerify}
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
