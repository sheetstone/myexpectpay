import { InboxIcon } from "@heroicons/react/24/outline"
import styles from "./EmptyState.module.css"

interface EmptyStateProps {
  message: string
  action?: React.ReactNode
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className={styles.root}>
      <InboxIcon className={styles.icon} width={48} height={48} aria-hidden />
      <p className={styles.message}>{message}</p>
      {action}
    </div>
  )
}
