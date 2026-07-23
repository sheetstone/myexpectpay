"use client"

import { useIntl } from "react-intl"
import styles from "../bankAccounts.module.css"

interface RoutingRulesSectionProps {
  receivePayments: boolean
  sendPayments: boolean
  onToggle: (field: "receivePayments" | "sendPayments", value: boolean) => void
}

export function RoutingRulesSection({ receivePayments, sendPayments, onToggle }: RoutingRulesSectionProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className={styles.section}>
      <p className={styles.sectionTitle}>{t("bankAccount.routingRules")}</p>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleLabelMain}>{t("bankAccount.receivePayments")}</span>
          <span className={styles.toggleLabelSub}>{t("bankAccount.receivePaymentsDesc")}</span>
        </span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={receivePayments}
            onChange={(e) => onToggle("receivePayments", e.target.checked)}
          />
          <span className={styles.toggleSlider} />
        </label>
      </div>
      <div className={styles.toggleRow}>
        <span className={styles.toggleLabel}>
          <span className={styles.toggleLabelMain}>{t("bankAccount.sendPayments")}</span>
          <span className={styles.toggleLabelSub}>{t("bankAccount.sendPaymentsDesc")}</span>
        </span>
        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={sendPayments}
            onChange={(e) => onToggle("sendPayments", e.target.checked)}
          />
          <span className={styles.toggleSlider} />
        </label>
      </div>
    </div>
  )
}
