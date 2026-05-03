import { useIntl } from 'react-intl'

export function ProfilePage() {
  const intl = useIntl()
  return (
    <main style={{ padding: 'var(--space-8)', maxWidth: 'var(--content-max-w)', margin: '0 auto' }}>
      <h1>{intl.formatMessage({ id: 'profile.title' })}</h1>
    </main>
  )
}
