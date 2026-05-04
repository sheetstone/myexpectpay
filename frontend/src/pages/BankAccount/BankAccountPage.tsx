import { useState } from 'react'
import { useIntl } from 'react-intl'
import type { BankAccount } from '../../types/api'
import { BankAccountList } from './BankAccountList'
import { BankAccountForm } from './BankAccountForm'
import styles from './BankAccountPage.module.css'

export function BankAccountPage() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [editing, setEditing] = useState<BankAccount | 'new' | null>(null)

  return (
    <main className={styles.root}>
      <div className={styles.titleRow}>
        <div>
          <h1 className={styles.title}>{fmt('bankAccount.title')}</h1>
          <p className={styles.description}>{fmt('bankAccount.description')}</p>
        </div>
        <button className={styles.addBtn} onClick={() => setEditing('new')}>
          {fmt('bankAccount.add')}
        </button>
      </div>

      <BankAccountList
        onEdit={(bank) => setEditing(bank)}
      />

      <BankAccountForm
        bank={editing}
        onClose={() => setEditing(null)}
      />
    </main>
  )
}
