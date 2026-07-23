"use client"

import { useIntl } from "react-intl"
import { PlusIcon } from "@heroicons/react/24/outline"
import { Pagination } from "@/components/ui"
import type { BankAccount } from "@/types"
import styles from "../bankAccounts.module.css"

interface BankSidebarProps {
  accounts: BankAccount[]
  selectedId: string | null
  onSelect: (id: string) => void
  onAddNew: () => void
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function BankSidebar({
  accounts, selectedId, onSelect, onAddNew, page, totalPages, onPageChange,
}: BankSidebarProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarList}>
        <div className={styles.sidebarHead}>
          <p className={styles.sidebarTitle}>{t("bankAccount.linkedAccounts")}</p>
          <span className={styles.sidebarCount}>{accounts.length}</span>
        </div>
        {accounts.length === 0 ? (
          <p className={styles.sidebarEmpty}>{t("bankAccount.empty")}</p>
        ) : (
          <ul className={styles.accountList}>
            {accounts.map((account) => {
              const isSelected = (selectedId ?? accounts[0]?.id) === account.id
              const initial = (account.nickname ?? account.bankName).charAt(0).toUpperCase()
              return (
                <li
                  key={account.id}
                  className={`${styles.accountItem}${isSelected ? ` ${styles.selected}` : ""}`}
                  onClick={() => onSelect(account.id)}
                >
                  <div className={styles.accountInitial}>{initial}</div>
                  <div>
                    <div className={styles.accountName}>{account.nickname ?? account.bankName}</div>
                    <div className={styles.accountSub}>
                      {t(`bankAccount.${account.accountType}`)} &middot; &bull;&bull;&bull;&bull;{account.accountNumberLast4}
                    </div>
                  </div>
                  <span className={`${styles.pill} ${account.verified ? styles.pillVerified : styles.pillPending}`}>
                    {account.verified ? t("bankAccount.verified") : "Pending"}
                  </span>
                </li>
              )
            })}
          </ul>
        )}
        {totalPages > 1 && (
          <div className={styles.sidebarPagination}>
            <Pagination page={page} totalPages={totalPages} onPageChange={onPageChange} />
          </div>
        )}
      </div>
      <button className={styles.addBtnSidebar} onClick={onAddNew}>
        <PlusIcon width={14} height={14} />
        {t("bankAccount.add")}
      </button>
    </aside>
  )
}
