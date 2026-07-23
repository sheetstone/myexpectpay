"use client"

import { useIntl } from "react-intl"
import Link from "next/link"
import { formatMoney } from "@/utils/formatMoney"
import type { CalendarEvent } from "@/types"
import { formatActivityDate } from "../formatActivityDate"
import styles from "../bankAccounts.module.css"

interface RecentTransactionsTableProps {
  payments: CalendarEvent[]
}

export function RecentTransactionsTable({ payments }: RecentTransactionsTableProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{t("bankAccount.recentTransactions")}</p>
      {payments.length === 0 ? (
        <p className={styles.txEmpty}>{t("bankAccount.noTransactions")}</p>
      ) : (
        <>
          <table className={styles.txTable}>
            <thead>
              <tr>
                <th>{t("payments.paymentDate")}</th>
                <th>{t("payments.caseNumber")}</th>
                <th>{t("payments.type")}</th>
                <th className={styles.txAmtHeader}>{t("payments.amount")}</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((tx) => {
                const isReceive = tx.type === "received" || tx.type === "pending_received"
                return (
                  <tr key={tx.id}>
                    <td>{formatActivityDate(tx.paymentDate)}</td>
                    <td>{tx.caseNumber || "—"}</td>
                    <td>
                      <span className={`${styles.txType}${isReceive ? ` ${styles.txTypeReceived}` : ` ${styles.txTypeSent}`}`}>
                        {isReceive ? t("payments.typeReceived") : t("payments.typeSent")}
                      </span>
                    </td>
                    <td className={`${styles.txAmt}${isReceive ? ` ${styles.txAmtReceived}` : ` ${styles.txAmtSent}`}`}>
                      {isReceive ? "+" : "−"}{formatMoney(tx.amount)}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className={styles.txFoot}>
            <Link href="/payments" className={styles.txLink}>
              {t("bankAccount.viewAllPayments")}
            </Link>
          </div>
        </>
      )}
    </div>
  )
}
