import { ExclamationCircleIcon } from '@heroicons/react/24/outline'
import { useIntl } from 'react-intl'

interface ErrorMessageProps {
  message?: string
}

export function ErrorMessage({ message }: ErrorMessageProps) {
  const intl = useIntl()
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-danger)', fontSize: 'var(--text-sm)' }}>
      <ExclamationCircleIcon width={16} height={16} aria-hidden />
      <span>{message ?? intl.formatMessage({ id: 'common.error' })}</span>
    </div>
  )
}
