"use client"

import { useIntl } from "react-intl"
import { formatMoney } from "@/utils/formatMoney"
import type { BankStats } from "@/types"
import { formatActivityDate } from "../formatActivityDate"
import { RoutingTag } from "./RoutingTag"
import styles from "../bankAccounts.module.css"

interface BankStatsRowProps {
  stats: BankStats
  receivePayments: boolean
  sendPayments: boolean
}

export function BankStatsRow({ stats, receivePayments, sendPayments }: BankStatsRowProps) {
  const intl = useIntl()
  const t = (id: string, values?: Record<string, string | number>) => intl.formatMessage({ id }, values)

  return (
    <div className={styles.statsRow}>
      <div className={styles.statCell}>
        <span className={styles.statLabel}>{t("dashboard.totalReceived")}</span>
        <span className={styles.statValue}>{formatMoney(stats.totalReceived)}</span>
      </div>
      <div className={styles.statCell}>
        <span className={styles.statLabel}>{t("dashboard.totalSent")}</span>
        <span className={styles.statValue}>{formatMoney(stats.totalSent)}</span>
      </div>
      <div className={styles.statCell}>
        <span className={styles.statLabel}>{t("bankAccount.linkedCases")}</span>
        <span className={styles.statValueSm}>{stats.linkedCases}</span>
        <span className={styles.statSub}>
          {t("bankAccount.activeCases", { count: stats.linkedCases })}
        </span>
      </div>
      <div className={styles.statCell}>
        <span className={styles.statLabel}>{t("bankAccount.usedFor")}</span>
        <span className={styles.statValueSm}>
          <RoutingTag receive={receivePayments} send={sendPayments} />
        </span>
        <span className={styles.statSub}>
          {t("bankAccount.lastActivity")}{" "}
          {stats.lastActivity ? formatActivityDate(stats.lastActivity) : t("bankAccount.noActivity")}
        </span>
      </div>
    </div>
  )
}
