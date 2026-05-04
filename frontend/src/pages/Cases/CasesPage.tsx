import { useState } from 'react'
import { useIntl } from 'react-intl'
import type { Case } from '../../types/api'
import { CasesList } from './CasesList'
import { CaseForm } from './CaseForm'
import styles from './CasesPage.module.css'

export function CasesPage() {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [editing, setEditing] = useState<Case | 'new' | null>(null)

  return (
    <main className={styles.root}>
      <div className={styles.titleRow}>
        <h1 className={styles.title}>{fmt('cases.title')}</h1>
        <button className={styles.addBtn} onClick={() => setEditing('new')}>
          {fmt('cases.add')}
        </button>
      </div>

      <CasesList onEdit={(c) => setEditing(c)} />

      <CaseForm
        editCase={editing}
        onClose={() => setEditing(null)}
      />
    </main>
  )
}
