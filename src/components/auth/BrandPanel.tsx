"use client"

import { useIntl } from "react-intl"
import { CheckCircleIcon } from "@heroicons/react/24/solid"
import styles from "./BrandPanel.module.css"

export function BrandPanel() {
  const intl = useIntl()

  return (
    <aside className={styles.panel} aria-hidden>
      <div className={styles.logo}>MyExpertPay</div>

      <ul className={styles.features}>
        {(["auth.feature1", "auth.feature2", "auth.feature3"] as const).map((key) => (
          <li key={key} className={styles.feature}>
            <CheckCircleIcon className={styles.check} />
            <span>{intl.formatMessage({ id: key })}</span>
          </li>
        ))}
      </ul>

      <p className={styles.footer}>
        {intl.formatMessage(
          { id: "footer.copyright" },
          { year: new Date().getFullYear() },
        )}
      </p>
    </aside>
  )
}
