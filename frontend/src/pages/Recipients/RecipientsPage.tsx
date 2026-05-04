import { useState } from 'react'
import { useIntl } from 'react-intl'
import type { Recipient } from '../../types/api'
import { RecipientList } from './RecipientList'
import { RecipientForm } from './RecipientForm'
import styles from './RecipientsPage.module.css'

export function RecipientsPage() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [editing, setEditing] = useState<Recipient | 'new' | null>(null)

  return (
    <main className={styles.root}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{fmt('recipients.title')}</h1>
        <button className={styles.addBtn} onClick={() => setEditing('new')}>
          {fmt('recipients.add')}
        </button>
      </div>

      <RecipientList onEdit={(r) => setEditing(r)} />

      <RecipientForm
        recipient={editing}
        onClose={() => setEditing(null)}
      />
    </main>
  )
}
