import { useIntl } from 'react-intl'
import styles from './ConfirmDialog.module.css'

interface ConfirmDialogProps {
  open: boolean
  title: string
  message: string
  onConfirm: () => void
  onCancel: () => void
  confirmLabel?: string
}

export function ConfirmDialog({
  open,
  title,
  message,
  onConfirm,
  onCancel,
  confirmLabel,
}: ConfirmDialogProps) {
  const intl = useIntl()
  if (!open) return null

  return (
    <div className={styles.backdrop} onClick={onCancel}>
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal
        aria-labelledby="confirm-title"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-title" className={styles.title}>{title}</h2>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button className={styles.cancel} onClick={onCancel}>
            {intl.formatMessage({ id: 'common.cancel' })}
          </button>
          <button className={styles.confirm} onClick={onConfirm}>
            {confirmLabel ?? intl.formatMessage({ id: 'common.confirm' })}
          </button>
        </div>
      </div>
    </div>
  )
}
