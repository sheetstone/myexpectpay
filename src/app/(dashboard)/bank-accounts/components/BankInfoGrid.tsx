"use client"

import { useIntl } from "react-intl"
import type { BankAccount } from "@/types"
import { RoutingTag } from "./RoutingTag"
import styles from "../bankAccounts.module.css"

interface BankInfoGridProps {
  bank: BankAccount
}

export function BankInfoGrid({ bank }: BankInfoGridProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className={styles.infoGrid}>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>{t("bankAccount.bankName")}</span>
        <span className={styles.infoValue}>{bank.bankName}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>{t("bankAccount.accountType")}</span>
        <span className={styles.infoValue}>{t(`bankAccount.${bank.accountType}`)}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>{t("bankAccount.routingNumber")}</span>
        <span className={styles.infoValue}>{bank.routingNumber}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>{t("bankAccount.accountNumber")}</span>
        <span className={styles.infoValue}>&bull;&bull;&bull;&bull; {bank.accountNumberLast4}</span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>Status</span>
        <span className={`${styles.badge} ${bank.verified ? styles.badgeVerified : styles.badgeUnverified}`}>
          {bank.verified ? t("bankAccount.verified") : t("bankAccount.unverified")}
        </span>
      </div>
      <div className={styles.infoItem}>
        <span className={styles.infoLabel}>{t("bankAccount.routingRules")}</span>
        <RoutingTag receive={bank.receivePayments} send={bank.sendPayments} />
      </div>
    </div>
  )
}
