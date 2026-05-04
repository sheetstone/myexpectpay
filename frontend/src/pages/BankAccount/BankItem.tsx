import { useEffect, useRef, useState } from 'react'
import { useIntl } from 'react-intl'
import type { BankAccount } from '../../types/api'
import { ConfirmDialog } from '../../components/ui'
import styles from './BankItem.module.css'

interface BankItemProps {
  bank: BankAccount
  onEdit: (bank: BankAccount) => void
  onDelete: (id: string) => void
  onVerify: (id: string) => void
}

export function BankItem({ bank, onEdit, onDelete, onVerify }: BankItemProps) {
  const intl = useIntl()
  const fmt = (id: string, values?: Record<string, string | number>) =>
    intl.formatMessage({ id }, values)

  const [menuOpen, setMenuOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [verifyOpen, setVerifyOpen] = useState(false)
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

  return (
    <div className={styles.card}>
      <div className={styles.body}>
        <span className={styles.bankName}>{bank.bankName}</span>
        <div className={styles.meta}>
          <span className={styles.accountType}>
            {fmt(`bankAccount.${bank.accountType}`)}
          </span>
          <span className={styles.dot} aria-hidden>·</span>
          <span className={styles.accountNumber}>
            {fmt('bankAccount.accountEndingIn', { last4: bank.accountNumberLast4 })}
          </span>
        </div>
        <span className={bank.verified ? styles.badgeVerified : styles.badgePending}>
          {fmt(bank.verified ? 'bankAccount.verified' : 'bankAccount.unverified')}
        </span>
      </div>

      <div className={styles.menuWrap} ref={menuRef}>
        <button
          className={styles.menuToggle}
          aria-label="Account menu"
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
                onClick={() => { setMenuOpen(false); onEdit(bank) }}
              >
                {fmt('common.edit')}
              </button>
            </li>
            {!bank.verified && (
              <li role="none">
                <button
                  role="menuitem"
                  className={styles.menuItem}
                  onClick={() => { setMenuOpen(false); setVerifyOpen(true) }}
                >
                  {fmt('bankAccount.verify')}
                </button>
              </li>
            )}
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
        title={fmt('bankAccount.deleteTitle')}
        message={fmt('bankAccount.deleteConfirm')}
        confirmLabel={fmt('common.delete')}
        onConfirm={() => { setDeleteOpen(false); onDelete(bank.id) }}
        onCancel={() => setDeleteOpen(false)}
      />

      <ConfirmDialog
        open={verifyOpen}
        title={fmt('bankAccount.verify')}
        message={fmt('bankAccount.verifyConfirm')}
        confirmLabel={fmt('bankAccount.verify')}
        onConfirm={() => { setVerifyOpen(false); onVerify(bank.id) }}
        onCancel={() => setVerifyOpen(false)}
      />
    </div>
  )
}
