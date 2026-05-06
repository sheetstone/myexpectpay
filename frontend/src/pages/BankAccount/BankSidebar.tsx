import type { BankAccount } from '../../types/api'
import { BankLogo } from '../../components/ui'
import { useFmt } from '../../hooks'
import styles from './BankSidebar.module.css'

interface BankSidebarProps {
  accounts: BankAccount[]
  selectedId: string | null
  page: number
  totalPages: number
  onSelect: (id: string) => void
  onPageChange: (page: number) => void
  onAddNew: () => void
}

export function BankSidebar({ accounts, selectedId, page, totalPages, onSelect, onPageChange, onAddNew }: BankSidebarProps) {
  const fmt = useFmt()

  return (
    <div className={styles.rail}>
      <div className={styles.list}>
        <div className={styles.listHead}>
          {fmt('bankAccount.linkedAccounts')}
          <span className={styles.count}>{accounts.length}</span>
        </div>

        {accounts.map((bank) => (
          <BankSidebarItem
            key={bank.id}
            bank={bank}
            selected={bank.id === selectedId}
            onClick={() => onSelect(bank.id)}
          />
        ))}

        {totalPages > 1 && (
          <div className={styles.pager}>
            <span>{accounts.length} total</span>
            <div className={styles.pages}>
              <button
                className={`${styles.pg} ${page === 1 ? styles.pgDisabled : ''}`}
                onClick={() => onPageChange(page - 1)}
              >‹</button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  className={`${styles.pg} ${i + 1 === page ? styles.pgActive : ''}`}
                  onClick={() => onPageChange(i + 1)}
                >{i + 1}</button>
              ))}
              <button
                className={`${styles.pg} ${page === totalPages ? styles.pgDisabled : ''}`}
                onClick={() => onPageChange(page + 1)}
              >›</button>
            </div>
          </div>
        )}
      </div>

      <button className={styles.addBtn} onClick={onAddNew}>
        <PlusIcon />
        {fmt('bankAccount.addAccount')}
      </button>
    </div>
  )
}

interface BankSidebarItemProps {
  bank: BankAccount
  selected: boolean
  onClick: () => void
}

function BankSidebarItem({ bank, selected, onClick }: BankSidebarItemProps) {
  const displayName = bank.nickname ?? bank.bankName

  return (
    <div
      className={`${styles.item} ${selected ? styles.selected : ''}`}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
    >
      <BankLogo bankName={bank.bankName} size="md" />

      <div className={styles.itemBody}>
        <div className={styles.itemNick}>
          {displayName}
          {bank.isPrimary && <span className={styles.star}>★</span>}
        </div>
        <div className={styles.itemMeta}>
          {bank.accountType === 'checking' ? 'Checking' : 'Savings'} · ··{bank.accountNumberLast4}
        </div>
      </div>

      <span className={`${styles.pill} ${bank.verified ? styles.pillVerified : styles.pillPending}`}>
        {bank.verified ? 'Verified' : 'Pending'}
      </span>
    </div>
  )
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
      strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}
