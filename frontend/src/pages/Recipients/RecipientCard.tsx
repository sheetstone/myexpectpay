import { useRef } from 'react'
import type { Recipient } from '../../types/api'
import { ConfirmDialog } from '../../components/ui'
import { useDisclosure, useClickOutside, useFmt } from '../../hooks'
import styles from './RecipientList.module.css'

interface RecipientCardProps {
  recipient: Recipient
  caseNumber: string | null
  onEdit: (r: Recipient) => void
  onDelete: (id: string) => void
}

export function RecipientCard({ recipient, caseNumber, onEdit, onDelete }: RecipientCardProps) {
  const fmt = useFmt()
  const menu = useDisclosure()
  const deleteDialog = useDisclosure()
  const menuRef = useRef<HTMLDivElement>(null)

  useClickOutside(menuRef, menu.close, menu.isOpen)

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
              <span>{fmt('recipients.linkedCase')}: {caseNumber}</span>
            </>
          )}
        </div>
      </div>

      <div className={styles.menuWrap} ref={menuRef}>
        <button
          className={styles.menuToggle}
          aria-label={fmt('recipients.edit')}
          aria-expanded={menu.isOpen}
          onClick={menu.toggle}
        >
          <span className={styles.dot3} />
          <span className={styles.dot3} />
          <span className={styles.dot3} />
        </button>

        {menu.isOpen && (
          <ul className={styles.dropdown} role="menu">
            <li role="none">
              <button
                role="menuitem"
                className={styles.menuItem}
                onClick={() => { menu.close(); onEdit(recipient) }}
              >
                {fmt('common.edit')}
              </button>
            </li>
            <li role="none">
              <button
                role="menuitem"
                className={`${styles.menuItem} ${styles.menuItemDanger}`}
                onClick={() => { menu.close(); deleteDialog.open() }}
              >
                {fmt('common.delete')}
              </button>
            </li>
          </ul>
        )}
      </div>

      <ConfirmDialog
        open={deleteDialog.isOpen}
        title={fmt('recipients.deleteTitle')}
        message={fmt('recipients.deleteConfirm')}
        confirmLabel={fmt('common.delete')}
        onConfirm={() => { deleteDialog.close(); onDelete(recipient.id) }}
        onCancel={deleteDialog.close}
      />
    </div>
  )
}
