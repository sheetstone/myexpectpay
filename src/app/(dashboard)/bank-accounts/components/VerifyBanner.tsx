"use client"

import { useIntl } from "react-intl"
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline"
import styles from "../bankAccounts.module.css"

interface VerifyBannerProps {
  onVerify: () => void
  isPending: boolean
}

export function VerifyBanner({ onVerify, isPending }: VerifyBannerProps) {
  const intl = useIntl()
  const t = (id: string) => intl.formatMessage({ id })

  return (
    <div className={styles.verifyBanner}>
      <div className={styles.verifyBannerIcon}>
        <ExclamationTriangleIcon width={16} height={16} />
      </div>
      <div className={styles.verifyBannerText}>
        <div className={styles.verifyBannerTitle}>{t("bankAccount.verifyBannerTitle")}</div>
        <div className={styles.verifyBannerDesc}>{t("bankAccount.verifyBannerDesc")}</div>
      </div>
      <button className={styles.verifyBtn} onClick={onVerify} disabled={isPending}>
        {t("bankAccount.verify")}
      </button>
    </div>
  )
}
