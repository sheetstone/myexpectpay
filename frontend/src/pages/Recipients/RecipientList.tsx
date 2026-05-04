import { useEffect, useRef, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useIntl } from 'react-intl'
import { recipientsApi } from '../../api/recipientsApi'
import { PAGE_SIZE } from '../../constants'
import type { Recipient } from '../../types/api'
import { Spinner, EmptyState, ErrorMessage, Pagination, ConfirmDialog, useToast } from '../../components/ui'
import styles from './RecipientList.module.css'

// ── RecipientCard ─────────────────────────────────────────────────────────────

interface RecipientCardProps {
  recipient: Recipient
  caseNumber: string | null
  onEdit: (r: Recipient) => void
  onDelete: (id: string) => void
}

function RecipientCard({ recipient, caseNumber, onEdit, onDelete }: RecipientCardProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!menuOpen) return
    function handleOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutside)
    return () => document.removeEventListener('mousedown', handleOutside)
  }, [menuOpen])

  const fullName = `${recipient.firstName} ${recipient.lastName}`

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <span className={styles.name}>{fullName}</span>
        <div className={styles.meta}>
          <span>{recipient.email}</span>
          {caseNumber && (
            <>
              <span className={styles.sep} aria-hidden>·</span>
              <span>{intl.formatMessage({ id: 'recipients.linkedCase' })}: {caseNumber}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.menuWrap} ref={menuRef}>
        <button
          className={styles.menuToggle}
          aria-label={fmt('recipients.edit')}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((o) => !o)}
        >
          <span className={styles.dot3} />
          <span className={styles.dot3} />
          <span className={styles.dot3} />
        </button>

        {menuOpen && (
          <ul className={styles.dropdown} role="menu">
            <li role="none">
              <button
                role="menuitem"
                className={styles.menuItem}
                onClick={() => { setMenuOpen(false); onEdit(recipient) }}
              >
                {fmt('common.edit')}
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => { setMenuOpen(false); setDeleteOpen(true) }}
              >
                {fmt('common.delete')}
              </button>
            </li>
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title={fmt('recipients.deleteTitle')}
        message={fmt('recipients.deleteConfirm')}
        confirmLabel={fmt('common.delete')}
        onConfirm={() => { setDeleteOpen(false); onDelete(recipient.id) }}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  )
}

// ── RecipientList ─────────────────────────────────────────────────────────────

interface RecipientListProps {
  onEdit: (r: Recipient) => void
}

export function RecipientList({ onEdit }: RecipientListProps) {
  const intl = useIntl()
  const fmt = (id: string) => intl.formatMessage({ id })
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
    return <EmptyState message={fmt('recipients.empty')} />
  }

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
