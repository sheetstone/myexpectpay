import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { banksApi } from '../../api/banksApi'
import { PAGE_SIZE } from '../../constants'
import type { BankAccount } from '../../types/api'
import { Spinner, EmptyState, ErrorMessage } from '../../components/ui'
import { useFmt } from '../../hooks'
import { BankSidebar } from './BankSidebar'
import { BankDetail } from './BankDetail'
import { BankAccountForm } from './BankAccountForm'
import styles from './BankAccountPage.module.css'

export function BankAccountPage() {
  const fmt = useFmt()
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editing, setEditing] = useState<BankAccount | 'new' | null>(null)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['banks', page],
    queryFn: () => banksApi.list(page, PAGE_SIZE),
    placeholderData: (prev) => prev,
  })

  const accounts = data?.items ?? []
  const selected = accounts.find((b) => b.id === selectedId) ?? accounts[0] ?? null

  async function handleDelete(id: string) {
    await banksApi.delete(id)
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
    if (selectedId === id) setSelectedId(null)
  }

  async function handleVerify(id: string) {
    await banksApi.verify(id)
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
  }

  async function handleSetPrimary(id: string) {
    await banksApi.update(id, { isPrimary: true })
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
  }

  async function handleToggleRouting(id: string, key: 'receivePayments' | 'sendPayments', value: boolean) {
    await banksApi.update(id, { [key]: value })
    await queryClient.invalidateQueries({ queryKey: ['banks'] })
  }

  const pendingCount = accounts.filter((b) => !b.verified).length
  const verifiedCount = accounts.filter((b) => b.verified).length

  if (isLoading) return <div style={{ padding: '48px 0', display: 'flex', justifyContent: 'center' }}><Spinner /></div>
  if (isError) return <ErrorMessage />

  return (
    <main className={styles.root}>
      <div className={styles.pageHead}>
        <h1>{fmt('bankAccount.title')}</h1>
        <p className={styles.sub}>
          {fmt('bankAccount.description')}{' '}
          {verifiedCount} verified{pendingCount > 0 ? ` · ${pendingCount} pending` : ''}
        </p>
      </div>

      {accounts.length === 0 ? (
        <EmptyState message={fmt('bankAccount.empty')} />
      ) : (
        <div className={styles.mdGrid}>
          <BankSidebar
            accounts={accounts}
            selectedId={selected?.id ?? null}
            page={page}
            totalPages={data?.totalPages ?? 1}
            onSelect={setSelectedId}
            onPageChange={setPage}
            onAddNew={() => setEditing('new')}
          />

          {selected && (
            <BankDetail
              bankId={selected.id}
              accounts={accounts}
              onEdit={(bank) => setEditing(bank)}
              onDelete={handleDelete}
              onVerify={handleVerify}
              onSetPrimary={handleSetPrimary}
              onToggleRouting={handleToggleRouting}
            />
          )}
        </div>
      )}

      <BankAccountForm
        bank={editing}
        onClose={() => setEditing(null)}
      />
    </main>
  )
}
